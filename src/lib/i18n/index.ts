// i18n runtime — cookie-based locale (English primary, Khmer toggle).
// Pure/shared module — safe in both server and client components.
// Server components use `getT()` from "@/lib/i18n/server".
// Client components use `useT()` from "@/components/locale-provider".
import { en, type Dict } from "./en";
import { km } from "./km";

export const LOCALE_COOKIE = "aurelia-locale";
export type Locale = "en" | "km";
export const dictionaries: Record<Locale, Dict> = { en, km };

export function lookup(dict: Dict, path: string): string {
  let node: unknown = dict;
  for (const part of path.split(".")) {
    if (node && typeof node === "object" && part in (node as Dict)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path; // missing key — surface the key rather than crash
    }
  }
  return typeof node === "string" ? node : path;
}

export function createT(locale: Locale) {
  const dict = dictionaries[locale];
  return (path: string): string => lookup(dict, path);
}

export type { Dict };
