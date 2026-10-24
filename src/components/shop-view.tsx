import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import { Reveal } from "@/components/reveal";
import { getT } from "@/lib/i18n/server";
import { queryProducts, type ProductSort } from "@/lib/products";
import Link from "next/link";

export interface ShopSearchParams {
  category?: string;
  skinType?: string;
  concern?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

export async function ShopView({
  title,
  subtitle,
  defaultCategory = "all",
  searchParams,
}: {
  title: string;
  subtitle: string;
  defaultCategory?: string;
  searchParams: ShopSearchParams;
}) {
  const { t } = await getT();
  const category = searchParams.category ?? defaultCategory;
  const sort = (searchParams.sort as ProductSort) || "featured";
  const page = Number(searchParams.page ?? "1") || 1;

  const { items, total, pageCount } = await queryProducts({
    category,
    skinType: searchParams.skinType,
    concern: searchParams.concern,
    maxPrice: Number(searchParams.maxPrice) || undefined,
    sort,
    page,
  });

  const qs = (nextPage: number) => {
    const p = new URLSearchParams();
    if (category !== "all") p.set("category", category);
    if (searchParams.skinType) p.set("skinType", searchParams.skinType);
    if (searchParams.concern) p.set("concern", searchParams.concern);
    if (searchParams.maxPrice) p.set("maxPrice", searchParams.maxPrice);
    if (searchParams.sort) p.set("sort", searchParams.sort);
    p.set("page", String(nextPage));
    return `?${p.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-36">
      <header className="mb-8">
        <p className="eyebrow">{t("nav.shop")}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{subtitle}</p>
      </header>

      <div className="sticky top-20 z-30 md:top-24">
        <Suspense fallback={<div className="h-40 rounded-glass bg-cream/70" />}>
          <ShopFilters category={category} />
        </Suspense>
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        {total} {t("shop.results")}
      </p>

      {items.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-soft">{t("shop.noResults")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 && (
            <Link href={qs(page - 1)} className="btn-outline px-4 py-2 text-xs">
              ←
            </Link>
          )}
          <span className="text-sm text-ink-soft">
            {page} / {pageCount}
          </span>
          {page < pageCount && (
            <Link href={qs(page + 1)} className="btn-outline px-4 py-2 text-xs">
              →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
