import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
import { getCategory, seedArticles, siteCategories } from "@/data/news";
import { pageCount } from "@/lib/newsUrls";

/** 初期記事のぶんだけ事前に作る。投稿で増えたページはブラウザ側で組み立てる。 */
export function generateStaticParams() {
  return Object.keys(siteCategories.main).flatMap((category) => {
    const count = seedArticles.filter((article) => article.placements.main === category).length;
    return Array.from({ length: pageCount(count) }, (_, i) => ({ category, n: String(i + 1) }));
  });
}

export default async function NewsCategoryNumberedPage({
  params,
}: PageProps<"/news-list/[category]/page/[n]">) {
  const { category: id } = await params;
  const category = getCategory("main", id);
  if (!category) notFound();

  return (
    <>
      <PageTitle site="main" crumbs={[homeCrumb("main"), { label: category.label }]} />
      <Suspense fallback={<NewsSection site="main" />}>
        {params.then(({ n }) => (
          <NewsArchive site="main" page={Number(n)} category={{ id, label: category.label }} />
        ))}
      </Suspense>
    </>
  );
}
