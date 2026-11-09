import type { Metadata } from "next";
import { SenmonSiteShell } from "@/components/senmon/SenmonSiteShell";

// (home) と同じ値にする
export const metadata: Metadata = {
  title: "医療関係者向けサイト（デモ）",
};

export default function SenmonLowerLayout({ children }: LayoutProps<"/senmon">) {
  return <SenmonSiteShell>{children}</SenmonSiteShell>;
}
