"use client";

import { useEffect, useState } from "react";

const VISIBLE_MS = 3000;

/**
 * 動かないリンクやボタンを押したときに、短い案内を出す。
 * スマホにはカーソルの変化がないので、無反応で不具合に見えないようにする。リンクごとではなく、ここで全部受ける。
 */
export function DummyLinkToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("a:not([href]), [data-dummy]")) return;
      // 投稿画面の本文のエディタの中のPDFのリンクは href を持たないが、動かないリンクではない
      if (event.target.closest('[contenteditable="true"]')) return;
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-[3000] flex justify-center px-5">
      {visible && (
        <p className="rounded-full bg-ink/90 px-5 py-2.5 text-[14px] text-white transition-opacity duration-300 starting:opacity-0 tb:text-[15px]">
          デモのため、このリンクは動きません
        </p>
      )}
    </div>
  );
}
