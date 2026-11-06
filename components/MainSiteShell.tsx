import type { ReactNode } from "react";
import { sideMenu } from "@/data/site";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";

/** メインサイトの枠。トップと下層で、ロゴとフッターの見た目だけが変わる。 */
export function MainSiteShell({
  home = false,
  children,
}: {
  home?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="pc:min-w-[1370px]">
      <Header home={home} />
      <main className="mt-[130px] pc:mt-[90px]">{children}</main>
      <SideMenu items={sideMenu} />
      {/* 下層ページのフッターには、上に線が付く */}
      <Footer lineClass={home ? undefined : "border-t border-[#b3b3b3]"} />
    </div>
  );
}
