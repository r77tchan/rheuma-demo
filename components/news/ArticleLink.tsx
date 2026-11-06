import Link from "next/link";
import type { Article, SiteId } from "@/data/news";
import { articleHref } from "@/lib/newsUrls";

/** 記事のタイトルのリンク。直リンク記事は外部へのリンクになるので、Link を使わない。 */
export function ArticleLink({
  site,
  article,
  className,
}: {
  site: SiteId;
  article: Article;
  className?: string;
}) {
  const href = articleHref(site, article);
  return article.kind === "link" ? (
    <a href={href} className={className}>
      {article.title}
    </a>
  ) : (
    <Link href={href} className={className}>
      {article.title}
    </Link>
  );
}
