import type { ReactNode } from "react";
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
      <SideMenu />
      <Footer home={home} />
    </div>
  );
}
