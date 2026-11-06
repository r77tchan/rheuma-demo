// お知らせの型、3サイトのカテゴリ、初期記事をまとめたファイル。
// カテゴリ名と色は元サイトと同じ。記事の中身はダミー。

export type SiteId = "main" | "rheuma" | "senmon";

export type Category = { label: string; color: string };

/** サイトごとのお知らせの違い（doc/調査_お知らせ.md の「3サイトの違い」）。 */
export const siteNews: Record<
  SiteId,
  {
    /** お知らせのページがあるURLの先頭。 */
    basePath: string;
    /** ページタイトルの帯の見出し。 */
    heading: string;
    /** カテゴリ別ページの有無。ないサイトは、バッジのリンク、パンくずのカテゴリ、絞り込みボタンも出さない。 */
    categoryPages: boolean;
    badgeWidth: string;
    /** 一覧のタイトルの色。 */
    titleColor: string;
  }
> = {
  main: {
    basePath: "",
    heading: "お知らせ",
    categoryPages: true,
    badgeWidth: "w-[160px]",
    titleColor: "text-brand",
  },
  rheuma: {
    basePath: "/rheuma",
    heading: "What\u2019s new",
    categoryPages: false,
    badgeWidth: "w-[100px]",
    titleColor: "text-ink",
  },
  senmon: {
    basePath: "/senmon",
    heading: "What's new",
    categoryPages: true,
    badgeWidth: "w-[185px]",
    titleColor: "text-brand",
  },
};

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

/** IDからカテゴリを引く。URLの値も渡すので、constructor などの組み込みの名前には反応しないようにする。 */
export function getCategory(site: SiteId, id: string): Category | undefined {
  const categories: Record<string, Category> = siteCategories[site];
  return Object.hasOwn(categories, id) ? categories[id] : undefined;
}

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

type BodyPattern = "text" | "textLink" | "headingLink" | "listLink" | "image" | "notice";

const DUMMY_URL = "https://example.com/";

const DUMMY_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#c4c4c4"/></svg>',
  );

// 元サイトの本文に使われている型。"text" の文字数は比較用に元サイトの記事に揃えてある。
const bodies: Record<BodyPattern, string> = {
  text:
    "<p>ここには本文の一行目が入ります。ダミーの文章です。<br />" +
    "ここには本文の二行目が入ります。内容に意味はなく、文字数だけを揃えているダミーの文章です。<br />" +
    "ここには本文の三行目が入ります。文字数を合わせるためのダミーの文章です。</p>" +
    "<p><strong>【太字の見出しテキスト】</strong><br />" +
    "ここに短い文章が入ります<br />" +
    "ここには補足の文章が入ります。文字数を合わせるためのダミーの文章です。</p>",
  textLink: `<p>ここには本文が入ります。レイアウト確認用のダミーの文章で、内容に意味はありません。</p><p>詳しくは<a href="${DUMMY_URL}">こちらのダミーリンク</a>をご覧ください。</p>`,
  headingLink: `<h3>本文の見出しテキスト</h3><p>ここには本文が入ります。レイアウト確認用のダミーの文章で、内容に意味はありません。</p><p><a href="${DUMMY_URL}">ダミーリンクのテキスト</a></p>`,
  listLink: `<p>ここには本文が入ります。ダミーの文章です。</p><ul><li><a href="${DUMMY_URL}">ダミーリンクのテキスト1</a></li><li><a href="${DUMMY_URL}">ダミーリンクのテキスト2</a></li><li><a href="${DUMMY_URL}">ダミーリンクのテキスト3</a></li></ul>`,
  image: `<p>ここには本文が入ります。レイアウト確認用のダミーの文章で、内容に意味はありません。</p><p><img src="${DUMMY_IMAGE}" alt="ダミー画像" width="600" height="400" /></p>`,
  // 文字数は比較用に元サイトの /rheuma/ の記事に揃えてある
  notice:
    "<p>ここには本文の一行目が入ります。文字数と折り返しを元の文に揃えるためのダミーの文章で、内容に意味はありません。</p>" +
    "<p><strong>【太字の見出しです】</strong><br />" +
    "ここに短い文が入ります</p>" +
    "<p>ここには本文の三行目が入ります。文字数と折り返しを元の文に揃えるためのダミーの文章で、内容に意味はありません。</p>",
};

// タイトルは文字数で引く。文字数が変わると折り返しが変わり、元サイトと高さがずれる。
const dummyTitles = {
  11: "お知らせのタイトルです",
  13: "記事のタイトルが入ります。",
  15: "お知らせのタイトルが入ります。",
  18: "更新のお知らせのタイトルが入ります。",
  19: "更新情報のお知らせのタイトルが入ります",
  22: "ここには記事のタイトルが入ります。ダミーです",
  26: "ここには記事のタイトルが入ります。内容はダミーです。",
  28: "ここには記事のタイトルが入ります。内容はダミーの文章です",
  30: "ここには記事のタイトルが入ります。内容は意味のないダミーです",
  34: "ここには記事のタイトルが入ります。長い場合は、折り返して表示します。",
  40: "ここには、記事のタイトルが入ります。長いタイトルの場合は、折り返して表示します。",
} as const;

