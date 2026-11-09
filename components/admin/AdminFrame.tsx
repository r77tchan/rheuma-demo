"use client";

import { useEffect } from "react";
import { blockFileDrop } from "@/lib/blockFileDrop";
import { SITE_IDS, siteShortLabels, siteTopHref } from "./ui";
import { AdminLink, LeaveGuardProvider } from "./LeaveGuard";

// 投稿画面の枠。サイトのヘッダーやフッターは使わない。
// 今いるページの表示に usePathname は使わない（ビルド時にIDが分からないページで止まるため。doc/メモ.md）。

export function AdminFrame({ children }: { children: React.ReactNode }) {
  // エディタの外にファイルを落としても、ページが移動しないようにする（種類が「リンクだけ」のときも）
  useEffect(() => blockFileDrop(window), []);

  return (
    <LeaveGuardProvider>
      <div className="min-h-screen bg-[#f4f6f9] text-[15px] leading-[1.7]">
        <header className="border-b border-[#dde2e8] bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 tb:px-6">
            <AdminLink href="/admin/" className="text-[17px] font-bold">
              お知らせ投稿画面
              <span className="ml-2 rounded bg-[#e8eef6] px-2 py-0.5 align-middle text-[12px] font-normal text-brand">
                デモ
              </span>
            </AdminLink>
            <nav aria-label="投稿画面" className="flex gap-4">
              <AdminLink href="/admin/" className="hover:text-brand">
                記事一覧
              </AdminLink>
              <AdminLink href="/admin/new/" className="hover:text-brand">
                新規作成
              </AdminLink>
            </nav>
            <div className="flex flex-wrap items-center gap-x-3 text-[13px] pc:ml-auto">
              <span className="text-[#666]">サイトを見る（別のタブ）:</span>
              {SITE_IDS.map((site) => (
                <a
                  key={site}
                  href={siteTopHref(site)}
                  target="_blank"
                  rel="noopener"
                  className="text-brand underline hover:no-underline"
                >
                  {siteShortLabels[site]}
                </a>
              ))}
            </div>
          </div>
          <p className="border-t border-[#f0e2b6] bg-[#fff8e1] px-4 py-2 text-[13px] tb:px-6">
            入力した内容は、このブラウザの中にだけ保存されます（Safariでは、7日間使わないと消えることがあります）。
          </p>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 tb:px-6">{children}</div>
      </div>
    </LeaveGuardProvider>
  );
}
