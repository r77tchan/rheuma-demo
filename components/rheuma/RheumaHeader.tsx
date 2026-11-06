"use client";

import Link from "next/link";
import { rheumaFacility, rheumaNav, rheumaSite } from "@/data/rheuma";
import { useFullMenu } from "@/lib/useFullMenu";
import { useScrolledPast } from "@/lib/useScrolledPast";
import { MenuButton } from "../MenuButton";
import { IconPlaceholder, LogoPlaceholder, SiteLink } from "../parts";
import { RheumaFullMenu } from "./RheumaFullMenu";

/** 元サイトと同じく、PC幅では横幅が1670px以上あり、狭い画面では右端のナビが切れる。 */
export function RheumaHeader() {
  const { menuId, menuOpen, setMenuOpen } = useFullMenu();
  const pastHeader = useScrolledPast(60);

  return (
    <header
      className={`fixed top-0 left-0 z-[1000] h-[70px] w-full bg-white py-1.5 pl-5 transition-[margin] duration-500 tb:h-[90px] tb:py-[15px] pc:mt-0 pc:min-w-[1670px] pc:pl-10 ${
        pastHeader ? "mt-0" : "mt-[60px]"
      }`}
    >
      <div className="flex justify-between">
        <div className="flex">
          <Link href={rheumaSite.home} className="hidden pc:block">
            <LogoPlaceholder className="h-[50px] w-[215px]" />
          </Link>
          <p className="text-[18px] leading-[1.5] font-medium tb:text-[24px] tb:leading-[1.25] pc:ml-[47px]">
            {rheumaSite.name}
            <br />
            <span className="rounded-[20px] bg-[#ff8993] px-5 py-[5px] text-[14px] text-white tb:text-[15px]">
              {rheumaSite.audience}
            </span>
          </p>
        </div>

        <nav aria-label="グローバルナビ" className="mr-[100px] hidden text-[18px] font-medium pc:block">
          <ul className="link-fade flex h-[60px] items-center">
            {rheumaNav.map((item) => (
              <li key={item.label}>
                <SiteLink href={item.href} className="mr-[3em]">
                  {item.label}
                </SiteLink>
              </li>
            ))}
            <li>
              <a href="#" className="mr-[3em]">
                <IconPlaceholder className="mr-[7px] mb-[2.5px] inline-block size-[17px] align-middle" />
                {rheumaFacility}
              </a>
            </li>
            <li>
              <a href="#" aria-label="SNSのダミーリンク" className="mr-[3em] block">
                <IconPlaceholder className="size-10 rounded-full" />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <RheumaFullMenu
        id={menuId}
        open={menuOpen}
        pastHeader={pastHeader}
        onNavigate={() => setMenuOpen(false)}
      />

      <MenuButton
        menuId={menuId}
        open={menuOpen}
        pastHeader={pastHeader}
        colorClass="bg-[#46c6da]"
        onClick={() => setMenuOpen((open) => !open)}
      />
    </header>
  );
}
