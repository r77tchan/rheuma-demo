// 本文のHTMLの処理。画像とPDFは data-file-id だけを本文に残し、表示するときに URL に差し替える（lib/fileStore.ts）。
// 保存する形: 画像 <p><img data-file-id="…" width="…" height="…" alt=""></p>、PDF <a data-file-id="…">文字</a>。

const FILE_ID_ATTRIBUTE = /data-file-id="([0-9a-f]{32})"/g;

/** 本文で使っているファイルのID（重なりなし）。 */
export function extractFileIds(html: string): string[] {
  return [...new Set(Array.from(html.matchAll(FILE_ID_ATTRIBUTE), (match) => match[1]))];
}

/** 末尾の空の段落を除く。エディタは、見出しや箇条書きで終わる本文の後ろに空の段落を足すため。 */
export function trimTrailingEmptyParagraphs(html: string) {
  return html.replace(/(?:<p>(?:\s|&nbsp;| |<br\s*\/?>)*<\/p>)+$/, "");
}

/** 本文が空か。画像があれば空ではない。空白と &nbsp; だけの文字は空とみなす。 */
export function isBodyEmpty(html: string) {
  if (/<img\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;| /g, "").trim() === "";
}

/**
 * ファイルのIDを URL に差し替えたHTMLを返す。ブラウザでだけ呼ぶ（template 要素を使う）。
 * lookup が undefined を返すファイル（読み込み中）は、そのままにする。
 * 見つからない画像は消し、見つからないPDFはリンクを外して文字だけにする。
 */
export function resolveFileHtml(html: string, lookup: (id: string) => string | null | undefined) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;

  for (const image of root.querySelectorAll("img[data-file-id]")) {
    const url = lookup(image.getAttribute("data-file-id") ?? "");
    if (url === undefined) continue;
    if (url) {
      image.setAttribute("src", url);
      continue;
    }
    const parent = image.parentElement;
    image.remove();
    // 画像だけの段落が空で残ると、余白だけが出る
    if (parent?.tagName === "P" && !parent.textContent?.trim() && !parent.querySelector("img")) parent.remove();
  }

  for (const link of root.querySelectorAll("a[data-file-id]")) {
    const url = lookup(link.getAttribute("data-file-id") ?? "");
    if (url === undefined) continue;
    if (url) {
      // blob URL は、作ったページが開いているあいだだけ使える。同じタブで開くと、PDFの画面で再読み込みしたときに表示できなくなるので、別のタブで開く
      link.setAttribute("href", url);
      link.setAttribute("target", "_blank");
      continue;
    }
    link.replaceWith(...link.childNodes);
  }

  return template.innerHTML;
}
