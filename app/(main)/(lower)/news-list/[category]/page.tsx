import { notFound } from "next/navigation";
import { NewsArchive } from "@/components/news/NewsArchive";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
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
      <NewsArchive site="main" category={{ id, label: category.label }} />
    </>
  );
}
