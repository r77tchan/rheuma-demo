"use client";

import { formatListDate } from "@/data/news";
import { news } from "@/data/site";
import { useSiteArticles } from "@/lib/newsStore";
import { Chevron } from "./parts";

const TOP_COUNT = 5;

/** トップの新着欄。ブラウザに保存された記事を読むので、クライアント側で描画する。 */
export function TopNews() {
  const articles = useSiteArticles("main").slice(0, TOP_COUNT);

  return (
    <div className="mt-10 w-full rounded-[10px] border-[3px] border-news-line px-5 pt-5 pb-[30px] tb:px-[30px] pc:mt-0 pc:w-[53%]">
      <h2 className="mb-[.5em] border-b border-[#ccc] pb-5 text-center font-serif text-[30px] leading-[1.8] font-medium tracking-[.1em] tb:border-b-0 tb:pb-0 tb:leading-[1.4] pc:text-left">
        {news.heading}
      </h2>

      {articles.map((article) => (
        <article
          key={article.id}
          className="relative mb-[30px] text-[14px] font-medium tb:mb-[15px] tb:flex"
        >
          <div className="mb-[5px] tb:mb-0 tb:flex tb:shrink-0 tb:items-start">
            <time dateTime={article.publishedAt} className="text-[15px] text-date tb:text-[14px] tb:text-ink">
              {formatListDate(article.publishedAt)}
            </time>
            <span className="link-fade absolute top-0 right-0 tb:static">
              <a
                href="#"
                className={`ml-[15px] block w-[160px] rounded px-2 pt-0.5 text-center text-white tb:mx-[15px] ${article.category.color}`}
              >
                {article.category.label}
              </a>
            </span>
          </div>
          <div className="min-w-0">
            <a href="#" className="block underline tb:inline tb:no-underline">
              {article.title}
            </a>
          </div>
        </article>
      ))}

      <div className="link-fade mt-10 text-right leading-[1.4] pc:mt-0">
        <a href="#" className="relative pr-[60px] text-[14px] tb:text-[16px]">
          {news.more}
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 m-auto block size-10 rounded-full border border-ink tb:size-[50px]"
          />
          <Chevron className="right-[17px] size-2.5 border-ink tb:right-[22px] tb:size-3" />
        </a>
      </div>
    </div>
  );
}
