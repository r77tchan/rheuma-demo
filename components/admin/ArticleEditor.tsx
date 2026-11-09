"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { siteCategories, type Article, type Placements, type SiteId } from "@/data/news";
import { setFlash } from "@/lib/adminFlash";
import { isBodyEmpty } from "@/lib/bodyHtml";
import { FIRST_NEW_ID, LAST_NEW_ID } from "@/lib/staticPages";
import {
  addArticle,
  deleteArticle,
  updateArticle,
  useArticles,
  useHydrated,
  useNextArticleId,
  useToday,
  type ArticleInput,
  type SaveResult,
} from "@/lib/newsStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { AdminLink, useLeaveGuard } from "./LeaveGuard";
import { PreviewPane } from "./PreviewPane";
import {
  buttonClass,
  fieldClass,
  isEnter,
  SITE_IDS,
  siteArticleUrl,
  siteLabels,
  siteShortLabels,
} from "./ui";

// エディタ（Tiptap）は、「本文を書く」を選んだときだけ読み込む
const BodyEditor = dynamic(() => import("./BodyEditor").then((module) => module.BodyEditor), {
  ssr: false,
  loading: () => <p className="rounded-md border border-[#c3cad3] bg-white px-4 py-3 text-[#666]">読み込んでいます…</p>,
});

/**
 * 載せないことを表す値。どのサイトも、選択肢の先頭に「載せない」を置き、いつもどれか1つが選ばれている形にする。
 * 掲載先は自動では決めない（選んでいない欄が変わると分かりにくいため）。載せるサイトの枠は色を変え、載せ忘れに気づけるようにする。
 */
const NOT_PLACED = "none";

type FormState = {
  kind: Article["kind"];
  title: string;
  linkUrl: string;
  bodyHtml: string;
  publishedAt: string;
  /** サイトごとのカテゴリ。NOT_PLACED は載せない。 */
  sites: Record<SiteId, string>;
};

type FieldName = "title" | "linkUrl" | "bodyHtml" | "publishedAt" | "sites";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createForm(article: Article | undefined, today: string): FormState {
  if (!article) {
    return {
      kind: "link",
      title: "",
      linkUrl: "",
      bodyHtml: "",
      publishedAt: today,
      sites: { main: NOT_PLACED, rheuma: NOT_PLACED, senmon: NOT_PLACED },
    };
  }
  const { placements } = article;
  return {
    kind: article.kind,
    title: article.title,
    linkUrl: article.kind === "link" ? article.linkUrl : "",
    bodyHtml: article.kind === "body" ? article.bodyHtml : "",
    publishedAt: article.publishedAt,
    sites: {
      main: placements.main ?? NOT_PLACED,
      rheuma: placements.rheuma ?? NOT_PLACED,
      senmon: placements.senmon ?? NOT_PLACED,
    },
  };
}

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function validate(form: FormState) {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!form.title.trim()) errors.title = "タイトルを入力してください。";
  if (form.kind === "link") {
    const url = form.linkUrl.trim();
    if (!url) errors.linkUrl = "リンク先のURLを入力してください。";
    else if (!isHttpUrl(url) || !/^https?:\/\//i.test(url)) {
      errors.linkUrl = "http:// か https:// で始まるURLを入力してください。";
    }
  } else if (isBodyEmpty(form.bodyHtml)) {
    errors.bodyHtml = "本文を入力してください。";
  }
  if (!DATE_PATTERN.test(form.publishedAt)) errors.publishedAt = "公開日を入力してください。";
  if (!SITE_IDS.some((site) => form.sites[site] !== NOT_PLACED)) {
    errors.sites = "載せるサイトを1つ以上選んでください。";
  }
  return errors;
}

function toPlacements(form: FormState): Placements {
  const placements: Partial<Record<SiteId, string>> = {};
  for (const site of SITE_IDS) {
    if (form.sites[site] !== NOT_PLACED) placements[site] = form.sites[site];
  }
  // カテゴリの値は、画面に出した選択肢（siteCategories）からしか入らない
  return placements as Placements;
}

