"use client";

import Link from "next/link";
import { useFullMenu } from "@/lib/useFullMenu";
import { useScrolledPast } from "@/lib/useScrolledPast";
import { globalNav } from "@/data/site";
import { FullMenu } from "./FullMenu";
import { MenuButton } from "./MenuButton";
import { IconPlaceholder, LogoPlaceholder, PdfMark } from "./parts";

/** トップではロゴを400pxスクロールするまで隠す。下層ページでは最初から表示する。 */
export function Header({ home }: { home: boolean }) {
  const { menuId, menuOpen, setMenuOpen } = useFullMenu();
  const pastHeader = useScrolledPast(90);
  const scrolledPastHero = useScrolledPast(400);
  const showLogo = !home || scrolledPastHero;

  return (
    <header
      className={`fixed top-0 left-0 z-[1000] h-[70px] w-full bg-white py-1.5 pl-5 transition-[margin] duration-500 tb:h-[90px] tb:py-[15px] pc:mt-0 pc:pl-10 ${
        pastHeader ? "mt-0" : "mt-[60px]"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className={`block transition-[opacity,visibility] duration-500 ${
            showLogo ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <LogoPlaceholder className="h-[50px] w-[215px]" />
        </Link>

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

      <FullMenu
        id={menuId}
        open={menuOpen}
        pastHeader={pastHeader}
        onNavigate={() => setMenuOpen(false)}
      />

      <MenuButton
        menuId={menuId}
        open={menuOpen}
        pastHeader={pastHeader}
        colorClass="bg-brand"
        onClick={() => setMenuOpen((open) => !open)}
      />
    </header>
  );
}
