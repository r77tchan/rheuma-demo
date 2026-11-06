"use client";

import { useEffect, useState } from "react";
import { useScrolledPast } from "@/lib/useScrolledPast";
import { globalNav } from "@/data/site";
import { FullMenu } from "./FullMenu";
import { IconPlaceholder, LogoPlaceholder, PdfMark } from "./parts";

const MENU_ID = "full-menu";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pastHeader = useScrolledPast(90);
  const showLogo = useScrolledPast(400);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 z-[1000] h-[70px] w-full bg-white py-1.5 pl-5 transition-[margin] duration-500 tb:h-[90px] tb:py-[15px] pc:mt-0 pc:pl-10 ${
        pastHeader ? "mt-0" : "mt-[60px]"
      }`}
    >
      <div className="flex items-center justify-between">
        <a
          href="#"
          className={`block transition-[opacity,visibility] duration-500 ${
            showLogo ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <LogoPlaceholder className="h-[50px] w-[215px]" />
        </a>

        <nav aria-label="グローバルナビ" className="mr-[100px] hidden text-[18px] font-medium pc:block">
          <ul className="link-fade flex h-10 items-center">
            {globalNav.map((item) => (
              <li key={item.label} className="group relative mr-[3em]">
                {item.children ? (
                  <>
                    <button type="button" className="cursor-pointer">
                      {item.label}
                    </button>
                    <ul className="invisible absolute top-8 -left-5 z-[2000] w-[200px] bg-white opacity-0 shadow-[0_0_5px_0_#aaa] transition-[opacity,visibility] duration-300 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <a
                            href="#"
                            className="block px-5 py-2.5 text-[16px] font-normal transition-colors duration-300 hover:bg-brand hover:text-white hover:opacity-100"
                          >
                            {child.label}
                            {child.pdf && <PdfMark />}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <a href="#">{item.label}</a>
                )}
              </li>
            ))}
            <li className="mr-[3em]">
              <a href="#" aria-label="SNSのダミーリンク">
                <IconPlaceholder className="size-10 rounded-full" />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <FullMenu id={MENU_ID} open={menuOpen} pastHeader={pastHeader} />

      <button
        type="button"
        aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={menuOpen}
        aria-controls={MENU_ID}
        onClick={() => setMenuOpen((open) => !open)}
        className={`fixed right-0 z-[1000] flex size-[70px] cursor-pointer items-center justify-center rounded-bl-[20px] bg-brand transition-[top] duration-500 tb:size-[100px] pc:top-0 ${
          pastHeader ? "top-0" : "top-[60px]"
        }`}
      >
        <span className="relative block h-[18px] w-5 pc:h-[25px] pc:w-7">
          <span
            className={`absolute left-0 block h-0.5 w-full bg-white transition-all duration-300 ${
              menuOpen ? "top-2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute inset-y-0 m-auto block h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "left-1/2 w-0" : "left-0 w-full"
            }`}
          />
          <span
            className={`absolute left-0 block h-0.5 w-full bg-white transition-all duration-300 ${
              menuOpen ? "top-2 -rotate-45" : "top-[calc(100%-2px)]"
            }`}
          />
        </span>
      </button>
    </header>
  );
}
