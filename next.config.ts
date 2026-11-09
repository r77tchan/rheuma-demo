import type { NextConfig } from "next";

/** GitHub Pages の公開URL（https://r77tchan.github.io/rheuma-demo/）の先頭のパス。 */
const BASE_PATH = "/rheuma-demo";

const nextConfig: NextConfig = {
  // next dev が AGENTS.md に指示ブロックを書き足すのを防ぐ（doc/メモ.md 参照）
  agentRules: false,
  // GitHub Pages で配信するため、ビルドで静的なファイル（out/）を書き出す。
  // Cache Components と Partial Prefetching は静的な書き出しと一緒に使えないので外している（doc/メモ.md 参照）
  output: "export",
  basePath: BASE_PATH,
  // Link と useRouter には basePath が自動で付く。生の <a>、iframe、location に渡すURLは lib/basePath.ts で付ける
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
