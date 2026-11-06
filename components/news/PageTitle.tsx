import Link from "next/link";
import { siteNews, type SiteId } from "@/data/news";
import { rheumaSite } from "@/data/rheuma";

export type Crumb = { label: string; href?: string };

export function homeCrumb(site: SiteId): Crumb {
  return { label: "HOME", href: `${siteNews[site].basePath}/` };
}

/** 一覧のページのパンくず。 */
export function listCrumbs(site: SiteId): Crumb[] {
  return [homeCrumb(site), { label: siteNews[site].heading }];
}

function Breadcrumb({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="パンくず">
      <ul className={`flex flex-wrap ${className}`}>
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
  );
}

/** /rheuma/ のページタイトルの帯。吹き出しが付き、見出しは明朝ではない。 */
function RheumaPageTitle({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="bg-menu px-5 pt-5 pb-2.5 tb:pt-[30px] pc:px-[100px] pc:pb-[30px]">
      <div className="mx-auto max-w-[1450px]">
        <span className="relative mb-[5px] inline-block w-[215px] rounded-[10px] bg-[#46c6da] py-[3px] text-center text-[20px] font-medium text-white">
          {rheumaSite.catchphrase}
          <span
            aria-hidden
            className="absolute top-full left-1/2 -translate-x-1/2 border-[13px] border-transparent border-t-[#46c6da]"
          />
        </span>
        <h1 className="mt-2.5 text-[30px] leading-[1.3] font-bold text-[#ff8993] tb:mt-0 tb:text-[60px] tb:leading-[1.8]">
          {siteNews.rheuma.heading}
        </h1>
        <div className="font-medium">
          <Breadcrumb crumbs={crumbs} className="mt-2.5 tb:mt-0" />
        </div>
      </div>
    </div>
  );
}

/** ページタイトルの帯とパンくず。 */
export function PageTitle({ site, crumbs }: { site: SiteId; crumbs: Crumb[] }) {
  if (site === "rheuma") return <RheumaPageTitle crumbs={crumbs} />;

  return (
    <div className="bg-menu px-5 pt-5 pb-[15px] tb:pt-[30px] tb:pb-2.5 pc:px-[100px] pc:py-[25px]">
      <div className="mx-auto max-w-[1450px]">
        <h1 className="mb-2.5 font-serif text-[30px] leading-[1.3] font-medium tracking-[.05em] text-brand tb:mb-0 tb:text-[36px] tb:leading-[1.8]">
          {siteNews[site].heading}
        </h1>
        <Breadcrumb crumbs={crumbs} />
      </div>
    </div>
  );
}
