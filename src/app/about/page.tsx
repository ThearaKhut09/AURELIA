import type { Metadata } from "next";
import { LocalizedPageView } from "@/components/content-page";
import { ABOUT_PAGE } from "@/lib/content-pages";

export const metadata: Metadata = { title: "Our story" };

export default function AboutPage() {
  return <LocalizedPageView page={ABOUT_PAGE} />;
}
