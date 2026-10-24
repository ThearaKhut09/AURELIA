import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, Stars } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { ReviewForm } from "@/components/review-form";
import { getT } from "@/lib/i18n/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { KHR_RATE, usdToKhr, formatKhr } from "@/lib/currency";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: product.images.length > 0 ? [{ url: product.images[0] }] : undefined,
      type: "website",
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { t } = await getT();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  // JSON-LD Product schema (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: "AURELIA" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.basePriceUsd.toFixed(2),
      availability:
        product.stock > 0 || product.variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(product.reviewsCount > 0 && product.reviewsAvg
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.reviewsAvg.toFixed(1),
            reviewCount: product.reviewsCount,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-soft">
        <Link href="/shop" className="hover:text-ink hover:underline">
          {t("nav.shop")}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${product.category}`} className="hover:text-ink hover:underline">
          {t(`nav.${product.category}`)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {/* Reviews — SOLID section */}
      <section className="mt-16 border-t border-ink/10 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl text-ink">{t("product.reviews")}</h2>
          {product.reviewsAvg !== null && product.reviewsCount > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={product.reviewsAvg} />
              <span className="text-sm text-ink-soft">
                {product.reviewsAvg.toFixed(1)} · {product.reviewsCount}
              </span>
            </div>
          )}
        </div>

        {product.reviews.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">{t("product.noReviews")}</p>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {product.reviews.slice(0, 8).map((r) => (
              <li key={r.id} className="card-solid p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{r.author}</p>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.comment}</p>
                <p className="mt-2 text-xs text-ink-soft/60">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-2xl text-ink">{t("product.related")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-xs text-ink-soft">
        {t("product.freeShippingNote")} · {formatKhr(usdToKhr(product.basePriceUsd, KHR_RATE))}
      </p>
    </div>
  );
}
