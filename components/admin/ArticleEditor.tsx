"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { siteCategories, type Article, type Placements, type SiteId } from "@/data/news";
import { setFlash } from "@/lib/adminFlash";
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
import { AdminLink, useLeaveGuard } from "./LeaveGuard";
import { PreviewPane } from "./PreviewPane";
import {
  buttonClass,
  fieldClass,
  formatJapaneseDate,
  SITE_IDS,
  siteArticleHref,
  siteLabels,
  siteShortLabels,
} from "./ui";

type MainCategory = keyof typeof siteCategories.main;
type SubSite = Exclude<SiteId, "main">;
const SUB_SITES: SubSite[] = ["rheuma", "senmon"];

/** メインのカテゴリを選ぶと、そのサイトにも載せる設定にする（元サイトの掲載先の傾向。doc/調査_お知らせ.md）。 */
const defaultSubSite: Partial<Record<MainCategory, SubSite>> = {
  general: "rheuma",
  specialty: "senmon",
};

type FormState = {
  kind: Article["kind"];
  title: string;
  linkUrl: string;
  bodyHtml: string;
  publishedAt: string;
  /** 空は未選択、none は「メインには載せない」。 */
  main: MainCategory | "none" | "";
  sub: Record<SubSite, { on: boolean; category: string }>;
};