function toArticleInput(form: FormState): ArticleInput {
  const base = { title: form.title.trim(), publishedAt: form.publishedAt, placements: toPlacements(form) };
  return form.kind === "body"
    ? { ...base, kind: "body", bodyHtml: form.bodyHtml }
    : { ...base, kind: "link", linkUrl: form.linkUrl.trim() };
}

function toArticle(form: FormState, id: string) {
  return { ...toArticleInput(form), id } as Article;
}

/** プレビュー用の記事。入力の途中でも出せるよう、足りない項目は仮の値で埋める。 */
function toPreviewArticle(form: FormState, id: string, today: string): Article {
  const article = toArticle(form, id);
  const filled = {
    ...article,
    title: article.title || "（タイトル未入力）",
    publishedAt: DATE_PATTERN.test(article.publishedAt) ? article.publishedAt : today,
  };
  if (filled.kind === "link" && !isHttpUrl(filled.linkUrl)) return { ...filled, linkUrl: "https://example.com/" };
  return filled;
}

const saveErrorMessages: Record<Extract<SaveResult, { ok: false }>["reason"], string> = {
  invalid: "保存できない値が入っています。入力内容を見直してください。",
  "not-found": "この記事は削除されています。保存できませんでした。",
  storage: "保存できませんでした。ブラウザの保存容量がいっぱいか、保存が許可されていない可能性があります。",
  limit: `デモで追加できる記事は${LAST_NEW_ID - FIRST_NEW_ID + 1}件までです。「初期状態に戻す」を押すと、また追加できます。`,
};

/** 2つの記事の中身が同じか。開いたあとで記事が変わったか（別のタブで更新されたなど）を見るのに使う。 */
function isSameContent(a: Article | undefined, b: Article | undefined) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * 記事の新規作成（id なし）と編集。ブラウザに保存した記事を読むので、ハイドレーションのあとで描く。
 * 保存や削除をしたら入力欄を作り直す（ページは移動後も残るので、前の入力を残さないため）。
 */
export function ArticleEditor({ id }: { id?: string }) {
  const hydrated = useHydrated();
  const articles = useArticles();
  const today = useToday();
  const [version, setVersion] = useState(0);

  if (!hydrated || !today) return <p className="py-10 text-center text-[#666]">読み込んでいます…</p>;

  return (
    <EditorLoader
      key={version}
      id={id}
      article={id === undefined ? undefined : articles.find((article) => article.id === id)}
      today={today}
      onDone={() => setVersion((value) => value + 1)}
    />
  );
}

function EditorLoader({
  id,
  article,
  today,
  onDone,
}: {
  id: string | undefined;
  article: Article | undefined;
  today: string;
  onDone: () => void;
}) {
  // 開いた時点の記事で入力欄を作る。開いたあとで別のタブで削除されても、入力の途中なら消さず、保存するときに知らせる。
  const [source] = useState(article);
  const [initial] = useState(() => (id === undefined || source ? createForm(source, today) : null));
  // 開いたあとで記事が変わった（別のタブで更新、削除、初期化など）。入力の途中でなければ、今の記事で作り直す。
  // 入力画面は、一覧に戻ったあとも隠れて残る（Activity）ので、表示し直したときに古い記事のまま出さないため
  const changed = id !== undefined && !isSameContent(article, source);

  if (!initial) return <ArticleNotFound changed={changed} onDone={onDone} />;
  return <ArticleForm id={id} initial={initial} today={today} changed={changed} onDone={onDone} />;
}

function ArticleNotFound({ changed, onDone }: { changed: boolean; onDone: () => void }) {
  useEffect(() => {
    if (changed) onDone();
  }, [changed, onDone]);

  return (
    <div className="rounded-lg border border-[#dde2e8] bg-white px-6 py-10 text-center">
      <p>この記事は見つかりませんでした。削除された可能性があります。</p>
      <AdminLink href="/admin/" className={`${buttonClass.secondary} mt-4`}>
        記事一覧に戻る
      </AdminLink>
    </div>
  );
}

