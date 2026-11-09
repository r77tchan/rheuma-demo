import { siteNews, type Article, type SiteId } from "@/data/news";

export const NEWS_PER_PAGE = 10;

export function pageCount(articleCount: number) {
  return Math.max(1, Math.ceil(articleCount / NEWS_PER_PAGE));
}

// 記事のIDとページ番号はURLのクエリに持たせる（元サイトの /news/{id}/、/news/page/{n}/ とは形が違う）。
// GitHub Pages は書き出したファイルしか返せず、投稿画面で追加した記事のIDや増えたページ番号はビルドのときに分からないため。
// 記事のページは各サイトに1枚だけ書き出し、中身はブラウザでクエリと保存データから組み立てる（components/news/QueryPages.tsx）。

function withPage(path: string, page: number) {
  return page > 1 ? `${path}?page=${page}` : path;
}

export function listHref(site: SiteId, page = 1) {
  return withPage(`${siteNews[site].basePath}/news/`, page);
}

export function categoryHref(site: SiteId, category: string, page = 1) {
  return withPage(`${siteNews[site].basePath}/news-list/${category}/`, page);
}

/** 記事のページ。 */
export function articlePageHref(site: SiteId, id: string) {
  return `${siteNews[site].basePath}/news/detail/?id=${id}`;
}

/** 一覧のクリック先。直リンク記事はリンク先へ直接飛ぶ。 */
export function articleHref(site: SiteId, article: Article) {
  return article.kind === "link" ? article.linkUrl : articlePageHref(site, article.id);
}

/** クエリの page を読む。ないときは1ページ目。数字でなければ NaN（一覧は「見つからない」を出す）。 */
export function parsePageParam(value: string | null) {
  if (value === null) return 1;
  return /^[1-9][0-9]{0,5}$/.test(value) ? Number(value) : NaN;
}
