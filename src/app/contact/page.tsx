import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { t, locale } = await getT();
  const en = locale !== "km";

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-36">
      <header className="mb-10">
        <p className="eyebrow">{t("nav.contact")}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          {en ? "We would love to hear from you" : "យើងរីករាយដែលបានឮពីអ្នក"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          {en
            ? "Questions about an order, a formula or a fragrance? Write to us — we reply within one business day."
            : "មានសំណួរអំពីការបញ្ជាទិញ រូបមន្ត ឬគ្រឿងក្រអៅ? សូមសរសេរមកយើង — យើងឆ្លើយតបក្នុងមួយថ្ងៃធ្វើការ។"}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="max-w-md">
          <ContactForm />
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-serif text-xl text-ink">Studio & showroom</h2>
            <p className="mt-2">
              Street 240, Daun Penh
              <br />
              Phnom Penh, Cambodia
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-ink">Email & phone</h2>
            <p className="mt-2">
              hello@aurelia.example
              <br />
              +855 (0) 12 345 678
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-ink">Hours</h2>
            <p className="mt-2">Monday – Saturday, 9:00 – 18:00 (ICT)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
