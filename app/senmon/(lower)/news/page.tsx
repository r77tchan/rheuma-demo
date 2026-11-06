import { NewsArchive } from "@/components/news/NewsArchive";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";

export default function SenmonNewsPage() {
  return (
    <>
      <PageTitle site="senmon" crumbs={listCrumbs("senmon")} />
      <NewsArchive site="senmon" />
    </>
  );
}
