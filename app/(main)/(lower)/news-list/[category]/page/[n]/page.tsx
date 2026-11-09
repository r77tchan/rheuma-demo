import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
import { getCategory, siteCategories } from "@/data/news";
import { pageNumberParams } from "@/lib/staticPages";

/** 起こりうるページ番号のぶんだけ、カテゴリごとに事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return Object.keys(siteCategories.main).flatMap((category) => pageNumberParams().map(({ n }) => ({ category, n })));
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
