# rheuma-demo

お知らせを1回入力すれば、3つのサイトに載る様子を見せるデモです。

既存サイトのトップページとお知らせまわりを参考に、レイアウトと配色を再現しています。ロゴ、組織名、記事の文章、画像はダミーです。

- メインサイト（`/`）と2つのサブサイト（`/rheuma/`、`/senmon/`）の、トップ、お知らせの一覧、カテゴリ別、詳細
- お知らせの投稿画面（`/admin/`）: 記事の追加、編集、削除。載せるサイトとカテゴリを選び、各サイトでの見え方をプレビューで確かめてから公開する
- PC・タブレット・スマホの3つの幅に対応（切り替えは 768px と 1025px）

## 見る

| | URL |
| --- | --- |
| サイト | https://r77tchan.github.io/rheuma-demo/ |
| 投稿画面 | https://r77tchan.github.io/rheuma-demo/admin/ |

サーバーはなく、投稿画面で入力した内容は、開いたブラウザの中にだけ保存されます（ほかの人や、ほかの端末には反映されません）。投稿画面の「初期状態に戻す」で消せます。

検索エンジンには載せない設定（`noindex`）にしています。

## 手元で動かす

```bash
npm install
npm run dev
```

http://localhost:3000/rheuma-demo/ で開きます。

## 公開のしかた

`main` にプッシュすると、GitHub Actions がビルドして GitHub Pages に公開します（`.github/workflows/deploy.yml`）。

静的なファイルとして書き出すので、投稿画面で追加する記事のページ（ID 1000〜1099）や、増えたページ送りも、ビルドのときに先に作っています（`lib/staticPages.ts`）。

## 開発について

開発は AI（Claude Code）で行っています。作業のルールは [AGENTS.md](AGENTS.md) にあります。

- [doc/指示.md](doc/指示.md)：プロジェクトの目的とルール
- [doc/メモ.md](doc/メモ.md)：決まったこと・分かったことのメモ
- [components/](components/)：画面の部品
- [data/](data/)：画面に表示するダミーの文言と、お知らせの初期記事

技術スタックは Next.js（App Router、静的な書き出し）、TypeScript、Tailwind CSS、Tiptap、GitHub Pages です。
