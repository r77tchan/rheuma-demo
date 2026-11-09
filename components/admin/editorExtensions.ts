import { Extension, type Editor } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { ListItem } from "@tiptap/extension-list";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { DUMMY_IMAGE } from "@/data/news";
import { FILE_ID_PATTERN, loadFileUrl } from "@/lib/fileStore";

// 本文のエディタ（BodyEditor）の拡張。書式は元サイトの本文に合わせる（doc/メモ.md の「エディタの書式」）。
// Tiptap 3.33.0 での動きは、実際に動かして確かめてある（doc/調査_投稿画面.md）。
// useEditor は拡張が変わるとエディタを作り直すので、ここでまとめて1回だけ作る。

/** 文字色。元サイトで使われている青緑と赤の2色だけ。 */
export const TEXT_COLORS = [
  { value: "#039ea1", label: "青緑" },
  { value: "#f73707", label: "赤" },
] as const;

// 読み込むときは hex と rgb のどちらも受ける（Tiptap は rgb で書き出し、Chrome の style.color も rgb を返す）
const ALLOWED_COLORS: Record<string, string> = {
  "#039ea1": "#039ea1",
  "rgb(3,158,161)": "#039ea1",
  "#f73707": "#f73707",
  "rgb(247,55,7)": "#f73707",
};

function normalizeColor(value: string | null | undefined) {
  if (!value) return null;
  return ALLOWED_COLORS[value.toLowerCase().replace(/\s|!important/g, "")] ?? null;
}

function colorOf(element: HTMLElement) {
  const raw = element.getAttribute("style")?.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)?.[1];
  return normalizeColor(raw) ?? normalizeColor(element.style.color);
}

function hasFileId(element: HTMLElement) {
  return FILE_ID_PATTERN.test(element.getAttribute("data-file-id") ?? "");
}

/** 許可した色のない span は読み込まない（色を外した span が空で残るため）。 */
const ColorSpan = TextStyle.extend({
  parseHTML() {
    return [
      {
        tag: "span",
        consuming: false,
        getAttrs: (element) => (colorOf(element) ? {} : false),
      },
    ];
  },
});

/** 文字色は2色だけ。貼り付けた色も、2色以外は外す。 */
const TwoColors = Color.extend({
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: colorOf,
            renderHTML: (attributes: { color?: string | null }) =>
              attributes.color ? { style: `color: ${attributes.color}` } : {},
          },
        },
      },
    ];
  },
});

/** カーソルのあるブロック（範囲を選んでいるときは、その中のブロック）に画像があるか。 */
export function selectionHasImage(editor: Editor) {
  const { $from, $to } = editor.state.selection;
  let found = false;
  editor.state.doc.nodesBetween($from.start(), $to.end(), (node) => {
    if (node.type.name === "image") found = true;
    return !found;
  });
  return found;
}

/** 見出しは h3 だけ。中には文字と改行だけを入れられ、付けられる書式はリンクだけ（元サイトの見出しの中の色は、サイトによって文字が小さくなる）。 */
const H3 = Heading.extend({
  marks: "link",
  content: "(text | hardBreak)*",
  addKeyboardShortcuts() {
    // 画像のある段落を見出しにすると、画像が消えるので止める
    return {
      "Mod-Alt-3": () => selectionHasImage(this.editor) || this.editor.commands.toggleHeading({ level: 3 }),
    };
  },
}).configure({ levels: [3] });

/**
 * リンク。PDF は fileId を持つリンクで、href は保存しない（表示するときに blob URL を入れる）。
 * 同じタブで開くので、target と rel は読み込みも書き出しもしない。
 */
const FileLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // サイトのページからコピーしたPDFのリンク（href が blob:）でも、fileId のリンクとして読む
      href: {
        default: null,
        parseHTML: (element: HTMLElement) => (hasFileId(element) ? null : element.getAttribute("href")),
      },
      target: { default: null, parseHTML: () => null, rendered: false },
      rel: { default: null, parseHTML: () => null, rendered: false },
      class: { default: null, parseHTML: () => null, rendered: false },
      title: { default: null, parseHTML: () => null, rendered: false },
      fileId: {
        default: null,
        parseHTML: (element: HTMLElement) => (hasFileId(element) ? element.getAttribute("data-file-id") : null),
        // PDFのリンクの文字を選んでURLを貼ると、href が足されて両方を持つ（貼り付けは今の属性に重ねて付けるため）。
        // そのときはURLのリンクとして書き出す
        renderHTML: (attributes: { fileId?: string | null; href?: string | null }) =>
          attributes.fileId && !attributes.href ? { "data-file-id": attributes.fileId } : {},
      },
    };
  },
  parseHTML() {
    return [
      { tag: "a[data-file-id]", priority: 60, getAttrs: (element) => (hasFileId(element) ? {} : false) },
      ...(this.parent?.() ?? []),
    ];
  },
}).configure({
  openOnClick: false,
  // 打ったURLを自動でリンクにしない（有効だと、リンクの直後に打った文字までリンクになる）。文字を選んでURLを貼るとリンクになるのは残る
  autolink: false,
  HTMLAttributes: { target: null, rel: null },
});

