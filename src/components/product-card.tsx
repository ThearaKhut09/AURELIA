import Image from "next/image";
import Link from "next/link";
import { formatDual } from "@/lib/currency";
import type { ProductDTO } from "@/lib/products";
import { cn } from "@/lib/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-gold", className)}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={rating >= i - 0.5 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3z" />
        </svg>
      ))}
    </span>
  );
}

export function ProductCard({ product }: { product: ProductDTO }) {
  const soldOut = product.stock <= 0 && product.variants.every((v) => v.stock <= 0);
  const onSale = product.compareAtUsd && product.compareAtUsd > product.basePriceUsd;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-solid group block overflow-hidden hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream">
        <Image
          src={product.images[0] ?? "/products/discovery-set.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
        />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-rose px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream">
            Sale
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-cream/70 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-snug text-ink">{product.name}</h3>
        </div>
        {product.reviewsAvg !== null && product.reviewsCount > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <Stars rating={product.reviewsAvg} />
            <span className="text-xs text-ink-soft">({product.reviewsCount})</span>
          </div>
        )}
        <p className="mt-2 text-sm">
          <span className="font-semibold text-ink">{formatDual(product.basePriceUsd)}</span>
          {onSale && (
            <s className="ml-2 text-ink-soft/70">{formatDual(product.compareAtUsd!)}</s>
          )}
        </p>
      </div>
    </Link>
  );
}
