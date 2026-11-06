"use client";

import { siteNews, type SiteId } from "@/data/news";
import { useHydrated, useSiteArticles } from "@/lib/newsStore";
import { categoryHref, listHref, NEWS_PER_PAGE, pageCount } from "@/lib/newsUrls";
import { CategoryFilter } from "./CategoryFilter";
import { NewsList } from "./NewsList";
import { newsHeadingClass, NewsNotFound, NewsSection } from "./NewsSection";
import { Pagination } from "./Pagination";

/** 一覧とカテゴリ別ページの本体。カテゴリを渡すと、絞り込みボタンの代わりに見出しを出す。 */
export function NewsArchive({
  site,
  page = 1,
  category,
}: {
  site: SiteId;
  page?: number;
  category?: { id: string; label: string };
}) {
  const siteArticles = useSiteArticles(site);
  const hydrated = useHydrated();

  const articles = category
    ? siteArticles.filter((article) => article.category.id === category.id)
    : siteArticles;
  const total = pageCount(articles.length);
  const { categoryPages } = siteNews[site];

  if (!Number.isInteger(page) || page < 1 || page > total) {
    return hydrated ? <NewsNotFound site={site} /> : <NewsSection site={site} />;
  }

  return (
    // 絞り込みボタンをスマホ幅でページ送りの下へ移すために flex にする。ボタンのないサイトは余白の重なり方が変わるので使わない
    <NewsSection site={site} className={categoryPages ? "flex flex-col tb:block" : ""}>
      {category ? (
        <h2 className={newsHeadingClass}>{category.label}</h2>
      ) : (
        categoryPages && <CategoryFilter site={site} />
      )}
      <div>
        <NewsList
          site={site}
          articles={articles.slice((page - 1) * NEWS_PER_PAGE, page * NEWS_PER_PAGE)}
        />
      </div>
      <Pagination
        page={page}
        total={total}
        hrefFor={(n) => (category ? categoryHref(site, category.id, n) : listHref(site, n))}
      />
    </NewsSection>
  );
}
