import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev が AGENTS.md に指示ブロックを書き足すのを防ぐ（doc/メモ.md 参照）
  agentRules: false,
  trailingSlash: true,
  cacheComponents: true,
  partialPrefetching: true,
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
