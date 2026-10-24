import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { getT } from "@/lib/i18n/server";
import { getBestsellers } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { t } = await getT();
  // Degrade gracefully (e.g. database not provisioned yet) instead of 500-ing.
  const bestsellers = await getBestsellers(4).catch(() => []);

  return (
    <div className="pt-16 md:pt-20">
      {/* ── Hero: full-bleed gradient + GLASS card ─────────────────────── */}
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 80% -10%, #C9A9A0 0%, transparent 60%)," +
              "radial-gradient(900px 700px at 10% 110%, #A8B5A2 0%, transparent 55%)," +
              "linear-gradient(160deg, #1C1F26 0%, #232833 45%, #2E3442 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -left-40 bottom-[-180px] h-[520px] w-[520px] rounded-full border border-white/10"
        />

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-site items-center px-5 py-24 sm:px-8">
          <div className="glass-dark max-w-2xl p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-cream/70">
              {t("home.heroEyebrow")}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-cream sm:text-5xl md:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/80">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-light">
                {t("home.heroCtaShop")}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-cream/40 px-6 py-3 text-sm font-semibold text-cream transition-colors duration-300 hover:bg-cream/10"
              >
                {t("home.heroCtaStory")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collections: glass-look tiles over gradients (no extra blur) ── */}
      <section className="section">
        <Reveal className="mb-10 text-center">
          <p className="eyebrow">{t("home.collectionsEyebrow")}</p>
          <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
            {t("home.collectionsTitle")}
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              href: "/skincare",
              title: t("home.collectionSkincare"),
              desc: t("home.collectionSkincareDesc"),
              gradient: "linear-gradient(150deg, #A8B5A2 0%, #7C8B76 100%)",
              image: "/products/jasmine-dew-serum.svg",
            },
            {
              href: "/fragrance",
              title: t("home.collectionFragrance"),
              desc: t("home.collectionFragranceDesc"),
              gradient: "linear-gradient(150deg, #C9A9A0 0%, #8D5A5F 100%)",
              image: "/products/angkor-dawn-edp.svg",
            },
            {
              href: "/shop?category=rituals",
              title: t("home.collectionRituals"),
              desc: t("home.collectionRitualsDesc"),
              gradient: "linear-gradient(150deg, #B99A5F 0%, #8A7360 100%)",
              image: "/products/frangipani-candle.svg",
            },
          ].map((tile, i) => (
            <Reveal key={tile.href} delay={i * 0.08}>
              <Link
                href={tile.href}
                className="group relative block overflow-hidden rounded-glass border border-white/40 shadow-glass transition-transform duration-500 ease-soft hover:-translate-y-1"
                style={{ background: tile.gradient }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-90 transition-transform duration-500 ease-soft group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
                </div>
                <div className="relative p-6">
                  <h3 className="font-serif text-2xl text-cream">{tile.title}</h3>
                  <p className="mt-1.5 text-sm text-cream/85">{tile.desc}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream">
                    {t("home.shopNow")} →
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Bestsellers: SOLID product cards ────────────────────────────── */}
      <section className="bg-white/60">
        <div className="section">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.bestsellersEyebrow")}</p>
              <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
                {t("home.bestsellersTitle")}
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              {t("home.viewAll")} →
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {bestsellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story: editorial serif + imagery panel ──────────────────────── */}
      <section className="section grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow">{t("home.storyEyebrow")}</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {t("home.storyTitle")}
          </h2>
          <p className="mt-5 leading-relaxed text-ink-soft">{t("home.storyP1")}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">{t("home.storyP2")}</p>
          <Link href="/about" className="btn-outline mt-7">
            {t("home.storyCta")}
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-glass border border-ink/10 shadow-card">
            <Image
              src="/products/rice-and-rain-edp.svg"
              alt="AURELIA Rice & Rain eau de parfum"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      {/* ── Rituals: numbered SOLID routine cards ───────────────────────── */}
      <section className="bg-ink text-cream">
        <div className="section">
          <Reveal className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-sage">
              {t("home.ritualsEyebrow")}
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">{t("home.ritualsTitle")}</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n, i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-cream/15 bg-[#232833] p-8">
                  <p className="font-serif text-5xl text-sage/70">0{n}</p>
                  <h3 className="mt-4 font-serif text-2xl">
                    {t(`home.step${n}Title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/75">
                    {t(`home.step${n}Body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials: GLASS panel over gradient ─────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #C9A9A0 0%, #E5D5CB 45%, #A8B5A2 100%)",
        }}
      >
        <div className="section">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow !text-ink/60">{t("home.testimonialsEyebrow")}</p>
            <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
              {t("home.testimonialsTitle")}
            </h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: t("home.quote1"), author: t("home.author1") },
              { quote: t("home.quote2"), author: t("home.author2") },
              { quote: t("home.quote3"), author: t("home.author3") },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <figure className="glass h-full p-7">
                  <blockquote className="text-sm leading-relaxed text-ink">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    — {item.author}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter: GLASS banner, SOLID input/button ────────────────── */}
      <section className="section">
        <Reveal>
          <div className="glass-frost mx-auto flex max-w-3xl flex-col items-center gap-5 p-8 text-center sm:p-12">
            <h2 className="font-serif text-3xl text-ink">{t("home.newsletterTitle")}</h2>
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">
              {t("home.newsletterSubtitle")}
            </p>
            <NewsletterForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
