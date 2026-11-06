"use client";

import { senmonMenu } from "@/data/senmon";
import {
  FullMenuPanel,
  menuListClass,
  menuOtherItemClass,
  MenuGroup,
  plainItem,
  type FullMenuProps,
} from "../FullMenu";
import { IconPlaceholder, SiteLink } from "../parts";

/** /senmon/ の全画面メニュー。PC幅では左に3列×2段のまとまり、右に単独のリンクを置く。 */
export function SenmonFullMenu(props: FullMenuProps) {
  return (
    <FullMenuPanel {...props} first={senmonMenu.first}>
      <div className={`${menuListClass} pc:flex-nowrap`}>
        <div className="tb:flex tb:flex-wrap">
          {senmonMenu.groups.map((item) => (
            <ul key={item.label} className="tb:w-[33.3%] pc:w-[380px]">
              <MenuGroup item={item} />
            </ul>
          ))}
        </div>
        <ul className="pc:shrink-0">
          {senmonMenu.links.map((item) => (
            <li key={item.label} className={`${plainItem} pc:text-right`}>
              <SiteLink href={item.href}>{item.label}</SiteLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="tb:flex tb:flex-wrap tb:justify-between">
        <ul className="tb:flex">
          {senmonMenu.others.map((item) => (
            <li key={item.label} className={menuOtherItemClass}>
              <SiteLink href={item.href}>{item.label}</SiteLink>
            </li>
          ))}
        </ul>
        <div>
          <SiteLink
            href={senmonMenu.foundation.href}
            className="relative inline-block w-[180px] bg-brand py-2 text-center text-[14px] text-white"
          >
            <IconPlaceholder className="absolute inset-y-0 left-[15px] m-auto h-5 w-[15px]" />
            {senmonMenu.foundation.label}
          </SiteLink>
        </div>
      </div>
    </FullMenuPanel>
  );
}
