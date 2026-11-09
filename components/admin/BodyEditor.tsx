"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { trimTrailingEmptyParagraphs } from "@/lib/bodyHtml";
import { IMAGE_TYPES, PDF_TYPE, saveFile, type SavedFile, type SaveFileResult } from "@/lib/fileStore";
import { editorExtensions, selectionHasImage, setFileDropHandler, TEXT_COLORS } from "./editorExtensions";
import { buttonClass, fieldClass, isEnter } from "./ui";

// 本文のエディタ（Tiptap）。Tiptap はこの部品と editorExtensions.ts の中だけで使う。
// 投稿画面で「本文を書く」を選んだときだけ読み込む（ArticleEditor の next/dynamic）。
// 入力欄はフォームの中にあるので、ボタンはすべて type="button" にし、入力欄の Enter でフォームが送信されないようにする。

type Props = {
  /** 本文のHTML。作ったあとに外から変わることはない（入力欄を作り直すときは key を変える）。 */
  value: string;
  onChange: (html: string) => void;
  /** 「本文」の見出しのID。 */
  labelId: string;
  invalid: boolean;
  /** 画像やPDFを取り込んでいる途中かを知らせる（途中で公開すると、そのファイルが抜けるため）。 */
  onBusyChange: (busy: boolean) => void;
};

const fileErrors: Record<Extract<SaveFileResult, { ok: false }>["reason"], string> = {
  type: "は入れられません。画像は JPEG、PNG、GIF、WebP、ファイルは PDF を選んでください。",
  size: "は5MBを超えているため、入れられません。",
  read: "を読み込めませんでした。",
  storage: "を保存できませんでした。ブラウザの保存容量がいっぱいか、保存が許可されていない可能性があります。",
};

/** 画像を入れる位置。見出しや箇条書きの中なら、そのブロックの後ろ。段落の端なら、段落を分けずに前か後ろ。 */
function imagePosition(editor: Editor, position: number | undefined) {
  const { doc, selection } = editor.state;
  const at = Math.min(position ?? selection.from, doc.content.size);
  const $at = doc.resolve(at);
  if ($at.depth === 0) return at;
  const block = $at.node(1);
  if (block.type.name !== "paragraph") return $at.after(1);
  if (block.content.size === 0) return at;
  if ($at.parentOffset === 0) return $at.before(1);
  if ($at.parentOffset === block.content.size) return $at.after(1);
  return at;
}

/** PDFのリンクの文字。ファイル名から拡張子を除く。 */
function pdfLabel(name: string) {
  return name.replace(/\.pdf$/i, "") || "PDF";
}

function insertSavedFile(editor: Editor, file: SavedFile, position: number | undefined) {
  if (file.kind === "image") {
    editor
      .chain()
      .focus()
      .insertContentAt(imagePosition(editor, position), {
        type: "paragraph",
        content: [{ type: "image", attrs: { fileId: file.id, width: file.width, height: file.height, alt: "" } }],
      })
      .run();
    return;
  }
  // PDF は文字のリンク。属性はURLのリンクと混ぜない（href は持たない）
  const attrs = { fileId: file.id, href: null };
  const { selection, doc } = editor.state;
  if (position === undefined && !selection.empty) {
    editor.chain().focus().setMark("link", attrs).run();
    return;
  }
  editor
    .chain()
    .focus()
    .insertContentAt(Math.min(position ?? selection.from, doc.content.size), {
      type: "text",
      text: pdfLabel(file.name),
      marks: [{ type: "link", attrs }],
    })
    .run();
}

function isLinkUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" || protocol === "mailto:";
  } catch {
    return false;
  }
}

