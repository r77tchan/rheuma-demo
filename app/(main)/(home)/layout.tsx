import { MainSiteShell } from "@/components/MainSiteShell";

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return <MainSiteShell home>{children}</MainSiteShell>;
}
