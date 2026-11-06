import { footer } from "@/data/site";
import { IconPlaceholder, LogoPlaceholder } from "./parts";

export function Footer() {
  return (
    <footer>
      <div className="px-5 pt-10 pb-5 tb:py-[60px] pc:px-[100px]">
        <div className="mx-auto max-w-[1440px] tb:flex tb:justify-between">
          <a href="#" className="mx-auto block w-[215px] tb:mx-0">
            <LogoPlaceholder className="h-[50px] w-[215px]" />
          </a>
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
            className="mx-auto block w-10 tb:hidden"
          >
            <IconPlaceholder className="size-10 rounded-full" />
          </a>
        </div>
      </div>
      <div className="bg-brand py-[15px] text-center text-[14px] text-white tb:py-7 tb:text-[16px]">
        <p>{footer.copyright}</p>
      </div>
    </footer>
  );
}
