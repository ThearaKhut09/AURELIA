"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useT } from "@/components/locale-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { cn } from "@/lib/utils";

export interface NavUser {
  name?: string | null;
  role?: "CUSTOMER" | "ADMIN";
}

export function Nav({ user }: { user: NavUser | null }) {
  const { t } = useT();
  const { count, open } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // On the home page the nav floats over the hero, then frosts on scroll.
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const links = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/skincare", label: t("nav.skincare") },
    { href: "/fragrance", label: t("nav.fragrance") },
    { href: "/shop?category=rituals", label: t("nav.rituals") },
    { href: "/about", label: t("nav.about") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-soft",
        overHero ? "bg-transparent" : "glass-frost !rounded-none border-x-0 border-t-0",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-site items-center justify-between px-5 sm:px-8 md:h-20">
        <Link
          href="/"
          className={cn(
            "font-serif text-2xl tracking-[0.35em] transition-colors",
            overHero ? "text-cream drop-shadow-sm" : "text-ink",
          )}
          aria-label="AURELIA home"
        >
          AURELIA
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm tracking-wide transition-colors duration-300",
                overHero
                  ? "text-cream/90 hover:text-cream"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleToggle light={overHero} />
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "hidden text-xs font-semibold uppercase tracking-wider sm:inline",
                overHero ? "text-cream/80 hover:text-cream" : "text-sage-deep hover:text-ink",
              )}
            >
              {t("nav.admin")}
            </Link>
          )}
          <Link
            href={user ? "/account" : "/login"}
            aria-label={t("nav.account")}
            className={cn(
              "rounded-full p-2 transition-colors",
              overHero ? "text-cream hover:bg-white/10" : "text-ink hover:bg-ink/5",
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={open}
            aria-label={`${t("nav.cart")} (${count})`}
            className={cn(
              "relative rounded-full p-2 transition-colors",
              overHero ? "text-cream hover:bg-white/10" : "text-ink hover:bg-ink/5",
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-cream">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full p-2 lg:hidden",
              overHero ? "text-cream hover:bg-white/10" : "text-ink hover:bg-ink/5",
            )}
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="glass-frost mx-3 mb-3 rounded-glass p-4 lg:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-3 text-sm text-ink transition-colors hover:bg-ink/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={user ? "/account" : "/login"}
              className="rounded-lg px-3 py-3 text-sm text-ink transition-colors hover:bg-ink/5"
            >
              {user ? t("nav.account") : t("nav.login")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
