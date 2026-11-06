import { notFound } from "next/navigation";
import { NewsArchive } from "@/components/news/NewsArchive";
import { homeCrumb, PageTitle } from "@/components/news/PageTitle";
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
      <NewsArchive site="senmon" category={{ id, label: category.label }} />
    </>
  );
}
