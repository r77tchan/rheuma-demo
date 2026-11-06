import Link from "next/link";
import { siteCategories, type Category, type SiteId } from "@/data/news";
import { categoryHref } from "@/lib/newsUrls";

/** カテゴリの絞り込みボタン。スマホ幅ではページ送りの下へ移る。 */
export function CategoryFilter({ site }: { site: SiteId }) {
  const categories: Record<string, Category> = siteCategories[site];

  return (
    <ul className="order-2 mt-[30px] font-medium tb:order-none tb:mt-0 tb:mb-[50px] tb:flex">
      {Object.entries(categories).map(([id, category]) => (
        <li key={id}>
          <Link
            href={categoryHref(site, id)}
            className="mb-2.5 block w-full rounded-[5px] border-2 border-brand py-2 text-center text-brand [li:last-child>&]:m-0 tb:mr-2.5 tb:mb-0 tb:w-[138px] pc:w-[160px] min-[960px]:transition-colors min-[960px]:duration-300 min-[960px]:hover:bg-brand min-[960px]:hover:text-white"
          >
            {category.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
