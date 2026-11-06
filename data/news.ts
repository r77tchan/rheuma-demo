// お知らせの型、3サイトのカテゴリ、初期記事をまとめたファイル。
// カテゴリ名と色は元サイトと同じ。記事の中身はダミー。

export type SiteId = "main" | "rheuma" | "senmon";

export type Category = { label: string; color: string };

export const siteCategories = {
  main: {
    foundation: { label: "財団情報", color: "bg-sky" },
    general: { label: "一般・患者さん情報", color: "bg-pink" },
    specialty: { label: "医療関係者情報", color: "bg-teal" },
  },
  rheuma: {
    news: { label: "NEWS", color: "bg-pink" },
    lecture: { label: "講演会", color: "bg-[#46c6da]" },
    disease: { label: "疾患情報", color: "bg-[#20b067]" },
  },
  senmon: {
    news: { label: "NEWS", color: "bg-brand" },
    specialty: { label: "リウマチ専門職", color: "bg-[#1c85cc]" },
    recruitment: { label: "助成、医学賞等", color: "bg-teal" },
  },
} satisfies Record<SiteId, Record<string, Category>>;

/** 記事を載せるサイトと、そのサイトでのカテゴリ。 */
export type Placements = {
  [S in SiteId]?: keyof (typeof siteCategories)[S];
};

export type Article = {
  id: string;
  title: string;
  /** 公開日（YYYY-MM-DD）。未来の日付の記事は、その日まで表示しない。 */
  publishedAt: string;
  placements: Placements;
} & (
  | { kind: "body"; bodyHtml: string }
  | { kind: "link"; linkUrl: string }
);

/** 一覧で使う日付の形式（2000年01月05日）。 */
export function formatListDate(publishedAt: string) {
  const [year, month, day] = publishedAt.split("-");
  return `${year}年${month}月${day}日`;
}

const dummyBody = "<p>記事の本文が入ります。</p>";

export const seedArticles: Article[] = [
  {
    id: "5",
    title: "記事のタイトルが入ります。長い場合は折り返します",
    publishedAt: "2000-01-05",
    placements: { main: "foundation" },
    kind: "body",
    bodyHtml: dummyBody,
  },
  {
    id: "4",
    title: "記事のタイトルが入ります",
    publishedAt: "2000-01-04",
    placements: { main: "foundation" },
    kind: "body",
    bodyHtml: dummyBody,
  },
  {
    id: "3",
    title: "記事のタイトルが入ります",
    publishedAt: "2000-01-03",
    placements: { main: "general" },
    kind: "body",
    bodyHtml: dummyBody,
  },
  {
    id: "2",
    title: "記事のタイトルが入ります",
    publishedAt: "2000-01-02",
    placements: { main: "specialty" },
    kind: "body",
    bodyHtml: dummyBody,
  },
  {
    id: "1",
    title: "記事のタイトルが入ります",
    publishedAt: "2000-01-01",
    placements: { main: "foundation" },
    kind: "body",
    bodyHtml: dummyBody,
  },
];
