import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { seedArticles } from "@/data/news";
import { pageCount } from "@/lib/newsUrls";

/** 初期記事のぶんだけ事前に作る。投稿で増えたページはブラウザ側で組み立てる。 */
export function generateStaticParams() {
  const total = pageCount(seedArticles.filter((article) => article.placements.rheuma).length);
  return Array.from({ length: total }, (_, i) => ({ n: String(i + 1) }));
}

export default function RheumaNewsNumberedPage({ params }: PageProps<"/rheuma/news/page/[n]">) {
  return (
    <>
      <PageTitle site="rheuma" crumbs={listCrumbs("rheuma")} />
      <Suspense fallback={<NewsSection site="rheuma" />}>
        {params.then(({ n }) => (
          <NewsArchive site="rheuma" page={Number(n)} />
        ))}
      </Suspense>
    </>
  );
}
