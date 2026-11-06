import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { seedArticles } from "@/data/news";
import { pageCount } from "@/lib/newsUrls";

/** 初期記事のぶんだけ事前に作る。投稿で増えたページはブラウザ側で組み立てる。 */
export function generateStaticParams() {
  const total = pageCount(seedArticles.filter((article) => article.placements.main).length);
  return Array.from({ length: total }, (_, i) => ({ n: String(i + 1) }));
}

export default function NewsNumberedPage({ params }: PageProps<"/news/page/[n]">) {
  return (
    <>
      <PageTitle site="main" crumbs={listCrumbs("main")} />
      <Suspense fallback={<NewsSection site="main" />}>
        {params.then(({ n }) => (
          <NewsArchive site="main" page={Number(n)} />
        ))}
      </Suspense>
    </>
  );
}
