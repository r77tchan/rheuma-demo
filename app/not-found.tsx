import { MainSiteShell } from "@/components/MainSiteShell";
import { NewsNotFound } from "@/components/news/NewsSection";
import { listCrumbs, PageTitle } from "@/components/news/PageTitle";

/**
 * ビルドしていないURLを開いたときの表示。静的な書き出しでは 404.html になり、GitHub Pages が知らないURLすべてに返す。
 * どのサイトのURLかは見ないので、メインサイトの枠で出す。
 */
export default function NotFound() {
  return (
    <MainSiteShell>
      <PageTitle site="main" crumbs={listCrumbs("main")} />
      <NewsNotFound site="main" />
    </MainSiteShell>
  );
}
