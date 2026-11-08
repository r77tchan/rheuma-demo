import { Suspense } from "react";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { seedArticles } from "@/data/news";

/** 初期記事のぶんだけ事前に作る。投稿画面で追加した記事はブラウザ側で組み立てる（/news/[id]/ と同じ形）。 */
export function generateStaticParams() {
  return seedArticles.map((article) => ({ id: article.id }));
}

export default function EditArticlePage({ params }: PageProps<"/admin/[id]">) {
  return (
    <Suspense fallback={<p className="py-10 text-center text-[#666]">読み込んでいます…</p>}>
      {params.then(({ id }) => (
        <ArticleEditor id={id} />
      ))}
    </Suspense>
  );
}