type FieldName = "title" | "linkUrl" | "bodyHtml" | "publishedAt" | "main" | "rheuma" | "senmon" | "sites";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createForm(article: Article | undefined, today: string): FormState {
  if (!article) {
    return {
      kind: "link",
      title: "",
      linkUrl: "",
      bodyHtml: "",
      publishedAt: today,
      main: "",
      sub: { rheuma: { on: false, category: "" }, senmon: { on: false, category: "" } },
    };
  }
  const { placements } = article;
  return {
    kind: article.kind,
    title: article.title,
    linkUrl: article.kind === "link" ? article.linkUrl : "",
    bodyHtml: article.kind === "body" ? article.bodyHtml : "",
    publishedAt: article.publishedAt,
    main: placements.main ?? "none",
    sub: {
      rheuma: { on: Boolean(placements.rheuma), category: placements.rheuma ?? "" },
      senmon: { on: Boolean(placements.senmon), category: placements.senmon ?? "" },
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
  } else if (!form.bodyHtml.trim()) {
    errors.bodyHtml = "本文を入力してください。";
  }
  if (!DATE_PATTERN.test(form.publishedAt)) errors.publishedAt = "公開日を入力してください。";
  if (!form.main) errors.main = "メインサイトのカテゴリを選んでください。";
  for (const site of SUB_SITES) {
    if (form.sub[site].on && !form.sub[site].category) errors[site] = "カテゴリを選んでください。";
  }
  if (form.main === "none" && !SUB_SITES.some((site) => form.sub[site].on)) {
    errors.sites = "載せるサイトを1つ以上選んでください。";
  }
  return errors;
}

function toPlacements(form: FormState): Placements {
  const placements: Partial<Record<SiteId, string>> = {};
  if (form.main && form.main !== "none") placements.main = form.main;
  for (const site of SUB_SITES) {
    if (form.sub[site].on && form.sub[site].category) placements[site] = form.sub[site].category;
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
};

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
  // 開いた時点の記事で入力欄を作る。開いたあとで別のタブで削除されても入力は消さず、保存するときに知らせる。
  const [initial] = useState(() => (id === undefined || article ? createForm(article, today) : null));

  if (!initial) {
    return (
      <div className="rounded-lg border border-[#dde2e8] bg-white px-6 py-10 text-center">
        <p>この記事は見つかりませんでした。削除された可能性があります。</p>
        <AdminLink href="/admin/" className={`${buttonClass.secondary} mt-4`}>
          記事一覧に戻る
        </AdminLink>
      </div>
    );
  }
  return <ArticleForm id={id} initial={initial} today={today} onDone={onDone} />;
}

function ArticleForm({
  id,
  initial,
  today,
  onDone,
}: {
  id: string | undefined;
  initial: FormState;
  today: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const nextId = useNextArticleId();
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState(initial);
  const [touchedSites, setTouchedSites] = useState<Record<SubSite, boolean>>({ rheuma: false, senmon: false });
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isNew = id === undefined;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useLeaveGuard(dirty, onDone);

  const errors = validate(form);
  const shownErrors = showErrors ? errors : {};
  const scheduled = DATE_PATTERN.test(form.publishedAt) && form.publishedAt > today;
  const placedSites = SITE_IDS.filter((site) => toPlacements(form)[site]);
  // 掲載先を選んでいる途中でもプレビューできるよう、カテゴリ未選択のサイトも含める
  const previewSites = SITE_IDS.filter((site) =>
    site === "main" ? form.main !== "" && form.main !== "none" : form.sub[site].on,
  );
  const previewArticle = toPreviewArticle(
    {
      ...form,
      // カテゴリ未選択のサイトは、プレビューでは仮に NEWS で出す
      sub: {
        rheuma: { ...form.sub.rheuma, category: form.sub.rheuma.category || "news" },
        senmon: { ...form.sub.senmon, category: form.sub.senmon.category || "news" },
      },
    },
    id ?? nextId,
    today,
  );

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setSaveError(null);
  };

  const updateSub = (site: SubSite, patch: Partial<FormState["sub"][SubSite]>) => {
    setForm((current) => ({ ...current, sub: { ...current.sub, [site]: { ...current.sub[site], ...patch } } }));
    setSaveError(null);
  };

  const selectMain = (main: FormState["main"]) => {
    setForm((current) => {
      if (!isNew) return { ...current, main };
      // 新規作成のときだけ、触っていないサイトに掲載先の初期値を入れる
      const sub = { ...current.sub };
      for (const site of SUB_SITES) {
        if (!touchedSites[site]) sub[site] = { ...sub[site], on: main !== "" && main !== "none" && defaultSubSite[main] === site };
      }
      return { ...current, main, sub };
    });
    setSaveError(null);
  };

  const finish = (message: string, links: { label: string; href: string }[]) => {
    setFlash({ message, links });
    onDone();
    router.push("/admin/");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
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
    const title = `「${input.title}」`;
    if (scheduled) {
      finish(`${title}を予約しました。${formatJapaneseDate(input.publishedAt)}から各サイトに出ます。`, []);
      return;
    }
    finish(
      `${title}を${isNew ? "公開" : "更新"}しました。`,
      placedSites.map((site) => ({
        label: `${siteShortLabels[site]}で見る`,
        href: siteArticleHref(site, { id: result.id, kind: input.kind }),
      })),
    );
  };

  const remove = () => {
    if (!id) return;
    const result = deleteArticle(id);
    if (!result.ok && result.reason === "storage") {
      setSaveError(saveErrorMessages.storage);
      setConfirmingDelete(false);
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
      <form ref={formRef} onSubmit={submit} noValidate className="rounded-lg border border-[#dde2e8] bg-white p-5 tb:p-6">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h1 className="text-[22px] font-bold">{isNew ? "新規作成" : "記事の編集"}</h1>
          {!isNew && <span className="text-[13px] text-[#666]">ID: {id}</span>}
        </div>

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
            <p className="font-bold">本文</p>
            {/* 本文のエディタは次の段階で作る。それまでは保存されている本文をそのまま使う */}
            <p className="mt-2 rounded-md bg-[#fff8e1] px-3 py-2 text-[14px]">
              本文の入力欄は、次の段階で作ります。今は、保存されている本文をそのまま使います。
            </p>
            {form.bodyHtml && (
              <div
                className="article-body mt-3 max-h-[240px] overflow-auto rounded-md border border-[#dde2e8] px-4 py-3 text-[15px]"
                dangerouslySetInnerHTML={{ __html: form.bodyHtml }}
              />
            )}
            {error("bodyHtml")}
          </div>
        )}

        {/* 掲載先 */}
        <fieldset className="mt-8">
          <legend className="font-bold">載せるサイトとカテゴリ</legend>
          <p className="mt-1 text-[13px] text-[#555]">
            メインのカテゴリで「一般・患者さん情報」を選ぶと一般向けサイトに、「医療関係者情報」を選ぶと医療関係者向けサイトにも載せる設定になります。
          </p>

          <div className="mt-3 rounded-md border border-[#dde2e8] p-4">
            <p className="font-bold">{siteLabels.main}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {[
                ...Object.entries(siteCategories.main).map(([value, category]) => [value, category.label] as const),
                ["none", "メインには載せない"] as const,
              ].map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name={`${fieldId}-main`}
                    checked={form.main === value}
                    onChange={() => selectMain(value as FormState["main"])}
                    className="accent-brand"
                  />
                  {label}
                </label>
              ))}
            </div>
            {error("main")}
          </div>

          {SUB_SITES.map((site) => (
            <div key={site} className="mt-3 rounded-md border border-[#dde2e8] p-4">
              <label className="flex cursor-pointer items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={form.sub[site].on}
                  onChange={(event) => {
                    setTouchedSites((current) => ({ ...current, [site]: true }));
                    updateSub(site, { on: event.target.checked });
                  }}
                  className="size-4 accent-brand"
                />
                {siteLabels[site]}に載せる
              </label>
              {form.sub[site].on && (
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 pl-6">
                  {Object.entries(siteCategories[site]).map(([value, category]) => (
                    <label key={value} className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="radio"
                        name={`${fieldId}-${site}`}
                        checked={form.sub[site].category === value}
                        onChange={() => updateSub(site, { category: value })}
                        className="accent-brand"
                      />
                      {category.label}
                    </label>
                  ))}
                </div>
              )}
              {error(site)}
            </div>
          ))}
          {error("sites")}
        </fieldset>

        {/* 公開日 */}
        <div className="mt-8">
          <label htmlFor={`${fieldId}-date`} className="font-bold">
            公開日
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              id={`${fieldId}-date`}
              type="date"
              value={form.publishedAt}
              onChange={(event) => update({ publishedAt: event.target.value })}
              className={`${fieldClass} w-auto`}
            />
            {scheduled && (
              <span className="rounded bg-[#fff1d6] px-2 py-0.5 text-[13px] text-[#8a5a00]">予約</span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-[#555]">未来の日付にすると予約になり、その日から各サイトに出ます。</p>
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
            {scheduled ? (isNew ? "予約する" : "更新する（予約）") : isNew ? "公開する" : "更新する"}
          </button>
          <AdminLink href="/admin/" className={buttonClass.secondary}>
            記事一覧に戻る
          </AdminLink>
          {!isNew &&
            (confirmingDelete ? (
              <span className="flex flex-wrap items-center gap-2 tb:ml-auto">
                <span className="text-[14px]">この記事を削除しますか？</span>
                <button type="button" onClick={remove} className={buttonClass.danger}>
                  削除する
                </button>
                <button type="button" onClick={() => setConfirmingDelete(false)} className={buttonClass.secondary}>
                  やめる
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className={`${buttonClass.dangerOutline} tb:ml-auto`}
              >
                削除
              </button>
            ))}
        </div>
      </form>

      <div className="mt-6 pc:sticky pc:top-4 pc:mt-0">
        <PreviewPane draft={previewArticle} sites={previewSites} today={today} />
      </div>
    </div>
  );
}
