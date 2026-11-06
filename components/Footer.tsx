import Link from "next/link";
import { footer } from "@/data/site";
import { IconPlaceholder, LogoPlaceholder } from "./parts";

/** 上の線と内側の最大幅は、サイトやページによって違う。 */
export function Footer({
  logoHref = "/",
  lineClass,
  maxWidthClass = "max-w-[1440px]",
}: {
  logoHref?: string;
  lineClass?: string;
  maxWidthClass?: string;
}) {
  return (
    <footer className={lineClass}>
      <div className="px-5 pt-10 pb-5 tb:py-[60px] pc:px-[100px]">
        <div className={`mx-auto tb:flex tb:justify-between ${maxWidthClass}`}>
          <Link href={logoHref} className="mx-auto block w-[215px] tb:mx-0">
            <LogoPlaceholder className="h-[50px] w-[215px]" />
          </Link>
          <ul className="link-fade my-5 flex items-center justify-center tb:my-0">
            {footer.links.map((label, index) => (
              <li key={`${label}-${index}`}>
                <a
                  href="#"
                  className={`text-[14px] tb:text-[15px] ${
                    index < footer.links.length - 1
                      ? "mr-2.5 border-r border-ink pr-2.5 tb:mr-10 tb:border-r-0 tb:pr-0"
                      : ""
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            aria-label="SNSのダミーリンク"
            className="mx-auto block w-[46px] tb:hidden"
          >
            <IconPlaceholder className="size-[46px] rounded-full" />
          </a>
        </div>
      </div>
      <div className="bg-brand py-[15px] text-center text-[14px] text-white tb:py-7 tb:text-[16px]">
        <p>{footer.copyright}</p>
      </div>
    </footer>
  );
}
