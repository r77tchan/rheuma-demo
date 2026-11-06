import type { Metadata } from "next";
import { Lato, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
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

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "レイアウトモック",
  description: "レイアウト確認用のモックです。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${lato.variable} ${notoSans.variable} ${notoSerif.variable}`}
    >
      <body className="pc:min-w-[1370px]">{children}</body>
    </html>
  );
}
