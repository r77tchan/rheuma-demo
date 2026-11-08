"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { siteNews, type Article, type SiteId } from "@/data/news";
import { isPreviewMessage, PREVIEW_FRAME_NAME, type PreviewMessage } from "@/lib/preview";
import { formatJapaneseDate, siteShortLabels, siteTopHref } from "./ui";

// プレビュー。実際のページを iframe で開き、下書きを postMessage で渡す（lib/preview.ts）。
// iframe の中のメディアクエリは iframe の幅で決まるので、PC幅は1440pxで開いて枠に合わせて縮める。

const DEVICE_WIDTHS = { pc: 1440, sp: 390 } as const;
type Device = keyof typeof DEVICE_WIDTHS;
type View = "detail" | "top";

const tabClass = (active: boolean) =>
  `rounded-md px-3 py-1.5 text-[14px] ${active ? "bg-brand text-white" : "bg-white hover:bg-[#f0f3f7]"}`;

export function PreviewPane({ draft, sites, today }: { draft: Article; sites: SiteId[]; today: string }) {
  const [site, setSite] = useState<SiteId>("main");
  const [view, setView] = useState<View>("detail");
  const [device, setDevice] = useState<Device>(() =>
    window.matchMedia("(min-width: 1025px)").matches ? "pc" : "sp",
  );

  // 選んでいたサイトが掲載先から外れたら、残っているサイトを出す
  const activeSite = sites.includes(site) ? site : sites[0];
  const activeView: View = draft.kind === "body" ? view : "top";

  return (
    <section aria-label="プレビュー" className="rounded-lg border border-[#dde2e8] bg-[#eef1f5] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-bold">プレビュー</h2>
        <div role="group" aria-label="サイト" className="flex flex-wrap gap-1">
          {sites.map((id) => (
            <button key={id} type="button" aria-pressed={id === activeSite} onClick={() => setSite(id)} className={tabClass(id === activeSite)}>
              {siteShortLabels[id]}
            </button>
          ))}
        </div>
        <div role="group" aria-label="画面の幅" className="ml-auto flex gap-1">
          {(["pc", "sp"] as const).map((id) => (
            <button key={id} type="button" aria-pressed={id === device} onClick={() => setDevice(id)} className={tabClass(id === device)}>
              {id === "pc" ? "PC" : "スマホ"}
            </button>
          ))}
        </div>
      </div>

      {draft.kind === "body" && activeSite && (
        <div role="group" aria-label="表示するページ" className="mt-2 flex gap-1">
          {(
            [
              ["detail", "記事のページ"],
              ["top", "トップの新着欄"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={id === activeView} onClick={() => setView(id)} className={tabClass(id === activeView)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[13px] text-[#555]">
        {draft.publishedAt > today && (
          <strong className="mr-2 font-bold text-[#8a5a00]">
            予約: {formatJapaneseDate(draft.publishedAt)}から公開されます（プレビューでは表示しています）。
          </strong>
        )}
        プレビューの中のリンクは、押しても移動しません。
      </p>

      {activeSite ? (
        <PreviewFrame
          key={`${activeSite}|${activeView}|${device}`}
          src={activeView === "detail" ? `${siteNews[activeSite].basePath}/news/${draft.id}/` : siteTopHref(activeSite)}
          width={DEVICE_WIDTHS[device]}
          draft={draft}
          scroll={activeView === "top"}
          title={`プレビュー: ${siteShortLabels[activeSite]}の${activeView === "detail" ? "記事のページ" : "トップ"}`}
        />
      ) : (
        <p className="mt-3 flex h-[240px] items-center justify-center rounded-md bg-white text-[#666]">
          載せるサイトを選ぶと、ここにプレビューが出ます。
        </p>
      )}
    </section>
  );
}

/** 下書きを入力するたびに送らないよう、少し待ってから送る。 */
const SEND_DELAY_MS = 250;

function PreviewFrame({
  src,
  width,
  draft,
  scroll,
  title,
}: {
  src: string;
  width: number;
  draft: Article;
  scroll: boolean;
  title: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const [applied, setApplied] = useState(false);
  const readyRef = useRef(false);
  const scrollPendingRef = useRef(scroll);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // ページが隠れたとき（Activity）は大きさが0になるので、前の大きさのままにする
      if (width === 0 || height === 0) return;
      setBox({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const send = useEffectEvent(() => {
    const target = frameRef.current?.contentWindow;
    if (!target || !readyRef.current) return;
    const message: PreviewMessage = { type: "preview:draft", article: draft, scroll: scrollPendingRef.current };
    target.postMessage(message, window.location.origin);
    scrollPendingRef.current = false;
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow || event.origin !== window.location.origin) return;
      if (!isPreviewMessage(event.data)) return;
      if (event.data.type === "preview:ready") {
        readyRef.current = true;
        send();
      } else if (event.data.type === "preview:applied") {
        setApplied(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const draftJson = JSON.stringify(draft);
  useEffect(() => {
    const timer = setTimeout(send, SEND_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draftJson]);

  const scale = box ? Math.min(1, box.width / width) : 1;

  return (
    <div ref={boxRef} className="relative mt-3 h-[70vh] min-h-[420px] overflow-hidden rounded-md bg-white pc:h-[calc(100vh-260px)] pc:min-h-[520px]">
      {box && (
        <div className="mx-auto overflow-hidden" style={{ width: width * scale, height: box.height }}>
          <iframe
            ref={frameRef}
            name={PREVIEW_FRAME_NAME}
            src={src}
            title={title}
            className={`origin-top-left border-0 transition-opacity ${applied ? "opacity-100" : "opacity-0"}`}
            style={{ width, height: box.height / scale, transform: `scale(${scale})` }}
          />
        </div>
      )}
      {!applied && (
        <p className="absolute inset-0 flex items-center justify-center text-[#666]">読み込んでいます…</p>
      )}
    </div>
  );
}
