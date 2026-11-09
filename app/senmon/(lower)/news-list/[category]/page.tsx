import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsSection } from "@/components/news/NewsSection";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
import { NewsArchiveFromQuery } from "@/components/news/QueryPages";
import { getCategory, siteCategories } from "@/data/news";

export function generateStaticParams() {
  return Object.keys(siteCategories.senmon).map((category) => ({ category }));
}

export default async function SenmonNewsCategoryPage({
  params,
}: PageProps<"/senmon/news-list/[category]">) {
  const { category: id } = await params;
  const category = getCategory("senmon", id);
  if (!category) notFound();

  return (
    <>
      <PageTitle site="senmon" crumbs={[homeCrumb("senmon"), { label: category.label }]} />
      <Suspense fallback={<NewsSection site="senmon" />}>
        <NewsArchiveFromQuery site="senmon" category={{ id, label: category.label }} />
      </Suspense>
    </>
  );
}
