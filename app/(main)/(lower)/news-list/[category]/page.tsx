import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsSection } from "@/components/news/NewsSection";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
import { NewsArchiveFromQuery } from "@/components/news/QueryPages";
import { getCategory, siteCategories } from "@/data/news";

export function generateStaticParams() {
  return Object.keys(siteCategories.main).map((category) => ({ category }));
}

export default async function NewsCategoryPage({ params }: PageProps<"/news-list/[category]">) {
  const { category: id } = await params;
  const category = getCategory("main", id);
  if (!category) notFound();

  return (
    <>
      <PageTitle site="main" crumbs={[homeCrumb("main"), { label: category.label }]} />
      <Suspense fallback={<NewsSection site="main" />}>
        <NewsArchiveFromQuery site="main" category={{ id, label: category.label }} />
      </Suspense>
    </>
  );
}
