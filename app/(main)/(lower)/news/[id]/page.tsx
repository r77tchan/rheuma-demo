import { Suspense } from "react";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { articleIdParams } from "@/lib/staticPages";

/** 起こりうるIDのぶんだけ事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return articleIdParams();
}

export default function NewsDetailPage({ params }: PageProps<"/news/[id]">) {
  return (
    <Suspense fallback={<PageTitle site="main" crumbs={listCrumbs("main")} />}>
      {params.then(({ id }) => (
        <ArticleDetail site="main" id={id} />
      ))}
    </Suspense>
  );
}
