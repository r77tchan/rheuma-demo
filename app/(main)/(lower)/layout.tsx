import { MainSiteShell } from "@/components/MainSiteShell";

export default function LowerLayout({ children }: LayoutProps<"/">) {
  return <MainSiteShell>{children}</MainSiteShell>;
}
