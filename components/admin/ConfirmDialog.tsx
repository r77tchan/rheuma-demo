"use client";

import { useEffect, useEffectEvent, useId, useRef } from "react";
import { buttonClass } from "./ui";

// 投稿画面の確認（離れる、削除、初期状態に戻す）。ブラウザのダイアログは使わず、画面の真ん中に出す。
// その場で表示を置き換える形だと、行やヘッダーの高さが変わって画面がずれるため、すべてこの形にそろえる。

type Props = {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** 実行中に、確定のボタンに出す文言。あるあいだは、どちらのボタンも押せない。 */
  busyLabel?: string | null;
  /** 実行に失敗したときの案内。ダイアログは閉じずに出す。 */
  error?: string | null;
};

/** 開いたときは、取り消す側のボタンにフォーカスを置く（Enter を押しても、消す操作にならないように）。Esc で閉じる。 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "やめる",
  onConfirm,
  onCancel,
  busyLabel,
  error,
}: Props) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const busy = Boolean(busyLabel);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  const cancel = useEffectEvent(onCancel);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) cancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [busy]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[440px] rounded-lg bg-white p-6 text-[15px] leading-[1.7] text-ink shadow-xl"
      >
        <h2 id={titleId} className="text-[18px] font-bold">
          {title}
        </h2>
        <div className="mt-3">{message}</div>
        {error && (
          <p role="alert" className="mt-3 font-bold text-[#c62828]">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            ref={cancelRef}
            onClick={onCancel}
            disabled={busy}
            className={`${buttonClass.secondary} disabled:opacity-50`}
          >
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={buttonClass.danger}>
            {busyLabel ?? confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
