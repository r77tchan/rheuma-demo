"use client";

import Link from "next/link";
import { siteNews, type SiteId } from "@/data/news";
import { useHydrated, useSiteArticles, type SiteArticle } from "@/lib/newsStore";
import { articleHref, categoryHref, listHref } from "@/lib/newsUrls";
import { Chevron } from "../parts";
import { ArticleBody } from "./ArticleBody";
import { ArticleHeading, NewsNotFound, NewsSection } from "./NewsSection";
import { homeCrumb, listCrumbs, PageTitle } from "./PageTitle";

type BodyArticle = Extract<SiteArticle, { kind: "body" }>;

const navLinkClass = "relative text-brand underline hover:no-underline";

/** 記事の詳細。本文のない直リンク記事はページを持たず、前後リンクでも飛ばす。 */
export function ArticleDetail({ site, id }: { site: SiteId; id: string }) {
  const articles = useSiteArticles(site);
  const hydrated = useHydrated();

  const bodyArticles = articles.filter((item): item is BodyArticle => item.kind === "body");
  const index = bodyArticles.findIndex((item) => item.id === id);
  const article = bodyArticles[index];

  if (!article) {
    return (
      <>
        <PageTitle site={site} crumbs={listCrumbs(site)} />
        {hydrated ? <NewsNotFound site={site} /> : <NewsSection site={site} />}
      </>
    );
  }

  const older = bodyArticles[index + 1];
  const newer = bodyArticles[index - 1];

  return (
    <>
      <PageTitle
        site={site}
        crumbs={[
          homeCrumb(site),
          { label: siteNews[site].heading, href: listHref(site) },
          ...(siteNews[site].categoryPages
            ? [{ label: article.category.label, href: categoryHref(site, article.category.id) }]
            : []),
          { label: article.title },
        ]}
      />
      <NewsSection site={site}>
        <ArticleHeading site={site}>{article.title}</ArticleHeading>
        <time dateTime={article.publishedAt} className={`block ${site === "rheuma" ? "mb-2.5" : "mb-4"}`}>
          {article.publishedAt}
        </time>
        <ArticleBody html={article.bodyHtml} />

        <div className="flex flex-wrap items-center justify-center tb:flex-nowrap pc:justify-between">
          <div className="mt-8 tb:ml-8 pc:mr-8 pc:ml-0 pc:w-[150px]">
            {older && (
              <Link href={articleHref(site, older)} rel="prev" className={navLinkClass}>
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-[15px] m-auto block size-2.5 rotate-[-135deg] border-t-2 border-r-2 border-brand"
                />
                前の記事へ
              </Link>
            )}
          </div>
          <div className="link-fade mx-auto mt-[30px]">
            <Link
              href={listHref(site)}
              className="relative inline-block w-[256px] rounded-[25px] bg-brand py-[9px] text-center text-[18px] text-white"
            >
              一覧に戻る
              <Chevron className="right-[15px] size-2.5 border-white" />
            </Link>
          </div>
          <div className="mt-8 tb:mr-8 pc:mr-0 pc:ml-8 pc:w-[150px]">
            {newer && (
              <Link href={articleHref(site, newer)} rel="next" className={navLinkClass}>
                次の記事へ
                <Chevron className="-right-[15px] size-2.5 border-brand" />
              </Link>
            )}
          </div>
        </div>
      </NewsSection>
    </>
  );
}
