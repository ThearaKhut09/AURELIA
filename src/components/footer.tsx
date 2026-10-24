import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export async function Footer() {
  const { t } = await getT();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid w-full max-w-site gap-10 px-5 py-14 sm:px-8 md:grid-cols-4 md:py-20">
        <div>
          <p className="font-serif text-2xl tracking-[0.35em]">AURELIA</p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">{t("footer.tagline")}</p>
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-cream/50">
            {t("footer.payments")}
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            {t("footer.shop")}
          </p>
          <ul className="flex flex-col gap-2.5 text-sm text-cream/80">
            <li><Link className="hover:text-cream" href="/shop">{t("nav.shop")}</Link></li>
            <li><Link className="hover:text-cream" href="/skincare">{t("nav.skincare")}</Link></li>
            <li><Link className="hover:text-cream" href="/fragrance">{t("nav.fragrance")}</Link></li>
            <li><Link className="hover:text-cream" href="/shop?category=rituals">{t("nav.rituals")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            {t("footer.help")}
          </p>
          <ul className="flex flex-col gap-2.5 text-sm text-cream/80">
            <li><Link className="hover:text-cream" href="/shipping-returns">{t("footer.shippingReturns")}</Link></li>
            <li><Link className="hover:text-cream" href="/faq">{t("footer.faq")}</Link></li>
            <li><Link className="hover:text-cream" href="/contact">{t("nav.contact")}</Link></li>
            <li><Link className="hover:text-cream" href="/privacy">{t("footer.privacy")}</Link></li>
            <li><Link className="hover:text-cream" href="/terms">{t("footer.terms")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
            {t("footer.follow")}
          </p>
          <ul className="flex flex-col gap-2.5 text-sm text-cream/80">
            <li>
              <a className="hover:text-cream" href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a className="hover:text-cream" href="https://tiktok.com/" target="_blank" rel="noopener noreferrer">
                TikTok
              </a>
            </li>
            <li>
              <a className="hover:text-cream" href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex w-full max-w-site flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-cream/50 sm:flex-row sm:px-8">
          <p>© {year} AURELIA. {t("footer.rights")}</p>
          <p>Phnom Penh, Cambodia</p>
        </div>
      </div>
    </footer>
  );
}
