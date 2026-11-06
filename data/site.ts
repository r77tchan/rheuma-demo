// 画面に表示する文言をまとめたファイル。
// お知らせの見出しとリンクは元サイトと同じ。ナビやボタンなどの残りはまだダミーで、
// 文字数だけを合わせてレイアウトが近くなるようにしている。サイト名、ロゴはダミーのままにする。

export type NavChild = { label: string; pdf?: boolean };
export type NavItem = { label: string; children?: NavChild[] };

const subItems = (count: number, pdfIndexes: number[] = []): NavChild[] =>
  Array.from({ length: count }, (_, i) => ({
    label: `サブメニュー項目${i + 1}`,
    pdf: pdfIndexes.includes(i),
  }));

export const globalNav: NavItem[] = [
  { label: "グローバルナビ項目A", children: subItems(8, [3, 4, 5]) },
  { label: "ナビ項目" },
  { label: "ナビゲーション", children: subItems(6) },
  { label: "メニュー項目", children: subItems(2) },
];

export const fullMenu = {
  first: "メニュー先頭の項目",
  extras: ["追加メニュー項目1", "追加メニュー項目2", "追加メニュー項目3"],
  others: ["補助項目1", "補助項目2", "補助メニュー項目3", "補助項目4"],
  searchPlaceholder: "検索キーワード",
};

export const sideMenu = ["サイド項目1", "サイド項目2", "サイド項目3", "サイド項目4"];

export const guides = [
  {
    title: "ガイド見出しA",
    lines: ["ここに説明テキストが", "入ります。ダミーの文章です"],
    button: "ボタンのテキストA",
    color: "bg-pink",
  },
  {
    title: "ガイド見出しテキストB",
    lines: ["ここには説明のテキストが入ります。", "ダミーの文章です"],
    button: "ボタンのテキストB",
    color: "bg-teal",
  },
];

export const greeting = {
  message:
    "ここには代表者からのメッセージが入ります。レイアウト確認用の文章で、内容に意味はありません。",
  organization: "組織名のテキスト",
  name: "役職名　氏名テキスト",
  button: "詳細ボタン",
};

export const news = {
  heading: "お知らせ",
  more: "もっとみる",
};

const links = (count: number, pdfIndexes: number[] = []): NavChild[] =>
  Array.from({ length: count }, (_, i) => ({
    label: `リンクテキスト${i + 1}`,
    pdf: pdfIndexes.includes(i),
  }));

export const contentCards = [
  {
    title: "カード見出しA",
    english: "English Title A",
    overlay: "bg-[rgba(0,170,170,0.7)]",
    links: links(2),
  },
  {
    title: "カード見出しB",
    english: "English Title Text B",
    overlay: "bg-[rgba(0,87,173,0.7)]",
    links: links(7, [2, 3, 4]),
  },
  {
    title: "カード見出しC",
    english: "English Title C",
    overlay: "bg-[rgba(29,134,204,0.7)]",
    links: links(5),
  },
];

export type SlideBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; ratio: string }
  | { type: "links"; items: string[] };

export type Slide = { blocks: SlideBlock[]; button?: string };

export const slides: Slide[] = [
  {
    blocks: [
      { type: "heading", text: "スライドの見出しテキストA" },
      { type: "image", ratio: "191 / 166" },
    ],
    button: "ボタンのテキスト",
  },
  {
    blocks: [
      { type: "image", ratio: "191 / 155" },
      {
        type: "text",
        text: "スライドの本文が入ります。レイアウト確認用のダミーテキストで、内容に意味はありません。",
      },
    ],
    button: "ボタンのテキスト",
  },
  {
    blocks: [
      { type: "image", ratio: "191 / 153" },
      { type: "links", items: ["リンク文字列A", "リンク文字列B", "リンク文字列C"] },
    ],
  },
  {
    blocks: [
      { type: "heading", text: "スライドの見出しテキストB" },
      {
        type: "text",
        text: "スライドの本文が入ります。レイアウト確認用のダミーテキストで、内容に意味はありません。行数を合わせるための文章です。",
      },
      { type: "image", ratio: "191 / 105" },
    ],
    button: "ボタンのテキスト",
  },
];

export const bannerCount = 6;

export const footer = {
  links: ["フッター項目", "フッターのリンク項目", "フッター項目"],
  copyright: "© Sample Copyright Text.",
};
