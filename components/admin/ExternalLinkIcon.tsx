/** 別のタブで開くリンクに付けるマーク。読み上げでは「別のタブで開く」と伝える。 */
export function ExternalLinkIcon() {
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-0.5 inline-block size-[0.85em] align-[-0.05em]"
      >
        <path d="M6.5 3.5h-3v9h9v-3" />
        <path d="M9.5 2.5h4v4" />
        <path d="M13.5 2.5 7.5 8.5" />
      </svg>
      <span className="sr-only">（別のタブで開く）</span>
    </>
  );
}
