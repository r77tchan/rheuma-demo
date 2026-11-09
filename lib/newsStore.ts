import { useSyncExternalStore } from "react";
import {
  getCategory,
  seedArticles,
  type Article,
  type Category,
  type Placements,
  type SiteId,
} from "@/data/news";
import { extractFileIds } from "./bodyHtml";
import { clearFiles, deleteUnusedFiles } from "./fileStore";

// 記事の読み書きはすべてここを通す。保存先はブラウザの localStorage（本文の画像とPDFは IndexedDB。lib/fileStore.ts）。
// 保存するのは初期記事との差分（追加、編集した記事と、削除した初期記事のID）だけにして、
// 後から初期記事を足しても表示されるようにする。
// 未保存のあいだと、サーバーでの描画やハイドレーションのときは初期記事を返す。

/** 保存形式を変えたら番号を上げ、前のキーを OLD_KEYS に足す。古い形式のデータは読まずに捨てる（移す処理は作らない）。 */
const STORAGE_KEY = "rheuma-demo:news:v1";
const OLD_KEYS = ["rheuma-demo:articles"];

/** 投稿画面で追加した記事のIDは、ここから順に付ける。初期状態に戻すと、また1000から付ける。 */
const FIRST_ID = 1000;
const MAX_ID = 999_999_999;

type StoredNews = {
  /** 投稿画面で追加した記事と、編集した初期記事。 */
  articles: Article[];
  /** 削除した初期記事のID。 */
  deletedIds: string[];
  /** 次に追加する記事のID。 */
  nextId: number;
};

const EMPTY: StoredNews = { articles: [], deletedIds: [], nextId: FIRST_ID };

const seedById = new Map(seedArticles.map((article) => [article.id, article]));

const SITE_IDS: SiteId[] = ["main", "rheuma", "senmon"];
const ID_PATTERN = /^[1-9][0-9]{0,8}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LINK_PATTERN = /^https?:\/\//i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 保存できる記事の形の定義。知っている項目だけを取り出し、おかしな記事は null を返す。
 * 想定外の値がそのまま画面に渡ると、描画が落ちてページ全体が出なくなるため、読むときも保存するときも通す。
 * 記事に項目や種類を足すときは、ここと STORAGE_KEY の番号も一緒に変える（足し忘れると、その項目は次の保存で消える）。
 */
export function parseArticle(value: unknown): Article | null {
  if (!isRecord(value)) return null;
  const { id, title, publishedAt, placements, kind } = value;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return null;
  if (typeof title !== "string") return null;
  if (typeof publishedAt !== "string" || !DATE_PATTERN.test(publishedAt)) return null;
  if (!isRecord(placements)) return null;

  // 掲載先は、存在するサイトとカテゴリの組み合わせだけを残す
  const validPlacements: Partial<Record<SiteId, string>> = {};
  for (const site of SITE_IDS) {
    const categoryId = placements[site];
    if (typeof categoryId === "string" && getCategory(site, categoryId)) {
      validPlacements[site] = categoryId;
    }
  }
  const base = { id, title, publishedAt, placements: validPlacements as Placements };

  if (kind === "body" && typeof value.bodyHtml === "string") {
    return { ...base, kind, bodyHtml: value.bodyHtml };
  }
  if (kind === "link" && typeof value.linkUrl === "string" && LINK_PATTERN.test(value.linkUrl)) {
    return { ...base, kind, linkUrl: value.linkUrl };
  }
  return null;
}

/** 2つの記事の中身が同じか。初期記事を何も変えずに保存したときに、差分として残さないために使う。 */
function isSameArticle(a: Article, b: Article) {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.publishedAt === b.publishedAt &&
    SITE_IDS.every((site) => a.placements[site] === b.placements[site]) &&
    (a.kind === "body"
      ? b.kind === "body" && a.bodyHtml === b.bodyHtml
      : b.kind === "link" && a.linkUrl === b.linkUrl)
  );
}

function parse(raw: string | null): StoredNews {
  if (raw === null) return EMPTY;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!isRecord(parsed)) return EMPTY;

  const articles: Article[] = [];
  const seen = new Set<string>();
  for (const item of Array.isArray(parsed.articles) ? parsed.articles : []) {
    const article = parseArticle(item);
    if (!article || seen.has(article.id)) continue;
    seen.add(article.id);
    articles.push(article);
  }

  const deletedIds = Array.isArray(parsed.deletedIds)
    ? parsed.deletedIds.filter((id): id is string => typeof id === "string" && seedById.has(id))
    : [];

  // 保存された値が壊れていても、使用中のIDと重ならず、IDとして使える範囲に収める
  const savedNextId =
    Number.isSafeInteger(parsed.nextId) && (parsed.nextId as number) <= MAX_ID ? (parsed.nextId as number) : 0;
  const nextId = Math.max(FIRST_ID, savedNextId, ...articles.map((article) => Number(article.id) + 1));

  return { articles, deletedIds, nextId };
}

