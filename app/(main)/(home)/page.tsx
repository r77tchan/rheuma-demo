import { Banners } from "@/components/Banners";
import { CardSlider } from "@/components/CardSlider";
import { ContentCards } from "@/components/ContentCards";
import { GreetingNews } from "@/components/GreetingNews";
import { MainVisual } from "@/components/MainVisual";

export default function Home() {
  return (
    <>
      <MainVisual />
      <GreetingNews />
      <ContentCards />
      <CardSlider />
      <Banners />
    </>
  );
}
