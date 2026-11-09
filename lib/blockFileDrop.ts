/**
 * ファイルを落としたときに、ブラウザがそのファイルを開いてページが移動しないようにする（入力が消えるため）。
 * エディタ（contenteditable）の中だけは落とせるようにして、取り込みはエディタが行う（components/admin/editorExtensions.ts）。
 * 投稿画面と、プレビューの iframe の中で使う。外すときは、返した関数を呼ぶ。
 */
export function blockFileDrop(target: Window) {
  const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;
  const inEditor = (event: DragEvent) =>
    event.target instanceof Element && event.target.closest('[contenteditable="true"]') !== null;

  const onDragOver = (event: DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    // エディタの外では、落とせないことをカーソルで示す
    if (!inEditor(event) && event.dataTransfer) event.dataTransfer.dropEffect = "none";
  };
  const onDrop = (event: DragEvent) => {
    if (hasFiles(event)) event.preventDefault();
  };

  target.addEventListener("dragover", onDragOver);
  target.addEventListener("drop", onDrop);
  return () => {
    target.removeEventListener("dragover", onDragOver);
    target.removeEventListener("drop", onDrop);
  };
}