/** 初期記事に保存データを重ねる。追加した記事は先頭に置く。 */
function merge(stored: StoredNews): Article[] {
  if (stored === EMPTY) return seedArticles;
  const edited = new Map(stored.articles.map((article) => [article.id, article]));
  const deleted = new Set(stored.deletedIds);
  return [
    ...stored.articles.filter((article) => !seedById.has(article.id)),
    ...seedArticles
      .filter((article) => !deleted.has(article.id))
      .map((article) => edited.get(article.id) ?? article),
  ];
}

/** プレビューの下書きを重ねる。同じIDの記事があれば置き換え、なければ先頭に足す。 */
function withDraft(articles: Article[], draft: Article | null) {
  if (!draft) return articles;
  return articles.some((article) => article.id === draft.id)
    ? articles.map((article) => (article.id === draft.id ? draft : article))
    : [draft, ...articles];
}

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // 別のタブで保存されたときも反映する
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** プレビューの iframe の中でだけ使う、保存前の記事。 */
let previewDraft: Article | null = null;

// useSyncExternalStore は値が変わると再描画するので、保存内容と下書きが同じあいだは同じ値を返す。
let cachedRaw: string | null = null;
let cachedStored = EMPTY;
let cachedEditedIds: ReadonlySet<string> = new Set();
let mergedStored = EMPTY;
let mergedDraft: Article | null = null;
let cachedArticles: Article[] = seedArticles;

function readStored() {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedStored = parse(raw);
    cachedEditedIds = new Set(cachedStored.articles.map((article) => article.id));
  }
  return cachedStored;
}

function getArticles(): readonly Article[] {
  const stored = readStored();
  if (stored !== mergedStored || previewDraft !== mergedDraft) {
    mergedStored = stored;
    mergedDraft = previewDraft;
    cachedArticles = withDraft(merge(stored), previewDraft);
  }
  return cachedArticles;
}

function getSeedArticles(): readonly Article[] {
  return seedArticles;
}

function getEditedIds() {
  readStored();
  return cachedEditedIds;
}

const noEditedIds: ReadonlySet<string> = new Set();

function getNoEditedIds() {
  return noEditedIds;
}

/** 今日の日付（YYYY-MM-DD）。ビルド時の描画では時刻を読めないので、ブラウザでだけ取得する。 */
function getToday() {
  return new Date().toLocaleDateString("sv-SE");
}

function getNoDate() {
  return null;
}

function subscribeToNothing() {
  return () => {};
}

/** 今日の日付（YYYY-MM-DD）。投稿画面で、公開日の初期値に使う。サーバーでの描画とハイドレーションのあいだは null。 */
export function useToday() {
  return useSyncExternalStore(subscribeToNothing, getToday, getNoDate);
}

/** 新しい順に並べる。公開日が同じなら、IDの大きい（後から作った）ほうが先。 */
export function compareNewest(a: Article, b: Article) {
  return b.publishedAt.localeCompare(a.publishedAt) || Number(b.id) - Number(a.id);
}

/** すべての記事を返す。並びは決まっていない（並べるときは toSorted を使う）。 */
export function useArticles() {
  return useSyncExternalStore(subscribe, getArticles, getSeedArticles);
}

/** 保存データに入っている記事のID（追加した記事と、編集した初期記事）。 */
export function useEditedIds() {
  return useSyncExternalStore(subscribe, getEditedIds, getNoEditedIds);
}

/** 初期記事のIDか。追加した記事と、編集した初期記事を見分けるために使う。 */
export function isSeedId(id: string) {
  return seedById.has(id);
}

export type SiteArticle = Article & { category: Category & { id: string } };

/** そのサイトに載っている記事を、新しい順に返す。予約投稿は作らないので、未来の日付の記事もそのまま出す。 */
export function useSiteArticles(site: SiteId): SiteArticle[] {
  const articles = useArticles();

  return articles
    .flatMap((article) => {
      const categoryId = article.placements[site];
      const category = categoryId && getCategory(site, categoryId);
      if (!category) return [];
      return [{ ...article, category: { ...category, id: categoryId } }];
    })
    .sort(compareNewest);
}

function getTrue() {
  return true;
}

function getFalse() {
  return false;
}

/** ブラウザのデータを読める状態になったかを返す。読む前に「記事がない」と判定しないために使う。 */
export function useHydrated() {
  return useSyncExternalStore(subscribeToNothing, getTrue, getFalse);
}

/**
 * プレビューの下書きを差し込む。iframe の中のページで、親から受け取った記事を渡す。null で外す。
 * 受け取った値は信用せず、保存するときと同じチェックを通す。通らなければ false。
 */
