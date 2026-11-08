import { useSyncExternalStore } from "react";

// 投稿画面で、保存したあとに一覧の上に出すお知らせ。ページをまたいで渡すので、モジュールに持つ（保存はしない）。
// 一覧のページはページ移動後も残る（Activity）ので、次の保存か、閉じるボタンで入れ替わるまで出しておく。

export type AdminFlash = {
  message: string;
  /** 各サイトで記事を見るリンク。 */
  links: { label: string; href: string }[];
};

let current: AdminFlash | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getFlash() {
  return current;
}

function getNoFlash() {
  return null;
}

export function setFlash(flash: AdminFlash | null) {
  current = flash;
  listeners.forEach((listener) => listener());
}

export function useFlash() {
  return useSyncExternalStore(subscribe, getFlash, getNoFlash);
}
