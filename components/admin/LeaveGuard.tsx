"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { buttonClass } from "./ui";

// 入力の途中で投稿画面の中のリンクを押したときに、画面の中で確認を出す（node_modules/next/dist/docs の link.md「Blocking navigation」）。
// タブを閉じるときと再読み込みのときは、ブラウザの確認を出す。ブラウザの戻るボタンでは確認しない。
// ページは移動後も隠れて残る（Activity）ので、「離れる」を選んだら入力を消して、確認の文言と合わせる。

type Guard = { discard: () => void };

const LeaveGuardContext = createContext<{
  register: (guard: Guard) => void;
  unregister: (guard: Guard) => void;
  isGuarded: () => boolean;
  ask: (href: string) => void;
} | null>(null);

export function LeaveGuardProvider({ children }: { children: React.ReactNode }) {
  const guardRef = useRef<Guard | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const router = useRouter();

  const value = useMemo(
    () => ({
      register: (guard: Guard) => {
        guardRef.current = guard;
      },
      unregister: (guard: Guard) => {
        if (guardRef.current === guard) guardRef.current = null;
      },
      isGuarded: () => guardRef.current !== null,
      ask: setPendingHref,
    }),
    [],
  );

  // 確認が出ているときに戻る、進むを押したら閉じる（移動したあとに残さない）
  useEffect(() => {
    if (!pendingHref) return;
    const close = () => setPendingHref(null);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [pendingHref]);

  const leave = () => {
    if (!pendingHref) return;
    guardRef.current?.discard();
    guardRef.current = null;
    setPendingHref(null);
    router.push(pendingHref);
  };

  return (
    <LeaveGuardContext value={value}>
      {children}
      {pendingHref && <LeaveDialog onLeave={leave} onStay={() => setPendingHref(null)} />}
    </LeaveGuardContext>
  );
}

function LeaveDialog({ onLeave, onStay }: { onLeave: () => void; onStay: () => void }) {
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    stayRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onStay();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onStay]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-dialog-title"
        className="w-full max-w-[440px] rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="leave-dialog-title" className="text-[18px] font-bold">
          入力した内容が保存されていません
        </h2>
        <p className="mt-3">このページを離れると、入力した内容は消えます。</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" ref={stayRef} onClick={onStay} className={buttonClass.secondary}>
            このページに残る
          </button>
          <button type="button" onClick={onLeave} className={buttonClass.danger}>
            離れる
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 入力の途中なら、画面を離れるときに確認を出す。discard は「離れる」を選んだときに入力を消す処理。
 * ページが隠れたとき（Activity）は、隠れたページの分の確認を外す。
 */
export function useLeaveGuard(active: boolean, discard: () => void) {
  const context = useContext(LeaveGuardContext);
  const discardRef = useRef(discard);

  useLayoutEffect(() => {
    discardRef.current = discard;
  });

  useLayoutEffect(() => {
    if (!active || !context) return;
    const guard: Guard = { discard: () => discardRef.current() };
    context.register(guard);

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 古いブラウザは returnValue が必要
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      context.unregister(guard);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [active, context]);
}

/** 投稿画面の中のリンク。入力の途中なら、移動する前に確認を出す。 */
export function AdminLink({ onNavigate, ...props }: ComponentProps<typeof Link>) {
  const context = useContext(LeaveGuardContext);

  return (
    <Link
      {...props}
      onNavigate={(event) => {
        onNavigate?.(event);
        if (context?.isGuarded()) {
          event.preventDefault();
          context.ask(String(props.href));
        }
      }}
    />
  );
}
