import Link from "next/link";

const RANGE = 2;

const itemClass =
  "m-1 block border border-brand px-3 py-2 leading-4 min-[960px]:transition-colors min-[960px]:duration-300";
const linkClass = `${itemClass} bg-white text-brand hover:bg-brand hover:text-white`;
const arrowClass = "text-[24px]";

/** ページ送り。現在のページの前後2つまで番号を出す。 */
export function Pagination({
  page,
  total,
  hrefFor,
}: {
  page: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  if (total <= 1) return null;

  const numbers: number[] = [];
  for (let n = Math.max(1, page - RANGE); n <= Math.min(total, page + RANGE); n++) numbers.push(n);

  return (
    <nav
      aria-label="ページ送り"
      className="mt-[35px] mb-5 flex flex-wrap items-center justify-center tb:mt-[50px] tb:mb-0"
    >
      {page > RANGE + 1 && (
        <Link href={hrefFor(1)} aria-label="最初のページ" className={`${linkClass} ${arrowClass}`}>
          «
        </Link>
      )}
      {page > 1 && (
        <Link href={hrefFor(page - 1)} aria-label="前のページ" className={`${linkClass} ${arrowClass} mr-4`}>
          ‹
        </Link>
      )}
      {numbers.map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className={`${itemClass} bg-brand text-white`}>
            {n}
          </span>
        ) : (
          <Link key={n} href={hrefFor(n)} className={linkClass}>
            {n}
          </Link>
        ),
      )}
      {page < total && (
        <Link href={hrefFor(page + 1)} aria-label="次のページ" className={`${linkClass} ${arrowClass} ml-4`}>
          ›
        </Link>
      )}
      {page < total - RANGE && (
        <Link href={hrefFor(total)} aria-label="最後のページ" className={`${linkClass} ${arrowClass}`}>
          »
        </Link>
      )}
    </nav>
  );
}
