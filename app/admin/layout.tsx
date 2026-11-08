import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/AdminFrame";

// noindex はルートのレイアウトから引き継ぐ
export const metadata: Metadata = {
  title: "お知らせ投稿画面（デモ）",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminFrame>{children}</AdminFrame>;
}
