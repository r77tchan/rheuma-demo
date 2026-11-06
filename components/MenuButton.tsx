/** 右上に固定する、全画面メニューの開閉ボタン。 */
export function MenuButton({
  menuId,
  open,
  pastHeader,
  colorClass,
  onClick,
}: {
  menuId: string;
  open: boolean;
  pastHeader: boolean;
  colorClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={open ? "メニューを閉じる" : "メニューを開く"}
      aria-expanded={open}
      aria-controls={menuId}
      onClick={onClick}
      className={`fixed right-0 z-[1000] flex size-[70px] cursor-pointer items-center justify-center rounded-bl-[20px] transition-[top] duration-500 tb:size-[100px] pc:top-0 ${colorClass} ${
        pastHeader ? "top-0" : "top-[60px]"
      }`}
    >
      <span className="relative block h-[18px] w-5 pc:h-[25px] pc:w-7">
        <span
          className={`absolute left-0 block h-0.5 w-full bg-white transition-all duration-300 ${
            open ? "top-2 rotate-45" : "top-0"
          }`}
        />
        <span
          className={`absolute inset-y-0 m-auto block h-0.5 bg-white transition-all duration-300 ${
            open ? "left-1/2 w-0" : "left-0 w-full"
          }`}
        />
        <span
          className={`absolute left-0 block h-0.5 w-full bg-white transition-all duration-300 ${
            open ? "top-2 -rotate-45" : "top-[calc(100%-2px)]"
          }`}
        />
      </span>
    </button>
  );
}
