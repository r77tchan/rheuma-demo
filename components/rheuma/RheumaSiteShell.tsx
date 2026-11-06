import type { ReactNode } from "react";
import { rheumaSideMenu, rheumaSite } from "@/data/rheuma";
import { Footer } from "../Footer";
import { SideMenu } from "../SideMenu";
import { RheumaHeader } from "./RheumaHeader";

/** /rheuma/ の枠。メインと違い、トップと下層で同じ見た目になる。 */
export function RheumaSiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="theme-rheuma pc:min-w-[1370px]">
      <RheumaHeader />
      <main className="mt-[130px] pc:mt-[90px]">{children}</main>
      <SideMenu items={rheumaSideMenu} hideAfter={60} />
      <Footer
        logoHref={rheumaSite.home}
        lineClass="pc:border-t pc:border-[#b3b3b3]"
        maxWidthClass="max-w-[1370px]"
      />
    </div>
  );
}
