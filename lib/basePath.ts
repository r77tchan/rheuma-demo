/**
 * 公開URLの先頭のパス（next.config.ts の basePath）を付ける。
 * Link と useRouter には Next.js が自動で付けるので、ここを通すのは生の <a>、iframe の src、location に渡すURLだけ。
 * Link に渡すと二重に付く。
 */
export function withBasePath(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
