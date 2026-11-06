import { Placeholder } from "@/components/parts";
import { SenmonTopNews } from "@/components/senmon/SenmonTopNews";
import { senmonTop } from "@/data/senmon";

/** カードやボタンの代わりに置くグレーの枠。高さは元サイトの3つの幅（1440 / 900 / 390px）に揃えてある。 */
function Frame({ className }: { className: string }) {
  return <Placeholder label="ダミーの枠" className={className} />;
}

const innerClass = "mx-auto max-w-[1440px]";

/** 職種のカード。スマホ幅では中の行数が違うので、高さも1枚ずつ違う。 */
const workerCards = ["h-[349.9px]", "h-[316.9px]", "h-[316.9px]", "h-[342.1px]"];

/** 助成等募集のリンク。折り返す行が幅によって違う。 */
const subsidyLinks = [
  "h-[54px] tb:h-[58.8px]",
  "h-[54px] tb:h-[58.8px]",
  "h-[54px] tb:h-[58.8px] pc:h-[87.6px]",
  "h-[78px] tb:h-[58.8px] pc:h-[87.6px]",
  "h-[54px] tb:h-[58.8px]",
];

export default function SenmonHomePage() {
  return (
    <>
      <div className="px-5 pt-5 tb:pt-10 pc:px-[100px] pc:pt-5">
        <div className={innerClass}>
          <h1 className="font-serif text-[28px] leading-[1.8] font-medium tracking-[.05em] text-[#1a1a1a] tb:text-[60px]">
            <span className="text-[#e74d3d]">{senmonTop.headingAccent}</span>
            {senmonTop.heading}
          </h1>
          <h2 className="my-[5px] font-serif text-[24px] leading-[1.8] font-medium tracking-[.1em] text-[#5badb6] tb:text-[36px]">
            {senmonTop.pickup}
          </h2>
          {/* 元サイトのスライダーの代わりに、1画面に見える枚数を固定で並べる */}
          <div className="h-[396.6px] tb:h-[809.1px] pc:grid pc:h-[494.2px] pc:grid-cols-4 pc:gap-x-[30px]">
            {[0, 1, 2, 3].map((index) => (
              <Frame key={index} className={`h-full ${index > 0 ? "hidden pc:block" : ""}`} />
            ))}
          </div>
        </div>
      </div>

      <section className="mt-[60px] bg-[#f5f7f9] px-5 py-10 tb:mt-20 pc:px-[100px]">
        <div className={`${innerClass} pc:flex pc:justify-between`}>
          <div className="mb-10 pc:mb-0 pc:w-[35%]">
            <h2 className="mb-[26px] pb-[13px] text-center font-serif text-[26px] leading-[1.4] font-medium tracking-[.1em] tb:mb-[30px] tb:pb-0 tb:text-[30px] pc:text-left">
              {senmonTop.training}
            </h2>
            <div className="grid gap-y-[11.2px] tb:grid-cols-[49%_49%] tb:justify-between pc:grid-cols-1 pc:gap-y-5">
              {[0, 1, 2, 3].map((index) => (
                <Frame key={index} className="h-[66.8px] rounded-[10px] pc:h-[74px]" />
              ))}
            </div>
          </div>
          <SenmonTopNews />
        </div>
      </section>

      {/* 職種ごとのメニュー */}
      <div className="mt-10 px-5 tb:mt-20 pc:px-[100px]">
        <div
          className={`${innerClass} grid gap-y-5 tb:gap-y-[35px] pc:grid-cols-[49%_49%] pc:justify-between`}
        >
          {workerCards.map((heightClass, index) => (
            <Frame key={index} className={`${heightClass} tb:h-[470.8px] pc:h-[407.4px]`} />
          ))}
        </div>
      </div>

      <section className="mt-10 bg-[#f5f7f9] px-5 py-10 tb:mt-20 tb:py-[60px] pc:px-[100px]">
        <div className={innerClass}>
          <h2 className="mb-5 text-center font-serif text-[26px] leading-[1.4] font-medium tracking-[.1em] text-teal tb:mb-[45px] tb:text-[60px] pc:text-left">
            {senmonTop.subsidy}
          </h2>
          {/* 元サイトの行の下線（2px）の分だけ、枠のあいだを空ける */}
          <div className="grid gap-y-0.5 pb-0.5 pc:grid-cols-[48%_48%] pc:justify-between">
            {subsidyLinks.map((heightClass, index) => (
              <Frame key={index} className={heightClass} />
            ))}
          </div>
          {/* もっとみる */}
          <Frame className="mt-10 ml-auto h-[28.8px] w-[130px] tb:w-[150px] pc:mt-0" />
        </div>
      </section>

      {/* 財団ニュース */}
      <div className="mt-10 px-5 tb:mt-20 pc:px-[100px]">
        <Frame className={`${innerClass} h-[547.2px] tb:h-[289.2px] pc:h-[332px]`} />
      </div>

      {/* 医療機関 */}
      <section className="mt-10 bg-[#f5f7f9] px-5 py-10 tb:mt-20 tb:py-[60px] pc:px-[100px] pc:py-[30px]">
        <Frame className={`${innerClass} h-[455.2px] tb:h-[273px] pc:h-[470px]`} />
      </section>
    </>
  );
}
