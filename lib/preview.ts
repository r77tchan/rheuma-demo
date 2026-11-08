// 投稿画面と、プレビューの iframe の中のページとのやりとり。どちらも同じオリジンで、postMessage を使う。
// iframe の中のページは、受け取る準備ができたら ready を送る。投稿画面は ready を受けてから下書きを送る
// （先に送ると、iframe 側がまだ受け取れずに失われるため）。

/** プレビューの iframe の name。iframe の中のページは、これでプレビュー中だと判断する。 */
export const PREVIEW_FRAME_NAME = "news-preview";

/** トップで、自動でスクロールする先の目印（data-preview-anchor の値）。 */
export const PREVIEW_ANCHOR = "news";

export type PreviewMessage =
  /** iframe → 投稿画面: 下書きを受け取る準備ができた */
  | { type: "preview:ready" }
  /** 投稿画面 → iframe: 下書き。scroll が true なら、反映したあとで新着欄までスクロールする */
  | { type: "preview:draft"; article: unknown; scroll: boolean }
  /** iframe → 投稿画面: 下書きを反映した */
  | { type: "preview:applied" };

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  if (typeof data !== "object" || data === null || !("type" in data)) return false;
  switch (data.type) {
    case "preview:ready":
    case "preview:applied":
      return true;
    case "preview:draft":
      return "article" in data && "scroll" in data && typeof data.scroll === "boolean";
    default:
      return false;
  }
}
