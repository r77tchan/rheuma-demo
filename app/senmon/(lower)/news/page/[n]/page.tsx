import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { pageNumberParams } from "@/lib/staticPages";

/** 起こりうるページ番号のぶんだけ事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return pageNumberParams();
}

export default function SenmonNewsNumberedPage({ params }: PageProps<"/senmon/news/page/[n]">) {
  return (
    <>
      <PageTitle site="senmon" crumbs={listCrumbs("senmon")} />
      <Suspense fallback={<NewsSection site="senmon" />}>
        {params.then(({ n }) => (
          <NewsArchive site="senmon" page={Number(n)} />
        ))}
      </Suspense>
    </>
  );
}
