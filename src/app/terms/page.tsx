import type { Metadata } from "next";
import { LocalizedPageView } from "@/components/content-page";
import { TERMS_PAGE } from "@/lib/content-pages";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <LocalizedPageView page={TERMS_PAGE} />;
}
