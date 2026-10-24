"use client";

// Locale context — the server layout reads the cookie and hydrates the
// client; toggling sets the cookie and refreshes server components.
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { createT } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  t: (path: string) => string;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: createT(locale), setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT must be used within LocaleProvider");
  return ctx;
}