export function BodyEditor({ value, onChange, labelId, invalid, onBusyChange }: Props) {
  // 最初に受け取った本文。Tiptap は読み込むときに形を少し変える（<br /> を <br> に、<li><a> を <li><p><a> に、など）ので、
  // 読み込んだだけの形（baseline）に戻ったときは、この文字列を返す。触っただけで「変更あり」「編集済み」にしないため。
  const [initialValue] = useState(value);
  const baselineRef = useRef<string | null>(null);
  const latestRef = useRef({ value, onChange });
  useLayoutEffect(() => {
    latestRef.current = { value, onChange };
  });

  // useEditor は options が変わると setOptions を呼ぶので、描画のたびに作り直さない
  const [editorProps] = useState(() => ({
    attributes: { class: "article-body", role: "textbox", "aria-multiline": "true", "aria-labelledby": labelId },
  }));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    content: initialValue,
    editorProps,
    // 「### 」や「- 」を打つと書式が変わる機能は使わない（思わぬ変化に見えるため）
    enableInputRules: false,
    enablePasteRules: false,
    onCreate: ({ editor }) => {
      if (baselineRef.current === null) baselineRef.current = trimTrailingEmptyParagraphs(editor.getHTML());
      // ページが隠れるとエディタは破棄され、表示し直すと最初の本文で作り直される（@tiptap/react）。
      // 入力中の本文に戻す。元に戻す履歴には入れない（入れると、元に戻すで開いたときの本文に戻ってしまう）
      const current = latestRef.current.value;
      if (current !== initialValue) {
        editor.chain().setMeta("addToHistory", false).setContent(current, { emitUpdate: false }).run();
      }
    },
    onUpdate: ({ editor }) => {
      const html = trimTrailingEmptyParagraphs(editor.getHTML());
      latestRef.current.onChange(html === baselineRef.current ? initialValue : html);
    },
  });

  // ツールバーの状態。useEditorState が渡すエディタは、エディタができた直後や作り直した直後には古いまま
  // （次の操作まで null や破棄済みのエディタ）なので、useEditor が返す今のエディタから読む
  const state = useEditorState({
    editor,
    selector: () => {
      if (!editor || editor.isDestroyed) return null;
      const heading = editor.isActive("heading");
      return {
        heading,
        // 画像のある段落を見出しにすると、画像が消えるので押せなくする
        canHeading: heading || (!selectionHasImage(editor) && editor.can().toggleHeading({ level: 3 })),
        bold: editor.isActive("bold"),
        canBold: editor.can().toggleBold(),
        list: editor.isActive("bulletList"),
        canList: editor.can().toggleBulletList(),
        link: editor.isActive("link"),
        canLink: editor.can().setMark("link", { href: "https://example.com/" }),
        color: (editor.getAttributes("textStyle").color as string | undefined) ?? null,
        canColor: editor.can().setColor(TEXT_COLORS[0].value),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  // リンクの欄。開くたびに key を変えて、開いた時点の選択で作り直す
  const [linkPanel, setLinkPanel] = useState({ open: false, key: 0 });
  // ページが隠れたら閉じる（Activity で開いたまま残さない）
  useLayoutEffect(() => () => setLinkPanel((panel) => ({ ...panel, open: false })), []);
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (target: Editor, files: File[], position: number | undefined) => {
    setFileMessage(null);
    setBusy((count) => count + 1);
    const errors: string[] = [];
    let at = position;
    for (const file of files) {
      const result = await saveFile(file);
      // 取り込みを待つあいだに、ページが隠れてエディタが破棄されていることがある
      if (target.isDestroyed) break;
      if (!result.ok) {
        errors.push(`「${file.name}」${fileErrors[result.reason]}`);
        continue;
      }
      insertSavedFile(target, result.file, at);
      // 2つ目からは、入れたものの後ろに続ける
      at = undefined;
    }
    setBusy((count) => count - 1);
    if (errors.length > 0) setFileMessage(errors.join("\n"));
  };

  const reportBusy = useEffectEvent((isBusy: boolean) => onBusyChange(isBusy));
  useEffect(() => {
    reportBusy(busy > 0);
    // 種類を「リンクだけ」に変えたときなど、エディタが外れたら取り込み中ではなくなる
    return () => reportBusy(false);
  }, [busy]);

  const onDropFiles = useEffectEvent((target: Editor, files: File[], position: number | undefined) => {
    void addFiles(target, files, position);
  });

  useEffect(() => {
    if (!editor) return;
    setFileDropHandler(editor, (files, position) => onDropFiles(editor, files, position));
    return () => setFileDropHandler(editor, null);
  }, [editor]);

  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (editor && files.length > 0) void addFiles(editor, files, undefined);
  };

  const run = (command: (editor: Editor) => void) => () => {
    if (editor) command(editor);
  };

  return (
    <div>
      <div
        className={`body-editor overflow-hidden rounded-md border bg-white ${
          invalid ? "border-[#c62828]" : "border-[#c3cad3]"
        } focus-within:border-brand`}
      >
        {/* ボタンを押しても、本文の選択が外れないようにする */}
        <div
          role="toolbar"
          aria-label="本文の書式"
          onMouseDown={(event) => {
            if (event.target instanceof HTMLElement && event.target.closest("button")) event.preventDefault();
          }}
          className="flex flex-wrap items-center gap-1 border-b border-[#dde2e8] bg-[#f6f8fa] p-1.5"
        >
          <ToolButton
            label="見出し"
            pressed={state?.heading}
            disabled={!state?.canHeading}
            onClick={run((editor) => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          />
          <ToolButton
            label="太字"
            pressed={state?.bold}
            disabled={!state?.canBold}
            onClick={run((editor) => editor.chain().focus().toggleBold().run())}
            className="font-bold"
          />
          <ToolButton
            label="箇条書き"
            pressed={state?.list}
            disabled={!state?.canList}
            onClick={run((editor) => editor.chain().focus().toggleBulletList().run())}
          />
          <ToolButton
            label="リンク"
            pressed={state?.link}
            disabled={!state?.canLink && !state?.link}
            onClick={() => setLinkPanel((panel) => ({ open: !panel.open, key: panel.key + 1 }))}
          />
          <Separator />
          <span className="px-1 text-[13px] text-[#555]">文字色</span>
          {TEXT_COLORS.map((color) => (
            <ToolButton
              key={color.value}
              label={color.label}
              pressed={state?.color === color.value}
              disabled={!state?.canColor}
              onClick={run((editor) => editor.chain().focus().setColor(color.value).run())}
              style={{ color: color.value }}
              className="font-bold"
            />
          ))}
          <ToolButton
            label="色なし"
            pressed={Boolean(state && !state.color && state.canColor)}
            disabled={!state?.canColor}
            // unsetColor は、文字を選んでいないと「色のない文字スタイル」を残し、続けて打った文字が空の <span> になる。
            // このエディタの文字スタイルは色だけなので、文字スタイルごと外す
            onClick={run((editor) => editor.chain().focus().unsetMark("textStyle").run())}
          />
          <Separator />
          <ToolButton label="画像" disabled={!editor} onClick={() => imageInputRef.current?.click()} />
          <ToolButton label="PDF" disabled={!editor} onClick={() => pdfInputRef.current?.click()} />
          <Separator />
          <ToolButton
            label="元に戻す"
            disabled={!state?.canUndo}
            onClick={run((editor) => editor.chain().focus().undo().run())}
          />
          <ToolButton
            label="やり直す"
            disabled={!state?.canRedo}
            onClick={run((editor) => editor.chain().focus().redo().run())}
          />
        </div>

        {editor && linkPanel.open && (
          <LinkPanel
            key={linkPanel.key}
            editor={editor}
            onClose={() => setLinkPanel((panel) => ({ ...panel, open: false }))}
          />
        )}

        <EditorContent editor={editor} />
        {!editor && <p className="px-4 py-3 text-[#666]">読み込んでいます…</p>}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple
        hidden
        onChange={chooseFiles}
      />
      <input ref={pdfInputRef} type="file" accept={PDF_TYPE} multiple hidden onChange={chooseFiles} />

      {busy > 0 && <p className="mt-1.5 text-[14px] text-[#555]">ファイルを取り込んでいます…</p>}
      {fileMessage && (
        <p role="alert" className="mt-1.5 text-[14px] font-bold whitespace-pre-line text-[#c62828]">
          {fileMessage}
        </p>
      )}
      <p className="mt-1.5 text-[13px] text-[#555]">
        段落を分けずに改行するときは Shift + Enter。画像とPDFは、ドラッグ＆ドロップや貼り付けでも入れられます（1つ5MBまで）。PDFは、文字を選んでから入れると、その文字がリンクになります。
      </p>
    </div>
  );
}

function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  className = "",
  style,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed === undefined ? undefined : pressed}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={`rounded px-2.5 py-1 text-[14px] disabled:cursor-default disabled:opacity-40 ${
        pressed ? "bg-[#dce6f2] ring-1 ring-brand/40" : "hover:bg-[#e7ebf0]"
      } ${className}`}
    >
      {label}
    </button>
  );
}

function Separator() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-[#d0d6de]" />;
}

/** リンクのURLを入れる欄。ブラウザのダイアログは使わない。文字を選んでいないときは、表示する文字も入れる。 */
function LinkPanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  // 開いた時点の状態で決める
  const [initial] = useState(() => {
    const attributes = editor.getAttributes("link");
    return {
      inLink: editor.isActive("link"),
      isFile: Boolean(attributes.fileId),
      href: typeof attributes.href === "string" ? attributes.href : "",
      needsText: editor.state.selection.empty && !editor.isActive("link"),
    };
  });
  const [url, setUrl] = useState(initial.isFile ? "" : initial.href);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 欄を開いたあとで本文の選択が変わったら閉じる（開いた時点の選択で、文字の欄を出すかを決めているため）
  const close = useEffectEvent(onClose);
  useEffect(() => {
    const onSelectionUpdate = () => close();
    editor.on("selectionUpdate", onSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor]);

  const apply = () => {
    const href = url.trim();
    if (!isLinkUrl(href)) {
      setError("http:// か https:// で始まるURLを入力してください（メールアドレスは mailto: を付けます）。");
      return;
    }
    // 属性は PDF のリンクと混ぜない（fileId を外す）
    const attrs = { href, fileId: null };
    if (initial.needsText) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: text.trim() || href, marks: [{ type: "link", attrs }] })
        .run();
    } else if (editor.state.selection.empty) {
      editor.chain().focus().extendMarkRange("link").setMark("link", attrs).run();
    } else {
      editor.chain().focus().setMark("link", attrs).run();
    }
    onClose();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isEnter(event)) {
      event.preventDefault();
      apply();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      editor.commands.focus();
    }
  };

  return (
    <div className="border-b border-[#dde2e8] bg-[#f2f6fb] px-3 py-3">
      {initial.isFile && <p className="mb-2 text-[13px] text-[#555]">PDFへのリンクです。URLを入れると、URLへのリンクに変わります。</p>}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 basis-[260px] items-center gap-2">
          <span className="shrink-0 text-[14px]">リンク先のURL</span>
          <input
            type="url"
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError(null);
            }}
            onKeyDown={onKeyDown}
            autoFocus
            className={`${fieldClass} min-w-0 py-1.5`}
          />
        </label>
        {initial.needsText && (
          <label className="flex min-w-0 flex-1 basis-[200px] items-center gap-2">
            <span className="shrink-0 text-[14px]">表示する文字</span>
            <input
              type="text"
              placeholder="空ならURLを表示"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onKeyDown}
              className={`${fieldClass} min-w-0 py-1.5`}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-1.5 text-[14px] font-bold text-[#c62828]">{error}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={apply} className={`${buttonClass.primary} px-4 py-1.5`}>
          {initial.inLink ? "リンクを変える" : "リンクを付ける"}
        </button>
        {initial.inLink && (
          <button type="button" onClick={remove} className={`${buttonClass.secondary} py-1.5`}>
            リンクを外す
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onClose();
            editor.commands.focus();
          }}
          className={`${buttonClass.secondary} py-1.5`}
        >
          やめる
        </button>
      </div>
    </div>
  );
}
