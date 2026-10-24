import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { FAQ_ITEMS } from "@/lib/content-pages";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const { locale } = await getT();
  const en = locale !== "km";

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-36">
      <header className="mb-10">
        <p className="eyebrow">AURELIA</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">FAQ</h1>
      </header>
      <div className="max-w-3xl space-y-4">
        {FAQ_ITEMS.map((item, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <details className="card-solid group p-5">
              <summary className="cursor-pointer list-none font-serif text-lg text-ink marker:hidden">
                <span className="mr-2 text-sage-deep group-open:rotate-90 inline-block transition-transform duration-300">→</span>
                {en ? item.q : item.qKh}
              </summary>
              <p className="mt-3 pl-6 text-sm leading-relaxed text-ink-soft">
                {en ? item.a : item.aKh}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
