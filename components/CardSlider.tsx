"use client";

import { useEffect, useRef, useState } from "react";
import { slides, type SlideBlock } from "@/data/site";
import { Chevron, Placeholder } from "./parts";

const AUTOPLAY_MS = 5000;

function Block({ block }: { block: SlideBlock }) {
  switch (block.type) {
    case "heading":
      return <p className={block.bold ? "font-bold" : undefined}>{block.text}</p>;
    case "text":
      return <p className={`text-[0.83em] font-bold ${block.gapBefore ? "mt-[1lh]" : ""}`}>{block.text}</p>;
    case "blankLine":
      return <p>&nbsp;</p>;
    case "image":
      return <Placeholder className="w-full" style={{ aspectRatio: block.ratio }} />;
    case "links":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item} className="text-ink">
              <span aria-hidden>☞ </span>
              <a className="underline">
                {item}
              </a>
            </li>
          ))}
        </ul>
      );
  }
}

/** PCでは4枚を中央に並べ、1024px以下では1枚ずつのスライダーにする。 */
export function CardSlider() {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const list = listRef.current;
    list?.scrollTo({ left: index * list.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const timer = window.setInterval(() => {
      const list = listRef.current;
      if (!list || !compact.matches || reducedMotion.matches) return;
      const current = Math.round(list.scrollLeft / list.clientWidth);
      const next = (current + 1) % slides.length;
      list.scrollTo({ left: next * list.clientWidth, behavior: "smooth" });
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto my-10 px-5 pt-5 tb:pt-[30px] tb:pb-[50px] pc:my-[35px] pc:pt-[45px] pc:pr-[100px] pc:pb-[45px] pc:pl-20">
      <div className="relative mx-auto max-w-[1600px]">
        <ul
          ref={listRef}
          onScroll={(event) => {
            const list = event.currentTarget;
            setActive(Math.round(list.scrollLeft / list.clientWidth));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] pc:snap-none pc:justify-center pc:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, index) => (
            <li
              key={index}
              className="link-fade relative mx-[15px] w-[calc(100%-30px)] shrink-0 snap-center border-2 border-brand-line pc:min-h-[449px] pc:w-[calc(20%-30px)]"
            >
              <div className="h-full space-y-0 overflow-hidden p-[15px] pb-[70px] font-serif text-[16px] font-medium text-black tb:text-[18px]">
                {slide.blocks.map((block, blockIndex) => (
                  <Block key={blockIndex} block={block} />
                ))}
              </div>
              {slide.button && (
                <div className="absolute right-[15px] bottom-[15px]">
                  <a
                    className="relative inline-block w-[173px] rounded-[25px] bg-ink py-1 pr-5 pl-2.5 text-center text-[12px] font-medium text-white tb:w-[190px] tb:text-[13px]"
                  >
                    {slide.button}
                    <Chevron className="right-[15px] size-2.5 border-white" />
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="absolute -bottom-[25px] left-0 flex w-full justify-center gap-[7px] tb:-bottom-10 tb:justify-start pc:hidden">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`スライド${index + 1}を表示`}
              aria-current={active === index}
              onClick={() => goTo(index)}
              className={`relative h-[7px] w-[45px] cursor-pointer tb:w-[70px] ${
                active === index ? "bg-brand-line" : "bg-ink"
              }`}
            >
              <span className="absolute -inset-y-2 inset-x-0" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
