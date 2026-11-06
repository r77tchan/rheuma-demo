import { bannerCount } from "@/data/site";
import { Placeholder } from "./parts";

export function Banners() {
  return (
    <div className="link-fade bg-banner px-5 pt-10 pb-5 tb:px-[45px] tb:pt-[60px] tb:pb-10 pc:pt-[70px] pc:pr-20 pc:pb-[50px] pc:pl-10">
      <div className="mx-auto max-w-[1320px]">
        <ul className="flex flex-wrap justify-between tb:justify-start min-[1301px]:flex-nowrap">
          {Array.from({ length: bannerCount }, (_, index) => (
            <li
              key={index}
              className="mb-5 w-[47%] tb:mx-5 tb:w-[180px] pc:mb-2.5 pc:min-w-0"
            >
              <a href="#" className="block">
                <Placeholder
                  className="h-[51px] w-full max-w-[180px] border border-[#999]"
                  label="ダミーのバナー"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
