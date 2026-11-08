"use client";

import { useEffect } from "react";
import { setPreviewDraft } from "@/lib/newsStore";
import { isPreviewMessage, PREVIEW_ANCHOR, PREVIEW_FRAME_NAME, type PreviewMessage } from "@/lib/preview";

/** 固定ヘッダーに隠れないように、新着欄の少し上で止める。 */
const SCROLL_MARGIN = 100;

function scrollToNews() {
  const anchor = document.querySelector(`[data-preview-anchor="${PREVIEW_ANCHOR}"]`);
  if (!anchor) return;
  window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - SCROLL_MARGIN, behavior: "instant" });
}

/**
 * 投稿画面のプレビュー（iframe）の中でだけ働く。ほかのときは何もしない。
 * 投稿画面から下書きを受け取ってストアに重ね、プレビューの中ではリンクで移動しないようにする。
 */
export function PreviewReceiver() {
  useEffect(() => {
    if (window.name !== PREVIEW_FRAME_NAME || window.parent === window) return;
    const parent = window.parent;
    const post = (message: PreviewMessage) => parent.postMessage(message, window.location.origin);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== parent) return;
      if (!isPreviewMessage(event.data) || event.data.type !== "preview:draft") return;
      const { article, scroll } = event.data;
      setPreviewDraft(article);
      // 反映後の描画を待ってから、スクロールして知らせる
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (scroll) scrollToNews();
          post({ type: "preview:applied" });
        }),
      );
    };

    // リンクを押しても移動しない。ページの処理（Link や動かないリンクの案内）より先に止める
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("click", onClick, true);
    post({ type: "preview:ready" });
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
