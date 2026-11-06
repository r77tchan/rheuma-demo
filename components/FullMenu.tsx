"use client";

import { useState, type ReactNode } from "react";
import { fullMenu, globalNav, type LinkItem, type NavChild, type NavItem } from "@/data/site";
import { PdfMark, SiteLink } from "./parts";

/** 子メニューの1行。孫メニューがあれば、タップで開閉する。 */
function ChildItem({ child }: { child: NavChild }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="relative pl-[25px] text-[16px] leading-[2] font-normal">
      <span
        aria-hidden
        className="absolute top-4 left-0 h-0.5 w-[15px] bg-brand tb:top-[9px] tb:h-[15px] tb:rounded-full"
      />
      <span
        aria-hidden
        className="absolute top-[14px] left-1 hidden size-[5px] rotate-45 border-t border-r border-white tb:block"
      />
      {child.children ? (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="cursor-pointer text-left"
          >
            {child.label}
          </button>
          <ul className={open ? "block" : "hidden"}>
            {child.children.map((grandchild) => (
              <li
                key={grandchild.label}
                className="relative pl-[25px] text-[16px] leading-[2] font-normal"
              >
                <span aria-hidden className="absolute top-4 left-0 h-0.5 w-[15px] bg-brand" />
                <a href="#">{grandchild.label}</a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <a href="#">
          {child.label}
          {child.pdf && <PdfMark />}
        </a>
      )}
    </li>
  );
}

/** 子メニューを持つ項目。スマホではタップで開閉し、タブレット以上では常に開いている。 */
export function MenuGroup({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li className={plainItem}>
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
          <ChildItem key={child.label} child={child} />
        ))}
      </ul>
    </li>
  );
}

export const plainItem = "mb-5 text-[18px] font-medium tb:mb-[30px] tb:pr-2.5 tb:text-[20px]";

/** 項目を囲む線の枠。 */
export const menuListClass =
  "mb-5 border-y border-[#666] pt-5 tb:mt-2.5 tb:mb-10 tb:flex tb:flex-wrap tb:justify-between tb:pt-10 tb:pb-2.5";

/** 線の枠の下の小さなリンク。 */
export const menuOtherItemClass = "mb-5 text-[16px] tb:mb-[30px] tb:pr-2.5 tb:not-first:ml-[85px]";

type FullMenuProps = {
  id: string;
  open: boolean;
  pastHeader: boolean;
  /** メニュー内のリンクが押されたときに呼ぶ。同じレイアウト内の移動でも閉じるため。 */
  onNavigate: () => void;
};

/** 全画面メニューの枠と、先頭のリンク。項目は children で渡す。 */
export function FullMenuPanel({
  id,
  open,
  pastHeader,
  onNavigate,
  first,
  children,
}: FullMenuProps & { first: LinkItem; children: ReactNode }) {
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
            <SiteLink href={first.href}>{first.label}</SiteLink>
          </li>
        </ul>
        {children}
      </nav>
    </div>
  );
}

/** メニューボタンで開く全画面メニュー。 */
export function FullMenu(props: FullMenuProps) {
  return (
    <FullMenuPanel {...props} first={fullMenu.first}>
      <div className={menuListClass}>
        {globalNav.map((item) =>
          item.children ? (
            <ul key={item.label} className="tb:w-1/3 pc:w-auto">
              <MenuGroup item={item} />
            </ul>
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
            <li key={item.label} className={menuOtherItemClass}>
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
    </FullMenuPanel>
  );
}
