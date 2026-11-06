import type { ReactNode } from "react";
import { senmonSideMenu, senmonSite } from "@/data/senmon";
import { Footer } from "../Footer";
import { SideMenu } from "../SideMenu";
import { SenmonHeader } from "./SenmonHeader";

/** /senmon/ の枠。トップと下層の違いは、フッターの上の線だけ。 */
export function SenmonSiteShell({
  home = false,
  children,
}: {
  home?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="pc:min-w-[1370px]">
      <SenmonHeader />
      <main className="mt-[130px] pc:mt-[90px]">{children}</main>
      <SideMenu items={senmonSideMenu} hideAfter={60} />
      <Footer
        logoHref={senmonSite.home}
        lineClass={home ? undefined : "border-t border-[#b3b3b3]"}
      />
    </div>
  );
}
