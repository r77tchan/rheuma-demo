"use client";

import { rheumaMenu, rheumaMenuColumns } from "@/data/rheuma";
import { FullMenuPanel, menuListClass, menuOtherItemClass, MenuGroup } from "../FullMenu";
import { IconPlaceholder, SiteLink } from "../parts";

/** /rheuma/ の全画面メニュー。 */
export function RheumaFullMenu(props: {
  id: string;
  open: boolean;
  pastHeader: boolean;
  onNavigate: () => void;
}) {
  return (
    <FullMenuPanel {...props} first={rheumaMenu.first}>
      <div className={menuListClass}>
        {rheumaMenuColumns.map((column, index) => (
          // 1列目の幅は、PC幅で列の位置が元サイトと揃うように指定する
          <ul key={column[0].label} className={`tb:w-[31%] ${index === 0 ? "pc:w-[462px]" : "pc:w-auto"}`}>
            {column.map((item) => (
              <MenuGroup key={item.label} item={item} />
            ))}
          </ul>
        ))}
        <ul className="tb:flex tb:w-full tb:justify-between pc:block pc:w-auto">
          {rheumaMenu.links.map((item) => (
            <li
              key={item.label}
              className="mb-5 text-[18px] font-medium tb:mb-[30px] tb:pr-2.5 tb:text-[16px] pc:text-right pc:text-[18px]"
            >
              <SiteLink href={item.href}>{item.label}</SiteLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="tb:flex tb:flex-wrap tb:justify-between">
        <ul className="tb:flex">
          {rheumaMenu.others.map((item) => (
            <li key={item.label} className={menuOtherItemClass}>
              <SiteLink href={item.href}>{item.label}</SiteLink>
            </li>
          ))}
        </ul>
        <div>
          <SiteLink
            href={rheumaMenu.foundation.href}
            className="relative inline-block w-[180px] bg-brand py-2 text-center text-[14px] text-white"
          >
            <IconPlaceholder className="absolute inset-y-0 left-[15px] m-auto h-5 w-[15px]" />
            {rheumaMenu.foundation.label}
          </SiteLink>
        </div>
      </div>
    </FullMenuPanel>
  );
}
