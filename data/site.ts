// 画面に表示する文言をまとめたファイル。
// リンクやボタン、見出しの文言は元サイトと同じ。ロゴ、組織名、著作権表記、人名、説明の文章はダミーで、
// 文字数だけを合わせてレイアウトが近くなるようにしている（doc/メモ.md の決定事項）。

export type NavChild = { label: string; pdf?: boolean; children?: { label: string }[] };
export type NavItem = { label: string; children?: NavChild[] };
/** href がない項目は、まだ行き先のページがない。 */
export type LinkItem = { label: string; href?: string };

const navChildren = (labels: string[], pdfIndexes: number[] = []): NavChild[] =>
  labels.map((label, i) => ({ label, pdf: pdfIndexes.includes(i) }));

export const globalNav: NavItem[] = [
  {
    label: "リウマチ財団について",
    children: navChildren(
      ["理事長挨拶", "財団概要", "沿革", "役員・顧問名簿", "評議員名簿", "評議員選定委員会", "委員会", "情報公開"],
      [3, 4, 5],
    ),
  },
  { label: "主な活動" },
  {
    label: "事業内容・実績",
    children: navChildren([
      "調査・研究事業",
      "普及啓発事業",
      "教育研修事業",
      "リウマチ専門職制度事業",
      "発行物",
      "災害時リウマチ患者支援事業",
    ]),
  },
  { label: "寄付のお願い", children: navChildren(["ご寄付のお願い", "賛助会ご加入のお願い"]) },
];

export const fullMenu = {
  first: { label: "トップページ", href: "/" } satisfies LinkItem,
  extras: [
    { label: "リウマチ月間講演会" },
    { label: "患者さん・一般の方", href: "/rheuma/" },
    { label: "医療関係者の皆さま", href: "/senmon/" },
  ] satisfies LinkItem[],
  others: [
    { label: "Whats's new", href: "/news/" },
    { label: "リンク" },
    { label: "プライバシーポリシー" },
    { label: "お問い合わせ" },
  ] satisfies LinkItem[],
  searchPlaceholder: "検索キーワード",
};

export const sideMenu: LinkItem[] = [
  { label: "財団トップ", href: "/" },
  { label: "患者・一般", href: "/rheuma/" },
  { label: "医療関係者", href: "/senmon/" },
  { label: "寄付のお願い" },
];

export const guides = [
  {
    title: "リウマチを知ろう!",
    lines: ["ここに説明テキストが", "入ります。ダミーの文章です"],
    button: "患者さん・一般向け情報",
    href: "/rheuma/",
    color: "bg-pink",
  },
  {
    title: "医療関係者のみなさんへ",
    lines: ["ここには説明のテキストが入ります。", "ダミーの文章です"],
    button: "医療関係者向け情報",
    href: "/senmon/",
    color: "bg-teal",
  },
];

export const greeting = {
  message:
    "ここには代表者からのメッセージが入ります。レイアウト確認用の文章で、内容に意味はありません。",
  organization: "組織名のテキスト",
  name: "役職名　氏名テキスト",
  button: "理事長挨拶",
};

export const news = {
  more: "もっとみる",
};

export const contentCards = [
  {
    title: "寄付のお願い",
    english: "Donation Requests",
    overlay: "bg-[rgba(0,170,170,0.7)]",
    links: navChildren(["ご寄付のお願い", "賛助会ご加入のお願い"]),
  },
  {
    title: "リウマチ財団とは",
    english: "Rheumatoid Foundation",
    overlay: "bg-[rgba(0,87,173,0.7)]",
    links: navChildren(
      ["財団概要", "沿革", "役員・顧問名簿", "評議員名簿", "評議員選定委員会", "委員会", "情報公開"],
      [2, 3, 4],
    ),
  },
  {
    title: "主な活動と事業",
    english: "Main Activities",
    overlay: "bg-[rgba(29,134,204,0.7)]",
    links: navChildren(["主な活動", "調査・研究事業", "普及啓発事業", "教育研修事業", "リウマチ専門職制度事業"]),
  },
];

export type SlideBlock =
  | { type: "heading"; text: string; bold?: boolean }
  | { type: "text"; text: string; gapBefore?: boolean }
  | { type: "blankLine" }
  | { type: "image"; ratio: string }
  | { type: "links"; items: string[] };

export type Slide = { blocks: SlideBlock[]; button?: string };

export const slides: Slide[] = [
  {
    blocks: [
      { type: "heading", text: "財団ニュース新刊のご案内", bold: true },
      { type: "image", ratio: "191 / 166" },
    ],
    button: "財団ニュースを読む",
  },
  {
    blocks: [
      { type: "image", ratio: "191 / 155" },
      {
        type: "text",
        text: "スライドの本文が入ります。レイアウト確認用のダミーテキストで、内容に意味はありません。",
        gapBefore: true,
      },
    ],
    button: "詳しいご案内",
  },
  {
    blocks: [
      { type: "image", ratio: "191 / 153" },
      { type: "links", items: ["災害への備え", "私のお薬は", "医療機関をさがす"] },
    ],
  },
  {
    blocks: [
      { type: "heading", text: "スライドの見出しテキストB" },
      {
        type: "text",
        text: "スライドの本文が入ります。レイアウト確認用のダミーテキストで、内容に意味はありません。行数を合わせるためのダミーの文章です。",
      },
      { type: "image", ratio: "191 / 105" },
      { type: "blankLine" },
    ],
    button: "ボタンのテキスト",
  },
];

export const bannerCount = 6;

export const footer = {
  links: ["リンク", "プライバシーポリシー", "お問い合わせ"],
  copyright: "© Sample Copyright Text.",
};
