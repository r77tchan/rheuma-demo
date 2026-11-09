"use client";

import { useEffect } from "react";
import { blockFileDrop } from "@/lib/blockFileDrop";
import { DemoNotice } from "./DemoNotice";
import { ExternalLinkIcon } from "./ExternalLinkIcon";
import { AdminLink, LeaveGuardProvider } from "./LeaveGuard";
import { SITE_IDS, siteShortLabels, siteTopHref } from "./ui";

// 投稿画面の枠。サイトのヘッダーやフッターは使わない。
// 今いるページの表示に usePathname は使わない（ビルド時にIDが分からないページで止まるため。doc/メモ.md）。

export function AdminFrame({ children }: { children: React.ReactNode }) {
  // エディタの外にファイルを落としても、ページが移動しないようにする（種類が「リンクだけ」のときも）
  useEffect(() => blockFileDrop(window), []);

  return (
    <div className="admin-ui min-h-screen bg-[#f4f6f9] text-[15px] leading-[1.7]">
      <LeaveGuardProvider>
        <header className="border-b border-[#dde2e8] bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 tb:px-6">
            <AdminLink href="/admin/" className="text-[17px] font-bold">
              お知らせ投稿画面
              <span className="ml-2 rounded bg-[#e8eef6] px-2 py-0.5 align-middle text-[12px] font-normal text-brand">
                デモ
              </span>
            </AdminLink>
            <nav aria-label="各サイト" className="flex flex-wrap items-center gap-x-4 text-[14px] tb:ml-auto">
              {SITE_IDS.map((site) => (
                <a
                  key={site}
                  href={siteTopHref(site)}
                  target="_blank"
                  rel="noopener"
                  className="text-brand underline hover:no-underline"
                >
                  {siteShortLabels[site]}
                  <ExternalLinkIcon />
                </a>
              ))}
            </nav>
          </div>
          <DemoNotice />
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 tb:px-6">{children}</div>
      </LeaveGuardProvider>
    </div>
  );
}