function missingImage() {
  const element = document.createElement("span");
  element.className = "editor-image-missing";
  element.textContent = "画像を表示できません";
  return element;
}

/**
 * 画像。保存するのは fileId、width、height、alt で、src は保存しない。初期記事のダミー画像だけは src のまま残す。
 * それ以外の画像（他のサイトの URL、data: など）は、読み込みと貼り付けのときに外す。
 * エディタの中では、ファイルを読んで表示する（書き出すHTMLには blob URL を入れない）。
 */
const FileImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
        rendered: false,
        parseHTML: (element: HTMLElement) => (element.getAttribute("src") === DUMMY_IMAGE ? DUMMY_IMAGE : null),
      },
      fileId: {
        default: null,
        parseHTML: (element: HTMLElement) => (hasFileId(element) ? element.getAttribute("data-file-id") : null),
        renderHTML: (attributes: { fileId?: string | null }) =>
          attributes.fileId ? { "data-file-id": attributes.fileId } : {},
      },
      width: { default: null },
      height: { default: null },
      alt: { default: "" },
      title: { default: null, parseHTML: () => null, rendered: false },
    };
  },
  parseHTML() {
    return [
      { tag: "img[data-file-id]", getAttrs: (element) => (hasFileId(element) ? {} : false) },
      { tag: "img", getAttrs: (element) => (element.getAttribute("src") === DUMMY_IMAGE ? {} : false) },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["img", node.attrs.src ? { ...HTMLAttributes, src: node.attrs.src } : HTMLAttributes];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      dom.className = "editor-image";
      let current = node;

      const show = () => {
        const shown = current;
        const image = document.createElement("img");
        for (const name of ["width", "height", "alt"] as const) {
          const value = shown.attrs[name];
          if (value !== null && value !== undefined) image.setAttribute(name, String(value));
        }
        dom.replaceChildren(image);
        if (shown.attrs.src) {
          image.src = shown.attrs.src;
          return;
        }
        void loadFileUrl(String(shown.attrs.fileId ?? "")).then((url) => {
          if (current !== shown) return;
          if (url) image.src = url;
          else dom.replaceChildren(missingImage());
        });
      };
      show();

      return {
        dom,
        update: (updated) => {
          if (updated.type !== current.type) return false;
          const same = ["fileId", "src", "width", "height", "alt"].every(
            (name) => updated.attrs[name] === current.attrs[name],
          );
          current = updated;
          if (!same) show();
          return true;
        },
      };
    };
  },
}).configure({ inline: true });

/** 箇条書きの項目。元サイトに入れ子はないので、Tab で入れ子にしない（中身も段落1つに限る）。 */
const FlatListItem = ListItem.extend({
  content: "paragraph",
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name),
    };
  },
});

export type FileDropHandler = (files: File[], position: number | undefined) => void;

// エディタごとの、ファイルを受け取る処理。拡張は1回だけ作るので、エディタの部品が登録する
const fileHandlers = new WeakMap<Editor, FileDropHandler>();

export function setFileDropHandler(editor: Editor, handler: FileDropHandler | null) {
  if (handler) fileHandlers.set(editor, handler);
  else fileHandlers.delete(editor);
}

/** 貼り付けたHTMLに、画像のほかに文字があるか。 */
function htmlHasText(html: string) {
  const body = new DOMParser().parseFromString(html, "text/html").body;
  return (body.textContent ?? "").replace(/ /g, "").trim() !== "";
}

/**
 * ファイルの貼り付けとドロップ。
 * Word や Excel からコピーすると、文章と一緒に「見た目の画像」もファイルとして入ることがあるので、
 * HTML に文字があれば通常の貼り付けにする。文字がなくファイルがあるとき（スクリーンショット、画像のコピー、Finder でのコピー）だけ取り込む。
 */
const FileDrop = Extension.create({
  name: "fileDrop",
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const handler = fileHandlers.get(editor);
            const data = event.clipboardData;
            const files = Array.from(data?.files ?? []);
            if (!handler || !data || files.length === 0) return false;
            const html = data.getData("text/html");
            if (html && htmlHasText(html)) return false;
            event.preventDefault();
            handler(files, undefined);
            return true;
          },
          handleDrop: (view, event, _slice, moved) => {
            const handler = fileHandlers.get(editor);
            const files = Array.from(event.dataTransfer?.files ?? []);
            // エディタの中で文字や画像を動かしたときは、通常どおり
            if (!handler || moved || files.length === 0) return false;
            event.preventDefault();
            handler(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
            return true;
          },
        },
      }),
    ];
  },
});

export const editorExtensions = [
  StarterKit.configure({
    heading: false,
    link: false,
    listItem: false,
    italic: false,
    strike: false,
    underline: false,
    code: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    orderedList: false,
  }),
  H3,
  FileLink,
  ColorSpan,
  TwoColors,
  FileImage,
  FlatListItem,
  FileDrop,
];
