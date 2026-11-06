"use client";

import Link from "next/link";
import { rheumaNews } from "@/data/rheuma";
import { useSiteArticles } from "@/lib/newsStore";
import { listHref } from "@/lib/newsUrls";
import { NewsRow } from "../news/NewsList";
import { Chevron } from "../parts";

const TOP_COUNT = 5;

/** /rheuma/ のトップの新着欄。 */
export function RheumaTopNews() {
  const articles = useSiteArticles("rheuma").slice(0, TOP_COUNT);

  return (
    <div className="link-fade mt-[30px] w-full pc:mt-[35px] pc:ml-[30px] pc:w-[80%]">
      <h2 className="mb-[1em] text-center text-[30px] leading-[1.4] font-medium tb:text-[35px] pc:mb-[.7em] pc:text-left">
        {rheumaNews.heading}
      </h2>

      {articles.map((article) => (
        <NewsRow
          key={article.id}
          site="rheuma"
          article={article}
          titleClass="block text-[15px] tb:inline tb:text-[16px]"
        />
      ))}

      <div className="mt-10 text-right">
        <Link href={listHref("rheuma")} className="relative pr-[70px]">
          {rheumaNews.more}
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 m-auto block size-[60px] rounded-full border border-ink"
          />
          <Chevron className="right-[26px] size-3 border-ink" />
        </Link>
      </div>
    </div>
  );
}
