import { useEffect, useId, useLayoutEffect, useState } from "react";

/** 全画面メニューの開閉。Escキーと、ページを移ったときの閉じる処理もここにまとめる。 */
export function useFullMenu() {
  // トップと下層でヘッダーが同時にDOMに残るので、IDが重ならないようにする
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  // 別のレイアウトのページへ移ると、ヘッダーは隠れるだけで状態が残るので、隠れるときに閉じる
  useLayoutEffect(() => () => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    // 同じレイアウト内で戻る、進むを押したときは、ヘッダーが隠れないのでここで閉じる
    const close = () => setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", close);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", close);
    };
  }, [menuOpen]);

  return { menuId, menuOpen, setMenuOpen };
}
