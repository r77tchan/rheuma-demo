import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteId } from "@/data/news";
import { listHref } from "@/lib/newsUrls";

const sectionMargins: Record<SiteId, string> = {
  main: "my-[60px] pc:mb-[90px]",
  rheuma: "mt-[60px] tb:mt-20 pc:my-[90px]",
  senmon: "my-[60px] pc:mb-[90px]",
};

/** ページタイトルの帯の下に置く本文の枠。 */
export function NewsSection({
  site,
  className = "",
  children,
}: {
  site: SiteId;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-5 pc:px-[100px]">
      <div className={`mx-auto max-w-[1410px] ${sectionMargins[site]} ${className}`}>{children}</div>
    </section>
  );
}

/** 記事やページがないときの案内。 */
export function NewsNotFound({ site }: { site: SiteId }) {
  return (
    <NewsSection site={site}>
      <p className="mb-4">お探しのページは見つかりませんでした。</p>
      <Link href={listHref(site)} className="text-brand underline hover:no-underline">
        一覧に戻る
      </Link>
    </NewsSection>
  );
}

export const newsHeadingClass =
  "mb-[30px] text-center text-[26px] leading-[1.7] font-bold tracking-[.05em] tb:mb-[60px] tb:text-left tb:text-[36px] tb:leading-[1.8]";

/** 詳細ページのタイトル。/rheuma/ は字間がなく、左上に丸い飾りが付く。 */
export function ArticleHeading({ site, children }: { site: SiteId; children: ReactNode }) {
  if (site !== "rheuma") return <h2 className={newsHeadingClass}>{children}</h2>;

  return (
    <h2 className="relative mb-[30px] text-center text-[26px] leading-[1.7] font-bold tb:mb-[60px] tb:pl-[1em] tb:text-left tb:text-[36px] tb:leading-[1.8] pc:pl-0">
      {children}
      <span aria-hidden className="absolute -top-[45px] left-0 block h-[69px] w-[63px] pc:-left-10">
        <span className="absolute top-0 left-0 size-[46px] rounded-full bg-brand/[.27]" />
        <span className="absolute right-0 bottom-0 size-[46px] rounded-full bg-[#46c6da]/30" />
      </span>
    </h2>
  );
}
