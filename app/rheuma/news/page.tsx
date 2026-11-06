import { NewsArchive } from "@/components/news/NewsArchive";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";

export default function RheumaNewsPage() {
  return (
    <>
      <PageTitle site="rheuma" crumbs={listCrumbs("rheuma")} />
      <NewsArchive site="rheuma" />
    </>
  );
}
