import { Placeholder } from "@/components/parts";
import { RheumaTopNews } from "@/components/rheuma/RheumaTopNews";

/** お知らせ以外のカードの代わりに置くグレーの枠。高さは元サイトの3つの幅（1440 / 900 / 390px）に揃えてある。 */
function Frame({ className }: { className: string }) {
  return <Placeholder label="ダミーの枠" className={`rounded-[10px] ${className}`} />;
}

export default function RheumaHomePage() {
  return (
    <>
      <section className="px-5 pt-5 tb:pt-10 pc:flex pc:justify-between pc:px-[100px] pc:pt-[30px]">
        {/* 781px は元サイトのメイン画像の幅。お知らせ欄との幅の取り合いを同じにする */}
        <div className="pc:w-[781px]">
          <Placeholder
            label="ダミーの枠"
            className="mb-2.5 h-[163.8px] tb:mb-5 tb:h-[152.6px] pc:h-[197.6px]"
          />
          <Placeholder
            label="ダミーの枠"
            className="aspect-[781/483] w-full tb:max-w-[781px] pc:w-[88%]"
          />
        </div>
        <RheumaTopNews />
      </section>

      <div className="px-5 tb:mb-5 pc:mb-20 pc:px-[100px]">
        {/* 関節リウマチについて */}
        <Frame className="mt-10 h-[762.4px] tb:mt-20 tb:h-[997.4px] pc:h-[792.2px]" />
        {/* リウマチに関連する病気。元サイトでは1024px以下で左右が少し狭くなる */}
        <Frame className="mx-auto mt-10 h-[444px] w-[95%] tb:mt-[60px] tb:h-[376.6px] tb:w-[calc(95%+38px)] pc:h-[271.8px] pc:w-full" />
        {/* こんな症状が出たら、公開講座・講演会等 */}
        <div className="pc:flex pc:justify-between">
          <Frame className="mt-10 h-[200px] tb:mt-[60px] tb:h-[209.4px] pc:w-[49%]" />
          <Frame className="mt-10 h-[122px] tb:mt-[60px] tb:h-[209.8px] pc:w-[49%]" />
        </div>
        {/* リウマチQ&A */}
        <Frame className="mt-10 h-[723.7px] tb:mt-20 tb:h-[999.5px] pc:h-[694.5px]" />
        {/* 医療機関 */}
        <Frame className="mt-10 h-[458.1px] tb:mt-20 tb:h-[357.2px] pc:h-[549.6px]" />
        {/* ライブラリー、災害時リウマチ患者支援 */}
        <div className="mt-10 tb:mt-20 pc:flex pc:justify-between">
          <Frame className="h-[275.6px] tb:h-[218px] pc:h-[260.6px] pc:w-[49%]" />
          <Frame className="mt-10 h-[268.7px] tb:h-[218.6px] pc:mt-0 pc:h-[260.6px] pc:w-[49%]" />
        </div>
      </div>
    </>
  );
}
