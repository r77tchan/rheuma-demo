import { Suspense } from "react";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { articleIdParams } from "@/lib/staticPages";

/** 起こりうるIDのぶんだけ事前に作る（lib/staticPages.ts）。中身はブラウザで保存データから組み立てる。 */
export function generateStaticParams() {
  return articleIdParams();
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
