import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/** サイト内のリンク。行き先のページがまだない項目は # にする。 */
export function SiteLink({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href="#" className={className}>
      {children}
    </a>
  );
}

/** グレーのダミー画像。 */
export function Placeholder({
  className = "",
  style,
  label = "ダミー画像",
}: {
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`bg-placeholder ${className}`}
      style={style}
    />
  );
}

/** グレーのダミーロゴ。 */
export function LogoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="ダミーのロゴ"
      className={`flex items-center justify-center bg-placeholder font-bold tracking-[.2em] text-white ${className}`}
    >
      LOGO
    </div>
  );
}

/** アイコン用の小さなグレーの四角。 */
export function IconPlaceholder({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block bg-placeholder ${className}`} />;
}

/** ボタン右端などに置く「>」形の矢印。位置はclassNameで指定する。 */
export function Chevron({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-y-0 m-auto block rotate-45 border-t-2 border-r-2 ${className}`}
    />
  );
}

/** リンク名の横に付くPDFアイコンのダミー。 */
export function PdfMark() {
  return (
    <IconPlaceholder className="ml-1.5 inline-block size-3.5 align-[-1px]" />
  );
}
