import type { Metadata } from "next";
import { LocalizedPageView } from "@/components/content-page";
import { PRIVACY_PAGE } from "@/lib/content-pages";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LocalizedPageView page={PRIVACY_PAGE} />;
}
