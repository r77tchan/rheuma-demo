// /rheuma/ の画面に表示する文言。リンクやボタン、見出しの文言は元サイトと同じ。
// サイト名はダミーで、文字数だけを合わせている（doc/メモ.md の決定事項）。

import type { LinkItem, NavChild, NavItem } from "./site";

const links = (labels: string[]): NavChild[] => labels.map((label) => ({ label }));

export const rheumaSite = {
  home: "/rheuma/",
  name: "サイト名のダミー文字",
  audience: "対象者のダミーテキストです",
  catchphrase: "リウマチを知ろう！",
};

export const rheumaNav: LinkItem[] = [
  { label: "HOME", href: rheumaSite.home },
  { label: "関節リウマチについて" },
  { label: "リウマチに関連する病気" },
  { label: "リウマチQ&A" },
];

export const rheumaFacility = "医療機関";

export const rheumaNews = {
  heading: "What's new",
  more: "一覧はこちら",
};

/** 全画面メニューの列。1列に複数のまとまりが入ることがある。 */
export const rheumaMenuColumns: NavItem[][] = [
  [
    {
      label: "関節リウマチについて",
      children: [
        ...links([
          "関節リウマチとは",
          "関節リウマチの症状",
          "関節リウマチの診断",
          "関節リウマチの検査",
        ]),
        {
          label: "関節リウマチの治療 – 薬物療法",
          children: links([
            "薬物療法とは",
            "メトトレキサート",
            "生物学的製剤",
            "JAK阻害薬",
            "他の抗リウマチ薬と免疫抑制薬",
            "副腎皮質ステロイド（ステロイド）",
            "非ステロイド抗炎症薬（消炎鎮痛薬）",
          ]),
        },
        ...links(["関節リウマチの治療 – 手術療法", "関節リウマチの治療 – リハビリテーション"]),
        {
          label: "関節リウマチの合併症（治療による合併症を含む）",
          children: links([
            "日和見感染症",
            "腎障害",
            "メトトレキサート関連リンパ増殖性疾患（MTX-LPD)",
            "顎骨壊死",
            "肝障害",
            "心血管イベント",
            "骨粗鬆症",
            "間質性肺炎",
            "悪性腫瘍",
            "帯状疱疹",
          ]),
        },
        ...links(["生活の注意", "妊娠と育児", "T2T", "リウマチ体操"]),
      ],
    },
  ],
  [
    {
      label: "リウマチに関連する病気",
      children: links([
        "リウマチ性多発筋痛症",
        "乾癬性関節炎",
        "体軸性脊椎関節炎",
        "変形性関節症",
        "反応性関節炎(ライター症候群)",
        "線維筋痛症",
        "もっとみる",
      ]),
    },
    { label: "こんな症状が出たら", children: links(["腰痛", "関節痛"]) },
  ],
  [
    {
      label: "リウマチQ&A",
      children: links([
        "症状について",
        "検査について",
        "診断について",
        "治療・薬について",
        "手術について",
        "リハビリについて",
        "食事について",
        "仕事・生活について",
        "妊娠と育児について",
        "その他",
        "COVID-19",
      ]),
    },
  ],
];

export const rheumaMenu: {
  first: LinkItem;
  links: LinkItem[];
  others: LinkItem[];
  foundation: LinkItem;
} = {
  first: { label: "トップページ", href: rheumaSite.home },
  links: [
    { label: "医療機関" },
    { label: "What's new", href: "/rheuma/news/" },
    { label: "公開講座・講演会等" },
    { label: "リウマチ月間講演会" },
    { label: "ライブラリー" },
    { label: "災害時リウマチ患者支援" },
  ],
  others: [{ label: "リンク" }, { label: "プライバシーポリシー" }, { label: "お問い合わせ" }],
  foundation: { label: "財団トップ", href: "/" },
};

/** 文言の \n はPCでだけ改行する。 */
export const rheumaSideMenu: LinkItem[] = [
  { label: "財団トップ", href: "/" },
  { label: "患者さん・\n一般の方", href: rheumaSite.home },
  { label: "医療機関" },
  { label: "寄付のお願い" },
];
