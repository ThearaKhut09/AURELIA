import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Kantumruy_Pro } from "next/font/google";
import { getServerSession } from "next-auth";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/components/locale-provider";
import { Nav } from "@/components/nav";
import { authOptions } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

// Khmer Unicode rendering — required for the ខ្មែរ language toggle.
const khmer = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-khmer",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AURELIA — Rituals for skin and senses",
    template: "%s · AURELIA",
  },
  description:
    "Premium skincare and fragrance formulated in Phnom Penh, Cambodia. Rice water, jasmine, moringa and frangipani — with ABA PayWay, KHQR and card payments.",
  keywords: [
    "skincare Cambodia",
    "fragrance Cambodia",
    "KHQR payments",
    "ABA PayWay",
    "Phnom Penh beauty",
  ],
  openGraph: {
    type: "website",
    siteName: "AURELIA",
    title: "AURELIA — Rituals for skin and senses",
    description:
      "Premium skincare and fragrance formulated in Phnom Penh, Cambodia.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F7F3EE",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = await getT();
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable} ${khmer.variable}`}>
      <body className="min-h-screen">
        <LocaleProvider locale={locale}>
          <CartProvider>
            <Nav
              user={
                session?.user
                  ? { name: session.user.name, role: session.user.role }
                  : null
              }
            />
            <main id="main">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
