import { NewsArchive } from "@/components/news/NewsArchive";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";

export default function NewsPage() {
  return (
    <>
      <PageTitle site="main" crumbs={listCrumbs("main")} />
      <NewsArchive site="main" />
    </>
  );
}
