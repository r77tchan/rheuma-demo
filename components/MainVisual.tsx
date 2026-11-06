import { guides } from "@/data/site";
import { Chevron, IconPlaceholder, LogoPlaceholder, Placeholder } from "./parts";

export function MainVisual() {
  return (
    <div className="flex flex-wrap justify-between px-5 pb-10 text-center tb:flex-nowrap tb:pt-[30px] tb:pr-10 tb:pl-5 pc:pt-0 pc:pr-[100px] pc:pb-[35px] pc:pl-20">
      <div className="mx-auto mb-[35px] w-4/5 tb:mb-0 tb:w-[30%] pc:mx-0 pc:w-[23%]">
        <LogoPlaceholder className="aspect-[286/105] w-full text-[28px]" />
      </div>

      <div className="w-full tb:w-auto pc:w-[65%]">
        <div className="flex flex-wrap justify-center tb:flex-col tb:flex-nowrap tb:items-center pc:flex-row pc:items-stretch pc:justify-end pc:gap-x-[2%]">
          {guides.map((guide, index) => (
            <div
              key={guide.title}
              className={`w-full tb:w-auto pc:w-1/2 ${index === 0 ? "mb-[30px] tb:mb-10 pc:mb-0" : ""}`}
            >
              <div className="flex justify-end gap-x-[3%] tb:gap-x-0">
                <div className="w-[30%] shrink-0 tb:mr-5 tb:w-[147px] tb:shrink">
                  <Placeholder className="aspect-square w-full rounded-full" />
                </div>
                <div className="w-[70%] tb:w-auto">
                  <h3 className="mb-2.5 text-[clamp(17px,4.4vw,23px)] leading-[1.4] font-medium tracking-[.1em] tb:text-[clamp(23px,1.47vw,26px)]">
                    {guide.title}
                  </h3>
                  <p className="text-[14px] tb:text-[15px]">
                    {guide.lines.map((line, lineIndex) => (
                      <span key={line}>
                        {lineIndex > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                  <div className="link-fade">
                    <a
                      href="#"
                      className={`relative mt-2.5 inline-block w-full max-w-[285px] rounded-[35px] py-2 text-[12px] text-white tb:w-[285px] tb:text-[15px] pc:py-[5px] ${guide.color}`}
                    >
                      <IconPlaceholder className="absolute inset-y-0 left-5 m-auto size-5 rounded-full" />
                      {guide.button}
                      <Chevron className="right-5 size-2.5 border-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
