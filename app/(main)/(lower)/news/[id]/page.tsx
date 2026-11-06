import { Suspense } from "react";
import { ArticleDetail } from "@/components/news/ArticleDetail";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";
import { seedArticles } from "@/data/news";

/** 初期記事のぶんだけ事前に作る。投稿画面で作った記事はブラウザ側で組み立てる。 */
export function generateStaticParams() {
  return seedArticles
    .filter((article) => article.kind === "body" && article.placements.main)
    .map((article) => ({ id: article.id }));
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
