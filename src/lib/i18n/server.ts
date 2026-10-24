// Server-only i18n helper — reads the locale cookie.
import { cookies } from "next/headers";
import { createT, type Locale } from "./index";

export type { Locale };

/** Server-side: read locale cookie and return a translate function. */
export async function getT(): Promise<{ locale: Locale; t: (path: string) => string }> {
  const store = await cookies();
  const locale: Locale = store.get("aurelia-locale")?.value === "km" ? "km" : "en";
  return { locale, t: createT(locale) };
}
