import { contentCards } from "@/data/site";
import { PdfMark } from "./parts";

export function ContentCards() {
  return (
    <section className="mx-auto mb-10 px-5 tb:px-10 pc:mb-[35px] pc:pr-[100px] pc:pl-20">
      <div className="link-fade mx-auto max-w-[1600px] tb:flex tb:flex-wrap tb:items-stretch tb:justify-between pc:flex-nowrap">
        {contentCards.map((card) => (
          <div
            key={card.title}
            className="relative mb-10 w-full bg-placeholder shadow-[4px_3px_6px_0_rgba(0,0,0,.15)] last:mb-0 tb:mb-0 tb:w-[48%] tb:last:mt-10 pc:w-[30%] pc:last:mt-0"
          >
            <span aria-hidden className={`absolute inset-0 ${card.overlay}`} />
            <span aria-hidden className="absolute top-0 left-[55px] z-[2] h-full w-px bg-white" />
            <div className="relative z-[2] min-h-[250px] pt-[5px] pr-2.5 pb-5 pl-[55px]">
              <h3 className="border-b border-white pl-[30px] text-[20px] font-bold text-white tb:text-[22px] pc:text-[clamp(25px,1.72vw,33px)]">
                {card.title}
              </h3>
              <h4 className="absolute top-5 left-[11px] font-serif text-[16px] font-bold text-white [writing-mode:vertical-rl]">
                {card.english}
              </h4>
              <ul className="mt-2.5 ml-[30px]">
                {card.links.map((link) => (
                  <li key={link.label} className="text-[18px] tracking-[.1em]">
                    <a className="block text-white">
                      {link.label}
                      {link.pdf && <PdfMark />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
