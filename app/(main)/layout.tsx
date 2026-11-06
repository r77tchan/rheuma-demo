import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SideMenu } from "@/components/SideMenu";

/** メインサイトの共通レイアウト。サブサイトと投稿画面には付けない。 */
export default function MainSiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="pc:min-w-[1370px]">
      <Header />
      <main className="mt-[130px] pc:mt-[90px]">{children}</main>
      <SideMenu />
      <Footer />
    </div>
  );
}
