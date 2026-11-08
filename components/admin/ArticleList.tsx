"use client";

import { useState } from "react";
import { getCategory, type Article, type SiteId } from "@/data/news";
import { setFlash, useFlash } from "@/lib/adminFlash";
import {
  compareNewest,
  deleteArticle,
  isSeedId,
  resetDemoData,
  useArticles,
  useEditedIds,
  useHydrated,
  useToday,
} from "@/lib/newsStore";
import { AdminLink } from "./LeaveGuard";
import { buttonClass, formatJapaneseDate, SITE_IDS, siteShortLabels, textLinkClass } from "./ui";

type Filter = "all" | SiteId;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "すべて" },
  ...SITE_IDS.map((site) => ({ id: site, label: siteShortLabels[site] })),
];

/** 投稿画面の記事一覧。全件を新しい順に並べ、サイトで絞り込める。 */
export function ArticleList() {
  const hydrated = useHydrated();
  const articles = useArticles();
  const editedIds = useEditedIds();
  const today = useToday();
  const [filter, setFilter] = useState<Filter>("all");

  if (!hydrated) return <p className="py-10 text-center text-[#666]">読み込んでいます…</p>;

  const sorted = [...articles].sort(compareNewest);
  const shown = filter === "all" ? sorted : sorted.filter((article) => article.placements[filter]);
  const countFor = (id: Filter) =>
    id === "all" ? articles.length : articles.filter((article) => article.placements[id]).length;

  return (
    <div>
      <FlashPanel />

      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-[22px] font-bold">記事一覧</h1>
        <AdminLink href="/admin/new/" className={buttonClass.primary}>
          新規作成
        </AdminLink>
        <ResetButton />
      </div>

      <div role="group" aria-label="サイトで絞り込む" className="mt-5 flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-full border px-4 py-1.5 text-[14px] ${
              filter === id ? "border-brand bg-brand text-white" : "border-[#c3cad3] bg-white hover:bg-[#f0f3f7]"
            }`}
          >
            {label}（{countFor(id)}）
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-[#e3e7ec] rounded-lg border border-[#dde2e8] bg-white">
        {shown.map((article) => (
          <ArticleRow
            key={article.id}
            article={article}
            scheduled={today !== null && article.publishedAt > today}
            status={editedIds.has(article.id) ? (isSeedId(article.id) ? "編集済み" : "追加") : null}
          />
        ))}
        {shown.length === 0 && <li className="px-4 py-8 text-center text-[#666]">記事がありません。</li>}
      </ul>
    </div>
  );
}

function FlashPanel() {
  const flash = useFlash();
  if (!flash) return null;

  return (
    <div role="status" className="mb-6 flex items-start gap-4 rounded-lg border border-[#b7dcc0] bg-[#eef8f0] px-5 py-4">
      <div className="flex-1">
        <p className="font-bold">{flash.message}</p>
        {flash.links.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            {flash.links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener" className={textLinkClass}>
                {link.label}
              </a>
            ))}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setFlash(null)}
        aria-label="お知らせを閉じる"
        className="text-[20px] leading-none text-[#666] hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

function ResetButton() {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    const ok = await resetDemoData();
    setResetting(false);
    setConfirming(false);
    setFlash({
      message: ok ? "初期状態に戻しました。" : "初期状態に戻せませんでした。ブラウザの保存が許可されていない可能性があります。",
      links: [],
    });
  };

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${buttonClass.secondary} ml-auto`}>
        初期状態に戻す
      </button>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-3 rounded-md bg-[#fdf2f2] px-4 py-3 tb:ml-auto tb:w-auto">
      <p className="text-[14px]">追加、編集、削除した内容がすべて消えます。</p>
      <button type="button" onClick={reset} disabled={resetting} className={buttonClass.danger}>
        {resetting ? "戻しています…" : "初期状態に戻す"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={buttonClass.secondary}>
        やめる
      </button>
    </div>
  );
}

function ArticleRow({
  article,
  scheduled,
  status,
}: {
  article: Article;
  scheduled: boolean;
  status: "編集済み" | "追加" | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(false);
  const editHref = `/admin/${article.id}/`;

  const remove = () => {
    const result = deleteArticle(article.id);
    if (!result.ok && result.reason === "storage") {
      setError(true);
      return;
    }
    setFlash({ message: `「${article.title}」を削除しました。`, links: [] });
  };

  return (
    <li className="px-4 py-3 tb:flex tb:items-start tb:gap-4">
      <div className="shrink-0 text-[14px] text-[#555] tb:w-[150px]">
        {formatJapaneseDate(article.publishedAt)}
        {scheduled && (
          <span className="ml-2 rounded bg-[#fff1d6] px-1.5 py-0.5 text-[12px] text-[#8a5a00]">予約</span>
        )}
      </div>

      <div className="mt-1 min-w-0 flex-1 tb:mt-0">
        <AdminLink href={editHref} className="font-bold text-brand hover:underline">
          {article.title || "（タイトルなし）"}
        </AdminLink>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
          <span className="rounded border border-[#c3cad3] px-1.5 py-0.5 text-[#555]">
            {article.kind === "body" ? "本文あり" : "リンクだけ"}
          </span>
          {status && <span className="rounded bg-[#e8eef6] px-1.5 py-0.5 text-brand">{status}</span>}
          {SITE_IDS.map((site) => {
            const categoryId = article.placements[site];
            const category = categoryId && getCategory(site, categoryId);
            if (!category) return null;
            return (
              <span key={site} className="inline-flex overflow-hidden rounded border border-[#dde2e8]">
                <span className="bg-[#f4f6f9] px-1.5 py-0.5">{siteShortLabels[site]}</span>
                <span className={`${category.color} px-1.5 py-0.5 text-white`}>{category.label}</span>
              </span>
            );
          })}
        </div>
        {error && <p className="mt-2 text-[14px] text-[#c62828]">削除できませんでした。ブラウザの保存が許可されていない可能性があります。</p>}
      </div>

      <div className="mt-2 flex shrink-0 flex-wrap items-center gap-2 tb:mt-0">
        {confirming ? (
          <>
            <span className="text-[14px]">削除しますか？</span>
            <button type="button" onClick={remove} className={buttonClass.danger}>
              削除する
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={buttonClass.secondary}>
              やめる
            </button>
          </>
        ) : (
          <>
            <AdminLink href={editHref} className={buttonClass.secondary}>
              編集
            </AdminLink>
            <button type="button" onClick={() => setConfirming(true)} className={buttonClass.dangerOutline}>
              削除
            </button>
          </>
        )}
      </div>
    </li>
  );
}
