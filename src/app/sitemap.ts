import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/shop",
    "/skincare",
    "/fragrance",
    "/about",
    "/contact",
    "/faq",
    "/shipping-returns",
    "/privacy",
    "/terms",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllProductSlugs();
    productRoutes = slugs.map((slug) => ({
      url: `${siteUrl}/product/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // Database unreachable at build time — ship static routes only.
  }

  return [...staticRoutes, ...productRoutes];
}
