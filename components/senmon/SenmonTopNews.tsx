"use client";

import Link from "next/link";
import { formatListDate, siteNews } from "@/data/news";
import { senmonNews } from "@/data/senmon";
import { useSiteArticles } from "@/lib/newsStore";
import { listHref } from "@/lib/newsUrls";
import { ArticleLink } from "../news/ArticleLink";
import { CategoryBadge } from "../news/CategoryBadge";
import { Chevron } from "../parts";

const TOP_COUNT = 5;

/** /senmon/ のトップの新着欄。スマホ幅でもカードにせず、区切りのないリストのままにする。 */
export function SenmonTopNews() {
  const articles = useSiteArticles("senmon").slice(0, TOP_COUNT);

  return (
    <div className="w-full pc:w-[60%]">
      <h2 className="mb-[26px] border-b border-[#ccc] pb-[13px] text-center font-serif text-[26px] leading-[1.8] font-medium tracking-[.1em] tb:mb-[30px] tb:border-b-0 tb:pb-0 tb:text-[30px] tb:leading-[1.4] pc:text-left">
        {siteNews.senmon.heading}
      </h2>

      {articles.map((article) => (
        <article key={article.id} className="relative mb-[30px] font-medium tb:mb-5 tb:flex">
          <dl className="tb:flex">
            <dt className="mb-[5px] flex tb:mb-0 tb:shrink-0 tb:items-start">
              <time
                dateTime={article.publishedAt}
                className="text-[15px] text-date tb:text-[16px] tb:text-ink"
              >
                {formatListDate(article.publishedAt)}
              </time>
              <CategoryBadge site="senmon" article={article} positionClass="top-0 right-0" />
            </dt>
            <dd>
              <ArticleLink
                site="senmon"
                article={article}
                className="block text-[14px] underline tb:inline tb:text-[16px] tb:no-underline"
              />
            </dd>
          </dl>
        </article>
      ))}

      <div className="link-fade mt-10 text-right pc:mt-0">
        <Link href={listHref("senmon")} className="relative pr-[60px] text-[14px] tb:pr-[70px] tb:text-[16px]">
          {senmonNews.more}
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 m-auto block size-10 rounded-full border border-ink tb:size-[60px]"
          />
          <Chevron className="right-[17px] size-2.5 border-ink tb:right-[26px] tb:size-3" />
        </Link>
      </div>
    </div>
  );
}
