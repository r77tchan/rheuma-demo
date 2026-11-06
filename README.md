# rheuma-demo

トップページのレイアウトモック

既存サイトのトップページを参考に、レイアウトと配色を再現したモックです。画像とロゴはグレーのダミー、文言もすべてダミーで、参考サイトの文言や画像は使っていません。

- PC・タブレット・スマホの3つの幅に対応（切り替えは 768px と 1025px）
- ドロップダウン、全画面メニュー、スマホのスライダーなどの動きも再現
- 今は静的なページ。お知らせなど一部を、後で動的にするかもしれません

## 見る

| | URL |
| --- | --- |
| 公開中のモック | https://rheuma-demo.vercel.app |

`main` にプッシュすると、Vercel に自動でデプロイされます。

## 手元で動かす

```bash
npm install
npm run dev
```

http://localhost:3000 で開きます。

## 開発について

開発は AI（Claude Code）で行っています。作業のルールは [AGENTS.md](AGENTS.md) にあります。

- [doc/指示.md](doc/指示.md)：プロジェクトの目的とルール
- [doc/メモ.md](doc/メモ.md)：決まったこと・分かったことのメモ
- [components/](components/)：画面の部品
- [data/site.ts](data/site.ts)：画面に表示するダミーの文言

技術スタックは Next.js（App Router）、TypeScript、Tailwind CSS、Vercel です。
