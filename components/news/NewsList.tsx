import Link from "next/link";
import { formatListDate, type SiteId } from "@/data/news";
import type { SiteArticle } from "@/lib/newsStore";
import { categoryHref } from "@/lib/newsUrls";
import { ArticleLink } from "./ArticleLink";

/** 一覧の行。スマホ幅では影付きのカードになる。 */
export function NewsList({ site, articles }: { site: SiteId; articles: SiteArticle[] }) {
  return articles.map((article) => (
    <article
      key={article.id}
      className="relative mb-5 rounded-lg p-[13px] font-medium shadow-[4px_4px_10px_2px_rgba(0,0,0,.15)] tb:flex tb:rounded-none tb:p-0 tb:shadow-none"
    >
      <dl className="tb:flex">
        <dt className="mb-[5px] flex justify-between tb:mb-0 tb:shrink-0 tb:items-start tb:justify-start">
          <time dateTime={article.publishedAt} className="text-[15px] text-date tb:text-[16px] tb:text-ink">
            {formatListDate(article.publishedAt)}
          </time>
          <span className="link-fade absolute top-[13px] right-[13px] tb:static">
            <Link
              href={categoryHref(site, article.category.id)}
              className={`mx-5 block w-[160px] rounded px-2 pt-0.5 text-center text-[15px] text-white ${article.category.color}`}
            >
              {article.category.label}
            </Link>
          </span>
        </dt>
        <dd>
          <ArticleLink
            site={site}
            article={article}
            className="block text-[15px] text-brand underline hover:no-underline tb:inline tb:text-[16px]"
          />
        </dd>
      </dl>
    </article>
  ));
}
