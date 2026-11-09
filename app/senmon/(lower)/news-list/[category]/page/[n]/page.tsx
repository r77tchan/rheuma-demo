import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
import { getCategory, siteCategories } from "@/data/news";
import { pageNumberParams } from "@/lib/staticPages";

/** 起こりうるページ番号のぶんだけ、カテゴリごとに事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return Object.keys(siteCategories.senmon).flatMap((category) => pageNumberParams().map(({ n }) => ({ category, n })));
}

export default async function SenmonNewsCategoryNumberedPage({
  params,
}: PageProps<"/senmon/news-list/[category]/page/[n]">) {
  const { category: id } = await params;
  const category = getCategory("senmon", id);
  if (!category) notFound();

  return (
    <>
      <PageTitle site="senmon" crumbs={[homeCrumb("senmon"), { label: category.label }]} />
      <Suspense fallback={<NewsSection site="senmon" />}>
        {params.then(({ n }) => (
          <NewsArchive site="senmon" page={Number(n)} category={{ id, label: category.label }} />
        ))}
      </Suspense>
    </>
  );
}
