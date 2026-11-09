import { Suspense } from "react";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { ArticleDetailFromQuery } from "@/components/news/QueryPages";

/** 記事のページ（/news/detail/?id=記事のID）。中身はブラウザで組み立てる。 */
export default function RheumaNewsDetailPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageTitle site="rheuma" crumbs={listCrumbs("rheuma")} />
          <NewsSection site="rheuma" />
        </>
      }
    >
      <ArticleDetailFromQuery site="rheuma" />
    </Suspense>
  );
}
