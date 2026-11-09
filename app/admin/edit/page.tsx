import { Suspense } from "react";
import { EditArticleFromQuery } from "@/components/admin/EditArticleFromQuery";

/** 記事の編集（/admin/edit/?id=記事のID）。 */
export default function EditArticlePage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-[#666]">読み込んでいます…</p>}>
      <EditArticleFromQuery />
    </Suspense>
  );
}
