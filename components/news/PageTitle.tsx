import Link from "next/link";
import { siteNews, type SiteId } from "@/data/news";

export type Crumb = { label: string; href?: string };

export function homeCrumb(site: SiteId): Crumb {
  return { label: "HOME", href: `${siteNews[site].basePath}/` };
}

/** 一覧のページのパンくず。 */
export function listCrumbs(site: SiteId): Crumb[] {
  return [homeCrumb(site), { label: siteNews[site].heading }];
}

/** ページタイトルの帯とパンくず。 */
export function PageTitle({ site, crumbs }: { site: SiteId; crumbs: Crumb[] }) {
  return (
    <div className="bg-menu px-5 pt-5 pb-[15px] tb:pt-[30px] tb:pb-2.5 pc:px-[100px] pc:py-[25px]">
      <div className="mx-auto max-w-[1450px]">
        <h1 className="mb-2.5 font-serif text-[30px] leading-[1.3] font-medium tracking-[.05em] text-brand tb:mb-0 tb:text-[36px] tb:leading-[1.8]">
          {siteNews[site].heading}
        </h1>
        <nav aria-label="パンくず">
          <ul className="flex flex-wrap">
            {crumbs.map((crumb, index) => (
              <li
                key={index}
                className="mr-2.5 mb-[13px] text-[13px] leading-none text-[#666] not-last:after:inline-block not-last:after:pl-2.5 not-last:after:text-[12px] not-last:after:content-['＞'] tb:mb-4 tb:text-[16px] tb:leading-[1.8]"
              >
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
