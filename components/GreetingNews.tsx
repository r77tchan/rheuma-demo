import { greeting, news, newsCategories } from "@/data/site";
import { Chevron, Placeholder } from "./parts";

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

function News() {
  return (
    <div className="mt-10 w-full rounded-[10px] border-[3px] border-news-line px-5 pt-5 pb-[30px] tb:px-[30px] pc:mt-0 pc:w-[53%]">
      <h2 className="mb-[.5em] border-b border-[#ccc] pb-5 text-center font-serif text-[30px] leading-[1.8] font-medium tracking-[.1em] tb:border-b-0 tb:pb-0 tb:leading-[1.4] pc:text-left">
        {news.heading}
      </h2>

      {news.items.map((item) => {
        const category = newsCategories[item.category];
        return (
          <article
            key={item.dateTime}
            className="relative mb-[30px] text-[14px] font-medium tb:mb-[15px] tb:flex"
          >
            <div className="mb-[5px] tb:mb-0 tb:flex tb:shrink-0 tb:items-start">
              <time dateTime={item.dateTime} className="text-[15px] text-date tb:text-[14px] tb:text-ink">
                {item.date}
              </time>
              <span className="link-fade absolute top-0 right-0 tb:static">
                <a
                  href="#"
                  className={`ml-[15px] block w-[160px] rounded px-2 pt-0.5 text-center text-white tb:mx-[15px] ${category.color}`}
                >
                  {category.label}
                </a>
              </span>
            </div>
            <div className="min-w-0">
              <a href="#" className="block underline tb:inline tb:no-underline">
                {item.title}
              </a>
            </div>
          </article>
        );
      })}

      <div className="link-fade mt-10 text-right leading-[1.4] pc:mt-0">
        <a href="#" className="relative pr-[60px] text-[14px] tb:text-[16px]">
          {news.more}
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 m-auto block size-10 rounded-full border border-ink tb:size-[50px]"
          />
          <Chevron className="right-[17px] size-2.5 border-ink tb:right-[22px] tb:size-3" />
        </a>
      </div>
    </div>
  );
}

export function GreetingNews() {
  return (
    <section className="mb-10 bg-greeting px-5 py-10 tb:p-10 pc:mb-[35px] pc:flex pc:justify-between pc:pt-[35px] pc:pr-[100px] pc:pb-[30px] pc:pl-20">
      <Greeting />
      <News />
    </section>
  );
}
