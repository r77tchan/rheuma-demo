"use client";

import { useSearchParams } from "next/navigation";
import { ArticleEditor } from "./ArticleEditor";

/**
 * 編集画面。記事のIDはURLのクエリ（?id=）で受ける（components/news/QueryPages.tsx と同じ形）。
 * IDがないときも新規作成にはせず、「見つからない」を出す。
 */
export function EditArticleFromQuery() {
  const id = useSearchParams().get("id") ?? "";
  return <ArticleEditor key={id} id={id} />;
}
