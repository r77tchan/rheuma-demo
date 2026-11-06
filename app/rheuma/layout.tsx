import { RheumaSiteShell } from "@/components/rheuma/RheumaSiteShell";

export default function RheumaLayout({ children }: LayoutProps<"/rheuma">) {
  return <RheumaSiteShell>{children}</RheumaSiteShell>;
}
