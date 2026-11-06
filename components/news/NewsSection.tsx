import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteId } from "@/data/news";
import { listHref } from "@/lib/newsUrls";

/** ページタイトルの帯の下に置く本文の枠。 */
export function NewsSection({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-5 pc:px-[100px]">
      <div className={`mx-auto my-[60px] max-w-[1410px] pc:mb-[90px] ${className}`}>{children}</div>
    </section>
  );
}

/** 記事やページがないときの案内。 */
export function NewsNotFound({ site }: { site: SiteId }) {
  return (
    <NewsSection>
      <p className="mb-4">お探しのページは見つかりませんでした。</p>
      <Link href={listHref(site)} className="text-brand underline hover:no-underline">
        一覧に戻る
      </Link>
    </NewsSection>
  );
}

export const newsHeadingClass =
  "mb-[30px] text-center text-[26px] leading-[1.7] font-bold tracking-[.05em] tb:mb-[60px] tb:text-left tb:text-[36px] tb:leading-[1.8]";
