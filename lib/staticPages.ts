import { seedArticles } from "@/data/news";
import { pageCount } from "./newsUrls";

// GitHub Pages では、ビルドのときに書き出したページしか開けない（静的な書き出し）。
// 投稿画面で記事を追加、編集すると、ビルドのときにはなかったページが要る
// （追加した記事の詳細、増えたページ送り、掲載先や種類を変えた初期記事の詳細）。
// そこで、起こりうるページを先にすべて作っておき、中身はブラウザで保存データから組み立てる。

/** 投稿画面で追加する記事のIDの範囲。この範囲のページを先に作るので、これより多くは追加できない（初期状態に戻すと、また最初から付ける）。 */
export const FIRST_NEW_ID = 1000;
export const LAST_NEW_ID = 1099;

const newIds = Array.from({ length: LAST_NEW_ID - FIRST_NEW_ID + 1 }, (_, i) => String(FIRST_NEW_ID + i));

/** 記事のページ（3サイトの詳細と、投稿画面の編集）を作るID。初期記事は編集すればどのサイトにも載せられるので、どのサイトにも全部作る。 */
export function articleIdParams() {
  return [...seedArticles.map((article) => article.id), ...newIds].map((id) => ({ id }));
}

/** 一覧のページ番号。どの一覧にも、最大で全記事（初期記事と、追加できるだけの記事）が並びうる。 */
export function pageNumberParams() {
  const total = pageCount(seedArticles.length + newIds.length);
  return Array.from({ length: total }, (_, i) => ({ n: String(i + 1) }));
}
