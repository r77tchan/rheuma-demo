import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** ページが指定の位置より下までスクロールされているかを返す。 */
export function useScrolledPast(y: number) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > y,
    () => false,
  );
}
