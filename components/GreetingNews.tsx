import { greeting } from "@/data/site";
import { Chevron, Placeholder } from "./parts";
import { TopNews } from "./TopNews";

function Greeting() {
  return (
    <div className="w-full tb:flex pc:w-[45%]">
      <div className="mb-5 shrink-0 tb:mr-[30px] tb:mb-0">
        <Placeholder className="mx-auto h-[218px] w-[209px]" label="ダミーの写真" />
      </div>
      <div>
        <p className="mb-[1em] font-serif text-[20px] font-medium tracking-[.1em]">
          <span className="bg-[linear-gradient(transparent_50%,var(--color-marker)_50%)] px-[3px]">
            {greeting.message}
          </span>
        </p>
        <p className="font-medium">
          {greeting.organization}
          <br />
          {greeting.name}
        </p>
        <div className="link-fade mt-[2em] text-center tb:mt-[25px] tb:text-left">
          <a
            href="#"
            className="relative inline-block w-[200px] rounded-[25px] bg-brand py-[7px] text-center text-white"
          >
            {greeting.button}
            <Chevron className="right-5 size-2.5 border-white" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function GreetingNews() {
  return (
    <section className="mb-10 bg-greeting px-5 py-10 tb:p-10 pc:mb-[35px] pc:flex pc:justify-between pc:pt-[35px] pc:pr-[100px] pc:pb-[30px] pc:pl-20">
      <Greeting />
      <TopNews />
    </section>
  );
}
