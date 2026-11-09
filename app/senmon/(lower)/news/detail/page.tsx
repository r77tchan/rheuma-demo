import { Suspense } from "react";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { ArticleDetailFromQuery } from "@/components/news/QueryPages";

/** 記事のページ（/news/detail/?id=記事のID）。中身はブラウザで組み立てる。 */
export default function SenmonNewsDetailPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageTitle site="senmon" crumbs={listCrumbs("senmon")} />
          <NewsSection site="senmon" />
        </>
      }
    >
      <ArticleDetailFromQuery site="senmon" />
    </Suspense>
  );
}
