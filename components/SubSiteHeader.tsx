"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useFullMenu } from "@/lib/useFullMenu";
import { useScrolledPast } from "@/lib/useScrolledPast";
import type { FullMenuProps } from "./FullMenu";
import { MenuButton } from "./MenuButton";
import { LogoPlaceholder } from "./parts";

/**
 * サブサイト共通のヘッダー。ナビの項目は children に li で渡す。
 * 元サイトと同じく、PC幅では横幅に下限があり、狭い画面では右端のナビが切れる。
 */
export function SubSiteHeader({
  site,
  minWidthClass,
  audienceClass,
  buttonClass,
  FullMenu,
  children,
}: {
  site: { home: string; name: string; audience: string };
  minWidthClass: string;
  audienceClass: string;
  buttonClass: string;
  FullMenu: ComponentType<FullMenuProps>;
  children: ReactNode;
}) {
  const { menuId, menuOpen, setMenuOpen } = useFullMenu();
  const pastHeader = useScrolledPast(60);

  return (
    <header
      className={`fixed top-0 left-0 z-[1000] h-[70px] w-full bg-white py-1.5 pl-5 transition-[margin] duration-500 tb:h-[90px] tb:py-[15px] pc:mt-0 pc:pl-10 ${minWidthClass} ${
        pastHeader ? "mt-0" : "mt-[60px]"
      }`}
    >
      <div className="flex justify-between">
        <div className="flex">
          <Link href={site.home} className="hidden pc:block">
            <LogoPlaceholder className="h-[50px] w-[215px]" />
          </Link>
          <p className="text-[18px] leading-[1.5] font-medium tb:text-[24px] tb:leading-[1.25] pc:ml-[47px]">
            {site.name}
            <br />
            <span
              className={`rounded-[20px] px-5 py-[5px] text-[14px] text-white tb:text-[15px] ${audienceClass}`}
            >
              {site.audience}
            </span>
          </p>
        </div>

        <nav aria-label="グローバルナビ" className="mr-[100px] hidden text-[18px] font-medium pc:block">
          <ul className="link-fade flex h-[60px] items-center">{children}</ul>
        </nav>
      </div>

      <FullMenu
        id={menuId}
        open={menuOpen}
        pastHeader={pastHeader}
        onNavigate={() => setMenuOpen(false)}
      />

      <MenuButton
        menuId={menuId}
        open={menuOpen}
        pastHeader={pastHeader}
        colorClass={buttonClass}
        onClick={() => setMenuOpen((open) => !open)}
      />
    </header>
  );
}