type TitleLength = keyof typeof dummyTitles;

// メインに載る記事。[タイトルの文字数, カテゴリ, 本文の型, /rheuma/ でのカテゴリ]。
// 本文の型が null の記事は直リンク。新しい順に並べる。
// 先頭10件のタイトルは、折り返しの行数が元サイトの一覧と同じになる文字数にしてある。
// 件数は、ページ送りの全状態が出る45件（5ページ）で、直リンクは元サイトと同じ約7割。
const seedRows: [
  TitleLength,
  keyof typeof siteCategories.main,
  BodyPattern | null,
  (keyof typeof siteCategories.rheuma)?,
][] = [
  [28, "foundation", "image", "news"],
  [18, "foundation", "text", "news"],
  [13, "foundation", "textLink", "news"],
  [18, "specialty", null],
  [15, "foundation", null, "news"],
  [19, "specialty", null],
  [40, "general", null, "lecture"],
  [11, "foundation", "headingLink", "news"],
  [18, "specialty", null],
  [40, "general", null, "lecture"],

  [22, "specialty", null],
  [18, "general", "textLink", "lecture"],
  [15, "specialty", null],
  [30, "foundation", null, "news"],
  [19, "specialty", "headingLink"],
  [26, "specialty", null],
  [13, "general", null, "disease"],
  [34, "specialty", null],
  [18, "foundation", "listLink", "news"],
  [22, "specialty", null],

  [15, "general", null, "lecture"],
  [26, "specialty", "image"],
  [18, "specialty", null],
  [19, "foundation", null, "news"],
  [30, "specialty", null],
  [13, "general", "text", "news"],
  [22, "specialty", null],
  [18, "specialty", null],
  [15, "foundation", "textLink", "news"],
  [34, "specialty", null],

  [26, "general", null, "lecture"],
  [18, "specialty", "headingLink"],
  [13, "specialty", null],
  [22, "foundation", null, "news"],
  [19, "specialty", null],
  [15, "general", "listLink", "disease"],
  [30, "specialty", null],
  [18, "foundation", null, "news"],
  [26, "specialty", "image"],
  [22, "general", null, "lecture"],

  [18, "specialty", null],
  [13, "general", "text", "disease"],
  [34, "specialty", null],
  [15, "foundation", null, "news"],
  [19, "general", null, "lecture"],
];

type RheumaRow = [TitleLength, keyof typeof siteCategories.rheuma, BodyPattern | null];

// /rheuma/ だけに載る記事。[タイトルの文字数, カテゴリ, 本文の型]。
// 元サイトも /rheuma/ の約半分はメインに載っていないので、合計がメインと同じ45件になるように足す。
// 先頭の10件は、メインと共通の記事より新しくして、元サイトの一覧と折り返しの行数を揃える。
// 残りは共通の記事より古くする。
const rheumaNewerRows: RheumaRow[] = [
  [18, "news", "textLink"],
  [13, "news", "text"],
  [40, "lecture", null],
  [11, "news", "notice"],
  [40, "lecture", null],
  [11, "news", "headingLink"],
  [40, "lecture", null],
  [13, "news", "listLink"],
  [11, "news", "image"],
  [40, "lecture", null],
];

const rheumaOlderRows: RheumaRow[] = [
  [26, "lecture", null],
  [18, "disease", "text"],
  [34, "news", null],
  [22, "lecture", null],
  [15, "disease", "textLink"],
  [30, "lecture", null],
  [19, "news", "headingLink"],
  [26, "lecture", null],
  [13, "disease", "listLink"],
  [22, "lecture", null],
  [18, "news", "text"],
  [34, "lecture", null],
];

/** 新しい順に、12月28日から週に1件ずつさかのぼる日付を返す。 */
function seedDate(index: number, year = 2000) {
  const month = 12 - Math.floor(index / 4);
  const day = 28 - (index % 4) * 7;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function seedArticle(
  base: Pick<Article, "id" | "title" | "publishedAt" | "placements">,
  pattern: BodyPattern | null,
): Article {
  return pattern
    ? { ...base, kind: "body", bodyHtml: bodies[pattern] }
    : { ...base, kind: "link", linkUrl: DUMMY_URL };
}

function rheumaOnlyArticles(rows: RheumaRow[], firstId: number, year: number) {
  return rows.map(([titleLength, category, pattern], index) =>
    seedArticle(
      {
        id: String(firstId - index),
        title: dummyTitles[titleLength],
        publishedAt: seedDate(index, year),
        placements: { rheuma: category },
      },
      pattern,
    ),
  );
}

export const seedArticles: Article[] = [
  ...rheumaOnlyArticles(rheumaNewerRows, 299, 2001),
  ...seedRows.map(([titleLength, category, pattern, rheumaCategory], index) =>
    seedArticle(
      {
        id: String(seedRows.length - index),
        title: dummyTitles[titleLength],
        publishedAt: seedDate(index),
        placements: rheumaCategory ? { main: category, rheuma: rheumaCategory } : { main: category },
      },
      pattern,
    ),
  ),
  ...rheumaOnlyArticles(rheumaOlderRows, 199, 1999),
];
