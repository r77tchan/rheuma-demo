import { NewsNotFound } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";

/** notFound() を呼んだときの表示。ヘッダーとフッターを残して、他の「見つからない」と揃える。 */
export default function LowerNotFound() {
  return (
    <>
      <PageTitle site="main" crumbs={listCrumbs("main")} />
      <NewsNotFound site="main" />
    </>
  );
}
