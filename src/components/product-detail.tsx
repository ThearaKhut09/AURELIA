"use client";

// Product page interactive parts: gallery with zoom, variant + quantity,
// add-to-bag, and the Description/Ingredients/How-to-use/Shipping tabs.
// NOTE: commerce surfaces stay SOLID — no glass here per design spec.
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useT } from "@/components/locale-provider";
import { formatDual, formatUsd } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/products";

export function ProductDetail({ product }: { product: ProductDTO }) {
  const { t } = useT();
  const { add } = useCart();

  const [variantId, setVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const price = variant?.priceUsd ?? product.basePriceUsd;
  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;

  function addToBag() {
    add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        slug: product.slug,
        name: product.name,
        variantName: variant?.name ?? null,
        image: product.images[0] ?? "/products/discovery-set.svg",
        priceUsd: price,
        maxStock: Math.max(stock, 0),
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <Gallery images={product.images} name={product.name} />

      <div>
        <p className="eyebrow">{t(`nav.${product.category}`)}</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight text-ink sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{product.description}</p>

        {/* Price — solid, high-contrast, dual currency */}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-serif text-3xl text-ink">{formatUsd(price)}</span>
          <span className="text-sm text-ink-soft">{formatDual(price)}</span>
        </div>

        {product.variants.length > 0 && (
          <fieldset className="mt-6">
            <legend className="label">{t("product.size")}</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  disabled={v.stock <= 0}
                  aria-pressed={v.id === variantId}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    v.id === variantId
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/20 bg-white text-ink hover:border-ink/50",
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div>
            <span className="label">{t("product.quantity")}</span>
            <div className="flex items-center rounded-xl border border-ink/20 bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="px-4 py-3 text-ink-soft hover:text-ink"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="px-4 py-3 text-ink-soft hover:text-ink disabled:opacity-40"
                disabled={qty >= Math.max(stock, 1)}
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-1 pt-6">
            <button
              type="button"
              onClick={addToBag}
              disabled={soldOut}
              className="btn-solid w-full py-4 text-base"
            >
              {soldOut ? t("product.soldOut") : added ? t("product.added") : t("product.addToBag")}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-soft">
          {soldOut ? "" : t("product.inStock")} · {t("product.freeShippingNote")}
        </p>

        <Tabs product={product} />
      </div>
    </div>
  );
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const list = images.length > 0 ? images : ["/products/discovery-set.svg"];

  function onMove(e: React.MouseEvent) {
    if (!zoom || !frame.current) return;
    const rect = frame.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    frame.current.style.setProperty("--zx", `${x}%`);
    frame.current.style.setProperty("--zy", `${y}%`);
  }

  return (
    <div>
      <div
        ref={frame}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-ink/10 bg-cream"
      >
        <Image
          src={list[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300"
          style={
            zoom
              ? {
                  transform: "scale(1.6)",
                  transformOrigin:
                    "var(--zx, 50%) var(--zy, 50%)",
                }
              : undefined
          }
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-3">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative aspect-[4/5] w-16 overflow-hidden rounded-lg border-2 transition-colors",
                i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Tabs({ product }: { product: ProductDTO }) {
  const { t } = useT();
  const tabs = [
    { id: "description", label: t("product.description"), body: product.description },
    { id: "ingredients", label: t("product.ingredients"), body: product.ingredients },
    { id: "howToUse", label: t("product.howToUse"), body: product.howToUse },
    {
      id: "shipping",
      label: t("product.shippingTab"),
      body:
        "Phnom Penh 1–2 days, provinces 2–5 days. Free over $50. Unopened items returnable within 14 days — see Shipping & Returns for details.",
    },
  ] as const;
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("description");
  const body = useMemo(() => tabs.find((tb) => tb.id === active)?.body ?? "", [active, tabs]);

  return (
    <div className="mt-8 border-t border-ink/10">
      <div role="tablist" aria-label="Product information" className="flex flex-wrap gap-1 pt-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={active === tb.id}
            onClick={() => setActive(tb.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              active === tb.id
                ? "bg-ink/5 font-semibold text-ink"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>
      <p className="pt-3 text-sm leading-relaxed text-ink-soft" role="tabpanel">
        {body}
      </p>
    </div>
  );
}
