import { useSyncExternalStore } from "react";
import {
  getCategory,
  seedArticles,
  type Article,
  type Category,
  type SiteId,
} from "@/data/news";

// 記事の読み書きはすべてここを通す。保存先はブラウザの localStorage で、
// 未保存のあいだと、サーバーでの描画やハイドレーションのときは初期記事を返す。

const STORAGE_KEY = "rheuma-demo:articles";

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

function parse(raw: string | null): Article[] {
  if (raw === null) return seedArticles;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedArticles;
  } catch {
    return seedArticles;
  }
}

// useSyncExternalStore は値が変わると再描画するので、保存内容が同じあいだは同じ配列を返す。
let cachedRaw: string | null = null;
let cachedArticles = seedArticles;

function getArticles() {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedArticles = parse(raw);
  }
  return cachedArticles;
}

function getSeedArticles() {
  return seedArticles;
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

/** すべての記事を返す。投稿画面用で、公開前の記事も含む。 */
export function useArticles() {
  return useSyncExternalStore(subscribe, getArticles, getSeedArticles);
}

export type SiteArticle = Article & { category: Category & { id: string } };

/** そのサイトに載っている公開済みの記事を、新しい順に返す。 */
export function useSiteArticles(site: SiteId): SiteArticle[] {
  const articles = useArticles();
  const today = useSyncExternalStore(subscribeToNothing, getToday, getNoDate);

  return articles
    .flatMap((article) => {
      const categoryId = article.placements[site];
      const category = categoryId && getCategory(site, categoryId);
      if (!category || (today && article.publishedAt > today)) return [];
      return [{ ...article, category: { ...category, id: categoryId } }];
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
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

function write(articles: Article[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  notify();
}

/** 記事を保存する。同じIDがあれば置き換え、なければ先頭に足す。 */
export function saveArticle(article: Article) {
  const articles = getArticles();
  const exists = articles.some((item) => item.id === article.id);
  write(
    exists
      ? articles.map((item) => (item.id === article.id ? article : item))
      : [article, ...articles],
  );
}

export function deleteArticle(id: string) {
  write(getArticles().filter((item) => item.id !== id));
}

/** 保存した内容を消して、初期記事に戻す。 */
export function resetArticles() {
  window.localStorage.removeItem(STORAGE_KEY);
  notify();
}