function ArticleForm({
  id,
  initial,
  today,
  changed,
  onDone,
}: {
  id: string | undefined;
  initial: FormState;
  today: string;
  /** 開いたあとで記事が変わったか。 */
  changed: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const nextId = useNextArticleId();
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(initial);
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // 本文の画像やPDFを取り込んでいる途中か
  const [uploading, setUploading] = useState(false);

  const isNew = id === undefined;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  // 取り込みの途中は、本文にまだ入っていなくても入力の途中として扱う
  const editing = dirty || uploading;
  useLeaveGuard(editing, onDone);

  useEffect(() => {
    if (changed && !editing) onDone();
  }, [changed, editing, onDone]);

  // 削除の確認は、ページが隠れたら閉じる（Activity で開いたまま残さない）
  useLayoutEffect(() => () => setConfirmingDelete(false), []);

  const errors = validate(form);
  const shownErrors = showErrors ? errors : {};
  const placedSites = SITE_IDS.filter((site) => form.sites[site] !== NOT_PLACED);
  const previewArticle = toPreviewArticle(form, id ?? nextId, today);

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setSaveError(null);
  };

  const selectSite = (site: SiteId, value: string) => {
    setForm((current) => ({ ...current, sites: { ...current.sites, [site]: value } }));
    setSaveError(null);
  };

  const finish = (message: string, links: { label: string; href: string }[]) => {
    setFlash({ message, links });
    onDone();
    router.push("/admin/");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    // 取り込みの途中で公開すると、その画像やPDFが抜けたまま保存される
    if (uploading) {
      setSaveError("画像やPDFを取り込んでいます。終わってから、もう一度押してください。");
      return;
    }
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      requestAnimationFrame(() =>
        formRef.current?.querySelector("[data-field-error]")?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
      return;
    }
    const input = toArticleInput(form);
    const result = id === undefined ? addArticle(input) : updateArticle(toArticle(form, id));
    if (!result.ok) {
      setSaveError(saveErrorMessages[result.reason]);
      return;
    }
    finish(
      `「${input.title}」を${isNew ? "公開" : "更新"}しました。`,
      placedSites.map((site) => ({
        label: `${siteShortLabels[site]}で見る`,
        href: siteArticleUrl(site, { id: result.id, kind: input.kind }),
      })),
    );
  };

  const remove = () => {
    if (!id) return;
    const result = deleteArticle(id);
    if (!result.ok && result.reason === "storage") {
      setDeleteError(saveErrorMessages.storage);
      return;
    }
    finish(`「${initial.title}」を削除しました。`, []);
  };

  const error = (name: FieldName) =>
    shownErrors[name] && (
      <p data-field-error className="mt-1.5 text-[14px] font-bold text-[#c62828]">
        {shownErrors[name]}
      </p>
    );

  return (
    <div className="pc:grid pc:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] pc:items-start pc:gap-6">
      <form
        ref={formRef}
        onSubmit={submit}
        // タイトルなどの欄で Enter を押しても、送信（公開、更新）しない。公開はボタンでだけ行う
        onKeyDown={(event) => {
          if (event.target instanceof HTMLInputElement && isEnter(event)) event.preventDefault();
        }}
        noValidate
        className="rounded-lg border border-[#dde2e8] bg-white p-5 tb:p-6"
      >
        <AdminLink href="/admin/" className="text-[14px] text-brand hover:underline">
          ← 記事一覧に戻る
        </AdminLink>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4">
          <h1 className="text-[22px] font-bold">{isNew ? "新規作成" : "記事の編集"}</h1>
          {!isNew && <span className="text-[13px] text-[#666]">ID: {id}</span>}
        </div>
        {isNew && Number(nextId) > LAST_NEW_ID && (
          <p className="mt-4 rounded-md bg-[#fdf2f2] px-4 py-3 font-bold text-[#c62828]">{saveErrorMessages.limit}</p>
        )}

        {/* 種類 */}
        <fieldset className="mt-6">
          <legend className="font-bold">種類</legend>
          <div className="mt-2 grid gap-2 tb:grid-cols-2">
            {(
              [
                ["link", "リンクだけ", "一覧のタイトルから、別のページやPDFへ直接飛びます。記事のページは作りません。"],
                ["body", "本文を書く", "記事のページを作ります。一覧のタイトルから、そのページへ飛びます。"],
              ] as const
            ).map(([kind, label, description]) => (
              <label
                key={kind}
                className={`flex cursor-pointer gap-2 rounded-md border p-3 ${
                  form.kind === kind ? "border-brand bg-[#f2f6fb]" : "border-[#c3cad3]"
                }`}
              >
                <input
                  type="radio"
                  name={`${fieldId}-kind`}
                  checked={form.kind === kind}
                  onChange={() => update({ kind })}
                  className="mt-1.5 accent-brand"
                />
                <span>
                  <span className="font-bold">{label}</span>
                  <span className="block text-[13px] text-[#555]">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* タイトル */}
        <div className="mt-6">
          <label htmlFor={`${fieldId}-title`} className="font-bold">
            タイトル
          </label>
          <input
            id={`${fieldId}-title`}
            type="text"
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
            className={`${fieldClass} mt-2`}
          />
          {error("title")}
        </div>

        {/* リンク先 / 本文 */}
        {form.kind === "link" ? (
          <div className="mt-6">
            <label htmlFor={`${fieldId}-link`} className="font-bold">
              リンク先のURL
            </label>
            <input
              id={`${fieldId}-link`}
              type="url"
              inputMode="url"
              placeholder="https://"
              value={form.linkUrl}
              onChange={(event) => update({ linkUrl: event.target.value })}
              className={`${fieldClass} mt-2`}
            />
            {error("linkUrl")}
          </div>
        ) : (
          <div className="mt-6">
            <p id={`${fieldId}-body`} className="font-bold">
              本文
            </p>
            <div className="mt-2">
              <BodyEditor
                value={form.bodyHtml}
                onChange={(bodyHtml) => update({ bodyHtml })}
                onBusyChange={setUploading}
                labelId={`${fieldId}-body`}
                invalid={Boolean(shownErrors.bodyHtml)}
              />
            </div>
            {error("bodyHtml")}
          </div>
        )}

        {/* 掲載先。どのサイトも「載せない」とカテゴリから1つを選ぶ */}
        <fieldset className="mt-8">
          <legend className="font-bold">載せるサイトとカテゴリ</legend>

          {SITE_IDS.map((site) => (
            <div
              key={site}
              role="radiogroup"
              aria-labelledby={`${fieldId}-${site}`}
              className={`mt-3 rounded-md border p-4 ${
                form.sites[site] === NOT_PLACED ? "border-[#dde2e8]" : "border-brand bg-[#f2f6fb]"
              }`}
            >
              <p id={`${fieldId}-${site}`} className="font-bold">
                {siteLabels[site]}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  [NOT_PLACED, "載せない"] as const,
                  ...Object.entries(siteCategories[site]).map(([value, category]) => [value, category.label] as const),
                ].map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name={`${fieldId}-${site}-category`}
                      checked={form.sites[site] === value}
                      onChange={() => selectSite(site, value)}
                      className="accent-brand"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {error("sites")}
        </fieldset>

        {/* 公開日 */}
        <div className="mt-8">
          <label htmlFor={`${fieldId}-date`} className="font-bold">
            公開日
          </label>
          <div className="mt-2">
            <input
              id={`${fieldId}-date`}
              type="date"
              value={form.publishedAt}
              onChange={(event) => update({ publishedAt: event.target.value })}
              className={`${fieldClass} w-auto`}
            />
          </div>
          {error("publishedAt")}
        </div>

        {/* 操作 */}
        {saveError && (
          <p role="alert" className="mt-8 rounded-md bg-[#fdf2f2] px-4 py-3 font-bold text-[#c62828]">
            {saveError}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#e3e7ec] pt-6">
          <button type="submit" className={buttonClass.primary}>
            {isNew ? "公開する" : "更新する"}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setConfirmingDelete(true);
              }}
              className={`${buttonClass.dangerOutline} ml-auto`}
            >
              削除
            </button>
          )}
        </div>
        {confirmingDelete && (
          <ConfirmDialog
            title="記事を削除しますか？"
            message={<p>「{initial.title || "（タイトルなし）"}」を削除します。</p>}
            confirmLabel="削除する"
            error={deleteError}
            onConfirm={remove}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </form>

      <div className="mt-6 pc:sticky pc:top-4 pc:mt-0">
        <PreviewPane draft={previewArticle} sites={placedSites} />
      </div>
    </div>
  );
}
