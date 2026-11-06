"use client";

import { senmonNav, senmonSite } from "@/data/senmon";
import type { NavChild } from "@/data/site";
import { navDropdownClass, navDropdownLinkClass } from "../Header";
import { IconPlaceholder } from "../parts";
import { SubSiteHeader } from "../SubSiteHeader";
import { SenmonFullMenu } from "./SenmonFullMenu";

/** 子メニューの1行。孫メニューは、リンクが動かなくてもマウスを乗せると右に開く。元サイトと同じくPDFのマークは出さない。 */
function NavChildItem({ child }: { child: NavChild }) {
  if (!child.children) {
    return (
      <li>
        <a className={navDropdownLinkClass}>{child.label}</a>
      </li>
    );
  }

  return (
    <li className="group/sub relative">
      <a className={navDropdownLinkClass}>{child.label}</a>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-2.5 m-auto block size-[5px] rotate-45 border-t border-r border-[#999]"
      />
      <ul className="invisible absolute top-0 left-[201px] z-[2] w-[200px] bg-white opacity-0 shadow-[0_0_5px_0_#aaa] transition-[opacity,visibility] duration-300 group-hover/sub:visible group-hover/sub:opacity-100">
        {child.children.map((grandchild) => (
          <li key={grandchild.label}>
            <a className={navDropdownLinkClass}>{grandchild.label}</a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function SenmonHeader() {
  return (
    <SubSiteHeader
      site={senmonSite}
      minWidthClass="pc:min-w-[1640px]"
      audienceClass="bg-brand"
      buttonClass="bg-brand"
      FullMenu={SenmonFullMenu}
    >
      {senmonNav.map((item) => (
        <li key={item.label} className="group relative mr-[3em]">
          {item.children ? (
            <>
              <button type="button" className="cursor-pointer">
                {item.label}
              </button>
              <ul className={navDropdownClass}>
                {item.children.map((child) => (
                  <NavChildItem key={child.label} child={child} />
                ))}
              </ul>
            </>
          ) : (
            <a>{item.label}</a>
          )}
        </li>
      ))}
      <li className="mr-[3em]">
        <a>
          <IconPlaceholder className="size-10 rounded-full" />
        </a>
      </li>
    </SubSiteHeader>
  );
}
