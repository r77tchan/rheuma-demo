import { SenmonSiteShell } from "@/components/senmon/SenmonSiteShell";

export default function SenmonLowerLayout({ children }: LayoutProps<"/senmon">) {
  return <SenmonSiteShell>{children}</SenmonSiteShell>;
}
