import { Suspense } from "react";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { NewsArchiveFromQuery } from "@/components/news/QueryPages";

/** お知らせの一覧（2ページ目からは ?page=ページ番号）。中身はブラウザで組み立てる。 */
export default function RheumaNewsPage() {
  return (
    <>
      <PageTitle site="rheuma" crumbs={listCrumbs("rheuma")} />
      <Suspense fallback={<NewsSection site="rheuma" />}>
        <NewsArchiveFromQuery site="rheuma" />
      </Suspense>
    </>
  );
}
