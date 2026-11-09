"use client";

import { useLayoutEffect, useState } from "react";
import { reloadListWithFlash } from "@/lib/adminFlash";
import { resetDemoData } from "@/lib/newsStore";
import { ConfirmDialog } from "./ConfirmDialog";
import { allowLeaveWithoutConfirm } from "./LeaveGuard";

// デモのためだけのもの（保存先の注意書きと、初期状態に戻す）を、ヘッダーの下にまとめる。
// URLで共有するデモなので、「投稿したのに、URLを送った相手の画面には出ない」という誤解を防ぐ。

export function DemoNotice() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-1.5 px-4 pb-2.5 text-[13px] text-[#666] tb:px-6">
      <p>デモのため、入力した内容はこのブラウザにだけ保存されます（ほかの人には見えません）。</p>
      <ResetButton />
    </div>
  );
}

function ResetButton() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 開いた確認は、ページが隠れたら閉じる（Activity で開いたまま残さない）
  useLayoutEffect(() => () => setOpen(false), []);

  const reset = async () => {
    setResetting(true);
    setError(null);
    const ok = await resetDemoData();
    if (ok) {
      // 隠れて残った入力画面（開いたときの記事のまま）と、覚えている画像のURLを消すため、一覧を読み込み直す。
      // 移るまでダイアログは「戻しています…」のまま出しておく
      allowLeaveWithoutConfirm();
      reloadListWithFlash("初期状態に戻しました。");
      return;
    }
    setResetting(false);
    setError("初期状態に戻せませんでした。ブラウザの保存が許可されていない可能性があります。");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="underline hover:no-underline"
      >
        初期状態に戻す
      </button>
      {open && (
        <ConfirmDialog
          title="初期状態に戻しますか？"
          message={<p>追加、編集、削除した記事と、画像やPDFがすべて消えて、最初の状態に戻ります。</p>}
          confirmLabel="初期状態に戻す"
          busyLabel={resetting ? "戻しています…" : null}
          error={error}
          onConfirm={reset}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
