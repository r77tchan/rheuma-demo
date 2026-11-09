import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { pageNumberParams } from "@/lib/staticPages";

/** 起こりうるページ番号のぶんだけ事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return pageNumberParams();
}

export default function RheumaNewsNumberedPage({ params }: PageProps<"/rheuma/news/page/[n]">) {
  return (
    <>
      <PageTitle site="rheuma" crumbs={listCrumbs("rheuma")} />
      <Suspense fallback={<NewsSection site="rheuma" />}>
        {params.then(({ n }) => (
          <NewsArchive site="rheuma" page={Number(n)} />
        ))}
      </Suspense>
    </>
  );
}
