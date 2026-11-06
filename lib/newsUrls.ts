import { siteNews, type Article, type SiteId } from "@/data/news";

export const NEWS_PER_PAGE = 10;

export function pageCount(articleCount: number) {
  return Math.max(1, Math.ceil(articleCount / NEWS_PER_PAGE));
}

export function listHref(site: SiteId, page = 1) {
  const base = `${siteNews[site].basePath}/news/`;
  return page > 1 ? `${base}page/${page}/` : base;
}

export function categoryHref(site: SiteId, category: string, page = 1) {
  const base = `${siteNews[site].basePath}/news-list/${category}/`;
  return page > 1 ? `${base}page/${page}/` : base;
}

/** 一覧のクリック先。直リンク記事はリンク先へ直接飛ぶ。 */
export function articleHref(site: SiteId, article: Article) {
  return article.kind === "link" ? article.linkUrl : `${siteNews[site].basePath}/news/${article.id}/`;
}
