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

// 読み込み直したあとに出すお知らせ（初期状態に戻したあとは、隠れて残った画面を消すために読み込み直す）
const RELOAD_FLASH_KEY = "rheuma-demo:admin-flash";

/** お知らせを残して、ページを読み込み直す。お知らせは文言だけを渡す。 */
export function reloadWithFlash(message: string) {
  try {
    window.sessionStorage.setItem(RELOAD_FLASH_KEY, message);
  } catch {}
  window.location.reload();
}

/** 読み込み直す前に残したお知らせを出す。useEffect の中で呼ぶ。 */
export function restoreReloadFlash() {
  let message: string | null = null;
  try {
    message = window.sessionStorage.getItem(RELOAD_FLASH_KEY);
    window.sessionStorage.removeItem(RELOAD_FLASH_KEY);
  } catch {}
  if (message) setFlash({ message, links: [] });
}
