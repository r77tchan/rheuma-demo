"use client";

import { useMemo } from "react";
import { extractFileIds, resolveFileHtml } from "@/lib/bodyHtml";
import { lookupFileUrl, useFileUrls } from "@/lib/fileStore";

/**
 * 記事の本文。画像とPDFを使っていない本文は、そのまま描く（サーバーでも描く）。
 * 使っている本文は、ブラウザに保存したファイルを読み、URL に差し替えて描く。
 * プレビューの iframe の中でも、この部品が自分でファイルを読む（blob URL は、作った文書の中でしか使えないため）。
 */
export function ArticleBody({ html }: { html: string }) {
  const ids = useMemo(() => extractFileIds(html), [html]);
  const version = useFileUrls(ids);
  // version はサーバーでの描画とハイドレーションのあいだは 0。そのあいだは差し替えない（template はブラウザにしかない）
  const resolved = useMemo(
    () => (ids.length > 0 && version > 0 ? resolveFileHtml(html, lookupFileUrl) : html),
    [html, ids, version],
  );

  return <div className="article-body" dangerouslySetInnerHTML={{ __html: resolved }} />;
}
