import { Banners } from "@/components/Banners";
import { CardSlider } from "@/components/CardSlider";
import { ContentCards } from "@/components/ContentCards";
import { Footer } from "@/components/Footer";
import { GreetingNews } from "@/components/GreetingNews";
import { Header } from "@/components/Header";
import { MainVisual } from "@/components/MainVisual";
import { SideMenu } from "@/components/SideMenu";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mt-[130px] pc:mt-[90px]">
        <MainVisual />
        <GreetingNews />
        <ContentCards />
        <CardSlider />
        <Banners />
      </main>
      <SideMenu />
      <Footer />
    </>
  );
}
