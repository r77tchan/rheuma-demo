"use client";

import { useSearchParams } from "next/navigation";
import type { SiteId } from "@/data/news";
import { parsePageParam } from "@/lib/newsUrls";
import { ArticleDetail } from "./ArticleDetail";
import { NewsArchive } from "./NewsArchive";

// URLのクエリ（?id=、?page=）を読んで、記事のページと一覧を出す（lib/newsUrls.ts）。
// 書き出したHTMLにはクエリが入らないので、ページの側で Suspense に包み、ここから下はブラウザで描く（use-search-params.md）。
// 同じページのままクエリだけ変わる移動（前後の記事、ページ送り）で前の状態を残さないよう、key を付けて作り直す。

export function ArticleDetailFromQuery({ site }: { site: SiteId }) {
  const id = useSearchParams().get("id") ?? "";
  return <ArticleDetail key={id} site={site} id={id} />;
}

export function NewsArchiveFromQuery({
  site,
  category,
}: {
  site: SiteId;
  category?: { id: string; label: string };
}) {
  const page = parsePageParam(useSearchParams().get("page"));
  return <NewsArchive key={page} site={site} page={page} category={category} />;
}
