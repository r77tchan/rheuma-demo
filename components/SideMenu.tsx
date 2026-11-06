"use client";

import { sideMenu } from "@/data/site";
import { useScrolledPast } from "@/lib/useScrolledPast";
import { IconPlaceholder } from "./parts";

/** PCでは右端に固定し、1024px以下では画面上部の横バーにする。バーは下へスクロールすると隠れる。 */
export function SideMenu() {
  const hidden = useScrolledPast(90);

  return (
    <ul
      className={`link-fade fixed top-0 left-0 z-[100] flex w-full transition-transform duration-500 pc:top-1/2 pc:right-0 pc:left-auto pc:block pc:w-auto pc:-translate-y-1/2 ${
        hidden ? "-translate-y-full" : ""
      }`}
    >
      {sideMenu.map((label) => (
        <li key={label} className="flex-1 leading-none pc:mb-[3px] pc:w-[66px]">
          <a
            href="#"
            className="block h-[66px] w-full border-r border-[#999] bg-[#333] pt-2 text-center text-[10px] text-white [li:first-child>&]:pc:rounded-tl-[20px] [li:last-child>&]:border-r-0 [li:last-child>&]:pc:rounded-bl-[20px] pc:h-auto pc:min-h-[66px] pc:border-r-0 pc:bg-brand pc:pt-2.5 pc:pb-[5px]"
          >
            <IconPlaceholder className="mx-auto size-[30px]" />
            <p className="mt-[5px] leading-[1.2]">{label}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}
