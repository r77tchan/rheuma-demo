import { NewsNotFound } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";

/** notFound() を呼んだときの表示。ヘッダーとフッターを残して、他の「見つからない」と揃える。 */
export default function SenmonLowerNotFound() {
  return (
    <>
      <PageTitle site="senmon" crumbs={listCrumbs("senmon")} />
      <NewsNotFound site="senmon" />
    </>
  );
}
