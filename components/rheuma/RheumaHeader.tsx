"use client";

import { rheumaFacility, rheumaNav, rheumaSite } from "@/data/rheuma";
import { IconPlaceholder, SiteLink } from "../parts";
import { SubSiteHeader } from "../SubSiteHeader";
import { RheumaFullMenu } from "./RheumaFullMenu";

export function RheumaHeader() {
  return (
    <SubSiteHeader
      site={rheumaSite}
      minWidthClass="pc:min-w-[1670px]"
      audienceClass="bg-[#ff8993]"
      buttonClass="bg-[#46c6da]"
      FullMenu={RheumaFullMenu}
    >
      {rheumaNav.map((item) => (
        <li key={item.label}>
          <SiteLink href={item.href} className="mr-[3em]">
            {item.label}
          </SiteLink>
        </li>
      ))}
      <li>
        <a className="mr-[3em]">
          <IconPlaceholder className="mr-[7px] mb-[2.5px] inline-block size-[17px] align-middle" />
          {rheumaFacility}
        </a>
      </li>
      <li>
        <a className="mr-[3em] block">
          <IconPlaceholder className="size-10 rounded-full" />
        </a>
      </li>
    </SubSiteHeader>
  );
}
