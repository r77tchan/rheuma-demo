import type { Metadata } from "next";
import { Lato, Noto_Sans_JP } from "next/font/google";
import { DummyLinkToast } from "@/components/DummyLinkToast";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
});

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "レイアウトモック",
  description: "レイアウト確認用のモックです。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${lato.variable} ${notoSans.variable}`}
    >
      <body>
        {children}
        <DummyLinkToast />
      </body>
    </html>
  );
}
