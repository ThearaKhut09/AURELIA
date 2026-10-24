import type { Metadata } from "next";
import { LocalizedPageView } from "@/components/content-page";
import { SHIPPING_PAGE } from "@/lib/content-pages";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingPage() {
  return <LocalizedPageView page={SHIPPING_PAGE} />;
}