export function setPreviewDraft(value: unknown) {
  const draft = value === null ? null : parseArticle(value);
  if (value !== null && !draft) return false;
  previewDraft = draft;
  notify();
  return true;
}

export type SaveResult =
  | { ok: true; id: string }
  /** invalid: 入力が保存できる形でない / not-found: 記事がない（別のタブで削除されたなど） / storage: 保存に失敗した */
  | { ok: false; reason: "invalid" | "not-found" | "storage" };

/** 保存する。容量の上限に達したときや、保存が許可されていないときは false。 */
function write(stored: StoredNews) {
  // 古い形式のデータは捨てるので、容量を空けるために先に消す
  for (const key of OLD_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    return false;
  }
  notify();
  cleanUpFiles();
  return true;
}

/**
 * どの記事も使っていない画像とPDFを消す（終わるのは待たない）。別のタブで保存した記事も localStorage にあるので数に入る。
 * 入力中でまだ保存していない画像は、取り込んでから24時間は消さない（lib/fileStore.ts の KEEP_UNUSED_MS）。
 */
function cleanUpFiles() {
  const used = new Set(
    merge(readStored()).flatMap((article) => (article.kind === "body" ? extractFileIds(article.bodyHtml) : [])),
  );
  void deleteUnusedFiles(used);
}

/**
 * 次に追加する記事のID。プレビューのURLに使う。別のタブで先に追加されると、実際に付くIDは変わる。
 * 押したときの処理や useEffect の中でだけ呼ぶ。描画の中で呼ぶと、サーバーとブラウザで値が違い、表示がずれる。
 */
export function getNextArticleId() {
  return String(readStored().nextId);
}

function getFirstId() {
  return String(FIRST_ID);
}

/** 次に追加する記事のID（getNextArticleId）を、描画の中で使うためのフック。 */
export function useNextArticleId() {
  return useSyncExternalStore(subscribe, getNextArticleId, getFirstId);
}

type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;

/** 追加するときに渡す記事（IDはストアが付ける）。 */
export type ArticleInput = WithoutId<Article>;

/** 記事を追加する。成功したら付けたIDを返す。 */
export function addArticle(input: ArticleInput): SaveResult {
  const stored = readStored();
  const id = String(stored.nextId);
  const article = parseArticle({ ...input, id });
  if (!article) return { ok: false, reason: "invalid" };
  const saved = write({ ...stored, articles: [article, ...stored.articles], nextId: stored.nextId + 1 });
  return saved ? { ok: true, id } : { ok: false, reason: "storage" };
}

/** 記事を更新する（初期記事の編集も含む）。初期記事と同じ中身に戻したときは、編集していない扱いにする。 */
export function updateArticle(input: Article): SaveResult {
  const article = parseArticle(input);
  if (!article) return { ok: false, reason: "invalid" };

  const stored = readStored();
  const { id } = article;
  const isStored = stored.articles.some((item) => item.id === id);
  const seed = stored.deletedIds.includes(id) ? undefined : seedById.get(id);
  if (!isStored && !seed) return { ok: false, reason: "not-found" };

  const others = stored.articles.filter((item) => item.id !== id);
  const articles =
    seed && isSameArticle(article, seed)
      ? others
      : isStored
        ? stored.articles.map((item) => (item.id === id ? article : item))
        : [article, ...stored.articles];
  return write({ ...stored, articles }) ? { ok: true, id } : { ok: false, reason: "storage" };
}

/** 記事を削除する。初期記事は、削除したIDとして覚えておく。 */
export function deleteArticle(id: string): SaveResult {
  const stored = readStored();
  const isStored = stored.articles.some((item) => item.id === id);
  const isSeed = seedById.has(id) && !stored.deletedIds.includes(id);
  if (!isStored && !isSeed) return { ok: false, reason: "not-found" };

  const saved = write({
    ...stored,
    articles: stored.articles.filter((article) => article.id !== id),
    deletedIds: isSeed ? [...stored.deletedIds, id] : stored.deletedIds,
  });
  return saved ? { ok: true, id } : { ok: false, reason: "storage" };
}

/**
 * 保存した内容（記事と、画像とPDF）を消して、初期状態に戻す。保存データが壊れていても使えるように、中身は読まない。
 * 記事を消せなかったときだけ false。ファイルを消せなくても、どの記事からも使われないので、あとの掃除で消える。
 * ファイルを消すのは、応答がなければ数秒で待つのをやめる（エラー画面のボタンが止まったままにならないように）。
 */
export async function resetDemoData() {
  let ok = true;
  for (const key of [STORAGE_KEY, ...OLD_KEYS]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      ok = false;
    }
  }
  notify();
  await clearFiles();
  return ok;
}
