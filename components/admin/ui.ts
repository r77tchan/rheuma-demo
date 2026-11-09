import { siteNews, type Article, type SiteId } from "@/data/news";
import { withBasePath } from "@/lib/basePath";
import { articlePageHref, listHref } from "@/lib/newsUrls";

// 投稿画面の文言と見た目。元サイトにない画面なので、サイト名は役割で呼ぶ（正式名はダミーのため使わない）。

export const SITE_IDS: SiteId[] = ["main", "rheuma", "senmon"];

/** 一覧のバッジなど、短く書くときのサイト名。 */
export const siteShortLabels: Record<SiteId, string> = {
  main: "メイン",
  rheuma: "一般向け",
  senmon: "医療関係者向け",
};

/** 入力欄の見出しなど、正確に書くときのサイト名。 */
export const siteLabels: Record<SiteId, string> = {
  main: "メインサイト",
  rheuma: "一般・患者さん向けサイト（/rheuma/）",
  senmon: "医療関係者向けサイト（/senmon/）",
};

// 下の3つは、生の <a> と iframe の src に渡すURL（公開URLの先頭のパスが付いている）。Link や router.push には渡さない。

/** サイトのトップのURL。 */
export function siteTopUrl(site: SiteId) {
  return withBasePath(`${siteNews[site].basePath}/`);
}

/** 記事のページのURL。 */
export function articlePageUrl(site: SiteId, id: string) {
  return withBasePath(articlePageHref(site, id));
}

/** 記事がそのサイトで見られる場所。本文のある記事は記事のページ、リンクだけの記事はお知らせ一覧。 */
export function siteArticleUrl(site: SiteId, article: Pick<Article, "id" | "kind">) {
  return article.kind === "body" ? articlePageUrl(site, article.id) : withBasePath(listHref(site));
}

/** 入力欄の Enter（日本語の変換を確定する Enter は除く）。Safari は変換の確定で keyCode が 229 になる。 */
export function isEnter(event: React.KeyboardEvent) {
  return event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229;
}

/** 「2026年11月8日」の形。 */
export function formatJapaneseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 font-bold text-white hover:bg-[#004a94] disabled:cursor-default disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center rounded-md border border-[#c3cad3] bg-white px-4 py-2 hover:bg-[#f0f3f7]",
  danger:
    "inline-flex items-center justify-center rounded-md bg-[#c62828] px-4 py-2 font-bold text-white hover:bg-[#a82020] disabled:opacity-50",
  dangerOutline:
    "inline-flex items-center justify-center rounded-md border border-[#e0a3a3] bg-white px-4 py-2 text-[#c62828] hover:bg-[#fdf2f2]",
};

/**
 * 選択中のタブや絞り込みの見た目。押すと何かが起きるボタン（青の塗りつぶし）と見分けられるよう、薄い青にする。
 * エディタのツールバーや掲載先の枠の、選択中の見た目と同じ系統。
 */
export function toggleClass(active: boolean) {
  return active ? "border-brand bg-[#e8eef6] text-brand" : "border-[#c3cad3] bg-white hover:bg-[#f0f3f7]";
}

export const fieldClass =
  "w-full rounded-md border border-[#c3cad3] bg-white px-3 py-2 focus:border-brand focus:outline-2 focus:outline-brand/25";

/** 外部へ飛ぶリンク（別のタブで開く）の見た目。 */
export const textLinkClass = "text-brand underline hover:no-underline";
