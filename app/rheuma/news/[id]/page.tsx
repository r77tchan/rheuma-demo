import { Suspense } from "react";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { articleIdParams } from "@/lib/staticPages";

/** 起こりうるIDのぶんだけ事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return articleIdParams();
}

export default function RheumaNewsDetailPage({ params }: PageProps<"/rheuma/news/[id]">) {
  return (
    <Suspense fallback={<PageTitle site="rheuma" crumbs={listCrumbs("rheuma")} />}>
      {params.then(({ id }) => (
        <ArticleDetail site="rheuma" id={id} />
      ))}
    </Suspense>
  );
}
