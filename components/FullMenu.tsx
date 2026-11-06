"use client";

import { useState } from "react";
import { fullMenu, globalNav, type NavItem } from "@/data/site";
import { PdfMark, SiteLink } from "./parts";

/** 子メニューを持つ項目。スマホではタップで開閉し、タブレット以上では常に開いている。 */
function ParentItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  return (
    <ul className="tb:w-1/3 pc:w-auto">
      <li className="mb-5 text-[18px] font-medium tb:mb-[30px] tb:pr-2.5 tb:text-[20px]">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="relative block w-full cursor-pointer text-left font-medium tb:pointer-events-none"
        >
          {item.label}
          <span
            aria-hidden
            className="absolute top-[3px] right-0 size-[25px] rounded-full bg-brand tb:hidden"
          />
          <span
            aria-hidden
            className={`absolute right-2.5 size-[7px] border-t border-r border-white transition-transform tb:hidden ${
              open ? "top-[11px] rotate-[135deg]" : "top-3 rotate-45"
            }`}
          />
        </button>
        <ul className={`mt-5 ${open ? "block" : "hidden"} tb:block`}>
          {item.children?.map((child) => (
            <li
              key={child.label}
              className="relative pl-[25px] text-[16px] leading-[2] font-normal"
            >
              <span
                aria-hidden
                className="absolute top-4 left-0 h-0.5 w-[15px] bg-brand tb:top-[9px] tb:h-[15px] tb:rounded-full"
              />
              <span
                aria-hidden
                className="absolute top-[14px] left-1 hidden size-[5px] rotate-45 border-t border-r border-white tb:block"
              />
              <a href="#">
                {child.label}
                {child.pdf && <PdfMark />}
              </a>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}

const plainItem = "mb-5 text-[18px] font-medium tb:mb-[30px] tb:pr-2.5 tb:text-[20px]";

/** メニューボタンで開く全画面メニュー。 */
export function FullMenu({
  id,
  open,
  pastHeader,
  onNavigate,
}: {
  id: string;
  open: boolean;
  pastHeader: boolean;
  /** メニュー内のリンクが押されたときに呼ぶ。同じレイアウト内の移動でも閉じるため。 */
  onNavigate: () => void;
}) {
  return (
    <div
      id={id}
      className={`link-fade fixed left-0 z-[99] w-full overflow-auto bg-menu px-5 py-10 transition-[opacity,visibility] duration-500 pc:top-0 pc:h-dvh ${
        pastHeader ? "top-[70px] h-[calc(100dvh-70px)]" : "top-[60px] h-[calc(100dvh-60px)]"
      } ${open ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <nav
        aria-label="全体メニュー"
        className="mx-auto max-w-[1370px]"
        onClick={(event) => {
          if ((event.target as Element).closest("a")) onNavigate();
        }}
      >
        <ul>
          <li className={plainItem}>
            <SiteLink href={fullMenu.first.href}>{fullMenu.first.label}</SiteLink>
          </li>
        </ul>

        <div className="mb-5 border-y border-[#666] pt-5 tb:mt-2.5 tb:mb-10 tb:flex tb:flex-wrap tb:justify-between tb:pt-10 tb:pb-2.5">
          {globalNav.map((item) =>
            item.children ? (
              <ParentItem key={item.label} item={item} />
            ) : (
              <ul key={item.label}>
                <li className={plainItem}>
                  <a href="#">{item.label}</a>
                </li>
              </ul>
            ),
          )}
          <ul>
            {fullMenu.extras.map((label) => (
              <li key={label} className={plainItem}>
                <a href="#">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="tb:flex tb:flex-wrap tb:justify-between">
          <ul className="tb:flex">
            {fullMenu.others.map((item) => (
              <li
                key={item.label}
                className="mb-5 text-[16px] tb:mb-[30px] tb:pr-2.5 tb:not-first:ml-[85px]"
              >
                <SiteLink href={item.href}>{item.label}</SiteLink>
              </li>
            ))}
          </ul>
          <div className="mb-[50px] flex w-full shadow-[1px_1px_2px_0_rgba(0,0,0,.05)] tb:mb-0 pc:h-11 pc:w-[350px]">
            <input
              type="search"
              aria-label="検索欄（ダミー）"
              placeholder={fullMenu.searchPlaceholder}
              className="h-11 min-w-0 flex-1 bg-white px-3 text-[14px]"
            />
            <button
              type="button"
              aria-label="検索（ダミー）"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center bg-brand"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] fill-none stroke-white stroke-[2.5]">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m15.5 15.5 5.5 5.5" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
