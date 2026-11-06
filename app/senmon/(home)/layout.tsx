import { SenmonSiteShell } from "@/components/senmon/SenmonSiteShell";

export default function SenmonHomeLayout({ children }: LayoutProps<"/senmon">) {
  return <SenmonSiteShell home>{children}</SenmonSiteShell>;
}
