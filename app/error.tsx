"use client";

import { useEffect, useState } from "react";
import { resetDemoData } from "@/lib/newsStore";

const buttonClass = "rounded-[25px] px-6 py-2.5 text-[15px] font-bold";

/**
 * 表示中にエラーが起きたときの画面。原因がブラウザに保存したデータでも抜け出せるように、
 * 初期状態に戻すボタンを置く。保存データのチェック（lib/newsStore.ts）とは別の備え。
 * サイトのヘッダーやフッターが原因のこともあるので、それらは使わない。
 */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  // 消し終わってから読み込み直す
  const reset = async () => {
    setResetting(true);
    await resetDemoData();
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-[560px] rounded-lg border border-[#d9d9d9] p-6 tb:p-10">
        <h1 className="text-[20px] font-bold tb:text-[22px]">ページを表示できませんでした</h1>
        <p className="mt-4">
          このブラウザに保存したデータが原因の可能性があります。もう一度読み込んでも直らないときは、初期状態に戻してください。
        </p>

        {confirming ? (
          <div className="mt-6 rounded-md bg-[#fdf2f2] p-4">
            <p>投稿画面で追加、編集、削除した内容がすべて消えて、最初の状態に戻ります。よろしいですか？</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                disabled={resetting}
                className={`${buttonClass} bg-[#c62828] text-white disabled:opacity-60`}
              >
                {resetting ? "戻しています…" : "初期状態に戻す"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={`${buttonClass} border border-[#999] bg-white`}
              >
                やめる
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => retry()} className={`${buttonClass} bg-brand text-white`}>
              もう一度読み込む
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={`${buttonClass} border border-[#999] bg-white`}
            >
              初期状態に戻す
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
