import type { Metadata } from "next";
import { RheumaSiteShell } from "@/components/rheuma/RheumaSiteShell";

export const metadata: Metadata = {
  title: "一般・患者さん向けサイト（デモ）",
};

export default function RheumaLayout({ children }: LayoutProps<"/rheuma">) {
  return <RheumaSiteShell>{children}</RheumaSiteShell>;
}
