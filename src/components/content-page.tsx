import { getT } from "@/lib/i18n/server";
import type { LocalizedPage } from "@/lib/content-pages";
import { Reveal } from "@/components/reveal";

export async function LocalizedPageView({ page }: { page: LocalizedPage }) {
  const { locale } = await getT();
  const en = locale !== "km";

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-36">
      <header className="mb-10">
        <p className="eyebrow">AURELIA</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          {en ? page.title : page.titleKh}
        </h1>
      </header>
      <div className="max-w-3xl space-y-10">
        {page.sections.map((s, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <section>
              <h2 className="font-serif text-2xl text-ink">{en ? s.heading : s.headingKh}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{en ? s.body : s.bodyKh}</p>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
