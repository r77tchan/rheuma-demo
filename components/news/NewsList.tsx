import { formatListDate, siteNews, type SiteId } from "@/data/news";
import type { SiteArticle } from "@/lib/newsStore";
import { ArticleLink } from "./ArticleLink";
import { CategoryBadge } from "./CategoryBadge";

/** 記事の1行。スマホ幅では影付きのカードになる。 */
export function NewsRow({
  site,
  article,
  titleClass,
}: {
  site: SiteId;
  article: SiteArticle;
  titleClass: string;
}) {
  return (
    <article className="relative mb-5 rounded-lg p-[13px] font-medium shadow-[4px_4px_10px_2px_rgba(0,0,0,.15)] tb:flex tb:rounded-none tb:p-0 tb:shadow-none">
      <dl className="tb:flex">
        <dt className="mb-[5px] flex justify-between tb:mb-0 tb:shrink-0 tb:items-start tb:justify-start">
          <time dateTime={article.publishedAt} className="text-[15px] text-date tb:text-[16px] tb:text-ink">
            {formatListDate(article.publishedAt)}
          </time>
          <CategoryBadge site={site} article={article} />
        </dt>
        <dd>
          <ArticleLink site={site} article={article} className={titleClass} />
        </dd>
      </dl>
    </article>
  );
}

/** 一覧の行。 */
export function NewsList({ site, articles }: { site: SiteId; articles: SiteArticle[] }) {
  const titleClass = `block text-[15px] underline hover:no-underline tb:inline tb:text-[16px] ${siteNews[site].titleColor}`;

  return articles.map((article) => (
    <NewsRow key={article.id} site={site} article={article} titleClass={titleClass} />
  ));
}
