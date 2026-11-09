import { Suspense } from "react";
import { NewsArchive } from "@/components/news/NewsArchive";
import { NewsSection } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { pageNumberParams } from "@/lib/staticPages";

/** 起こりうるページ番号のぶんだけ事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return pageNumberParams();
}

export default function NewsNumberedPage({ params }: PageProps<"/news/page/[n]">) {
  return (
    <>
      <PageTitle site="main" crumbs={listCrumbs("main")} />
      <Suspense fallback={<NewsSection site="main" />}>
        {params.then(({ n }) => (
          <NewsArchive site="main" page={Number(n)} />
        ))}
      </Suspense>
    </>
  );
}
