// /senmon/ の画面に表示する文言。リンクやボタン、見出しの文言は元サイトと同じ。
// サイト名はダミーで、文字数だけを合わせている（doc/メモ.md の決定事項）。

import type { LinkItem, NavChild, NavItem } from "./site";

const links = (labels: string[]): NavChild[] => labels.map((label) => ({ label }));

export const senmonSite = {
  home: "/senmon/",
  name: "サイト名のダミー文字",
  audience: "対象者のダミー文字です",
};

export const senmonNews = {
  more: "もっとみる",
};

/** トップの見出し。カードの外にある見出しだけを文字にする。 */
export const senmonTop = {
  headingAccent: "医療関係者",
  heading: "のみなさんへ",
  pickup: "Pickup",
  training: "研修会情報",
  subsidy: "助成等募集",
};

const trainingChildren: NavChild[] = [
  ...links([
    "リウマチ月間講演会",
    "リウマチの治療とケア教育研修会",
    "RAトータルマネジメントフォーラム",
  ]),
  {
    label: "単位認定教育研修会",
    children: links([
      "リウマチ財団登録医",
      "リウマチケア看護師",
      "リウマチ財団登録薬剤師",
      "リウマチ財団登録理学・作業療法士",
    ]),
  },
  ...links([
    "リウマチ関連学会、研究会等におけるリウマチ教育研修講演単位認定要項",
    "リウマチケア専門職教育研修講演単位認定要項",
  ]),
];

const doctorChildren: NavChild[] = [
  { label: "規則・規則施行細則", pdf: true },
  ...links(["新規申請", "更新申請", "公開講座・講演会（患者対象）", "変更届"]),
];

/** 看護師、薬剤師、理学・作業療法士のメニューは同じ項目。 */
const staffChildren: NavChild[] = [
  { label: "規則・規則施行細則", pdf: true },
  { label: "カリキュラム", pdf: true },
  ...links(["新規申請", "更新申請", "変更届"]),
];

export const senmonNav: NavItem[] = [
  { label: "助成等募集" },
  { label: "研修会", children: trainingChildren },
  { label: "登録医", children: doctorChildren },
  { label: "看護師", children: staffChildren },
  { label: "薬剤師", children: staffChildren },
  { label: "理学・作業療法士", children: staffChildren },
  { label: "発行物", children: links(["財団ニュース", "書籍"]) },
];

export const senmonMenu: {
  first: LinkItem;
  groups: NavItem[];
  links: LinkItem[];
  others: LinkItem[];
  foundation: LinkItem;
} = {
  first: { label: "トップページ", href: senmonSite.home },
  groups: [
    { label: "研修会", children: trainingChildren },
    { label: "リウマチ財団登録医", children: doctorChildren },
    { label: "リウマチケア看護師", children: staffChildren },
    { label: "リウマチ財団登録薬剤師", children: staffChildren },
    { label: "リウマチ財団登録理学・作業療法士", children: staffChildren },
  ],
  links: [
    { label: "助成等募集" },
    { label: "お知らせ", href: "/senmon/news/" },
    { label: "災害時リウマチ患者支援" },
    { label: "財団ニュース" },
    { label: "書籍" },
  ],
  others: [{ label: "リンク" }, { label: "プライバシーポリシー" }, { label: "お問い合わせ" }],
  foundation: { label: "財団トップ", href: "/" },
};

export const senmonSideMenu: LinkItem[] = [
  { label: "財団トップ", href: "/" },
  { label: "患者・一般", href: "/rheuma/" },
  { label: "医療関係者", href: senmonSite.home },
  { label: "寄付のお願い" },
];
