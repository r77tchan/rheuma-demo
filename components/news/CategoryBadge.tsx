import Link from "next/link";
import { siteNews, type SiteId } from "@/data/news";
import type { SiteArticle } from "@/lib/newsStore";
import { categoryHref } from "@/lib/newsUrls";

/** 一覧の行のカテゴリ。カテゴリ別ページがあるサイトではリンクになる。 */
export function CategoryBadge({ site, article }: { site: SiteId; article: SiteArticle }) {
  const { categoryPages, badgeWidth } = siteNews[site];
  const { id, label, color } = article.category;

  return categoryPages ? (
    <span className="link-fade absolute top-[13px] right-[13px] tb:static">
      <Link
        href={categoryHref(site, id)}
        className={`mx-5 block rounded px-2 pt-0.5 text-center text-[15px] text-white ${badgeWidth} ${color}`}
      >
        {label}
      </Link>
    </span>
  ) : (
    <span
      className={`absolute top-[13px] right-[13px] block rounded text-center text-[15px] text-white tb:static tb:mx-5 tb:px-2 tb:pt-0.5 ${badgeWidth} ${color}`}
    >
      {label}
    </span>
  );
}
