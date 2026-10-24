"use client";

// Floating glass filter bar — updates URL search params (SSR-friendly).
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useT } from "@/components/locale-provider";
import { formatUsd } from "@/lib/currency";

const SKIN_TYPES = ["normal", "dry", "oily", "combination", "sensitive"] as const;
const CONCERNS = ["hydration", "brightening", "anti-aging", "soothing"] as const;
const PRICES = [30, 50, 100, 150];

export function ShopFilters({ category }: { category: string }) {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page"); // filter change resets pagination
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const skinType = params.get("skinType") ?? "";
  const concern = params.get("concern") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const sort = params.get("sort") ?? "featured";
  const hasFilters = Boolean(skinType || concern || maxPrice);

  return (
    <div className="glass-frost p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label={t("shop.category")}
          value={category}
          onChange={(v) => setParam("category", v === "all" ? null : v)}
          options={[
            { value: "all", label: t("shop.allOption") },
            { value: "skincare", label: t("nav.skincare") },
            { value: "fragrance", label: t("nav.fragrance") },
            { value: "rituals", label: t("nav.rituals") },
          ]}
        />
        <FilterSelect
          label={t("shop.skinType")}
          value={skinType}
          onChange={(v) => setParam("skinType", v)}
          options={[
            { value: "", label: t("shop.allOption") },
            ...SKIN_TYPES.map((s) => ({ value: s, label: t(`shop.skinTypes.${s}`) })),
          ]}
        />
        <FilterSelect
          label={t("shop.concern")}
          value={concern}
          onChange={(v) => setParam("concern", v)}
          options={[
            { value: "", label: t("shop.allOption") },
            ...CONCERNS.map((c) => ({ value: c, label: t(`shop.concerns.${c}`) })),
          ]}
        />
        <FilterSelect
          label={t("shop.price")}
          value={maxPrice}
          onChange={(v) => setParam("maxPrice", v)}
          options={[
            { value: "", label: t("shop.allOption") },
            ...PRICES.map((p) => ({ value: String(p), label: `≤ ${formatUsd(p)}` })),
          ]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
        <FilterSelect
          label={t("shop.sort")}
          value={sort}
          onChange={(v) => setParam("sort", v === "featured" ? null : v)}
          options={[
            { value: "featured", label: t("shop.sortFeatured") },
            { value: "newest", label: t("shop.sortNewest") },
            { value: "price-asc", label: t("shop.sortPriceAsc") },
            { value: "price-desc", label: t("shop.sortPriceDesc") },
          ]}
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              router.replace("?", { scroll: false })
            }
            className="text-xs font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {t("shop.clear")}
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
