"use client";

import { useT } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleToggle({ light = false }: { light?: boolean }) {
  const { locale, setLocale } = useT();
  const next: Locale = locale === "en" ? "km" : "en";
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      title={locale === "en" ? "Switch to Khmer" : "Switch to English"}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
        light
          ? "border-cream/50 text-cream hover:bg-white/10"
          : "border-ink/20 text-ink hover:border-ink/50",
      )}
      aria-label={locale === "en" ? "Switch to Khmer" : "Switch to English"}
    >
      {locale === "en" ? "ខ្មែរ" : "EN"}
    </button>
  );
}
