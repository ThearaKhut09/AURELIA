"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { itemKey, useCart } from "@/components/cart-provider";
import { useT } from "@/components/locale-provider";
import { formatUsd, formatKhr, usdToKhr } from "@/lib/currency";
import { FREE_SHIPPING_THRESHOLD_USD } from "@/lib/shipping";

export function CartDrawer() {
  const { isOpen, close, items, subtotalUsd, setQty, remove } = useCart();
  const { t } = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_USD - subtotalUsd);
  const progress = Math.min(100, (subtotalUsd / FREE_SHIPPING_THRESHOLD_USD) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            aria-hidden="true"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={t("cart.title")}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(26rem,100vw)] flex-col rounded-l-glass bg-cream shadow-lift"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="font-serif text-xl">{t("cart.title")}</h2>
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close bag"
                className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-sm text-ink-soft">{t("cart.empty")}</p>
                <Link href="/shop" onClick={close} className="btn-solid">
                  {t("cart.emptyCta")}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Free-shipping progress */}
                  <div className="mb-5">
                    <p className="mb-2 text-xs text-ink-soft">
                      {remaining > 0 ? (
                        <>
                          <span className="font-semibold text-ink">{formatUsd(remaining)}</span>{" "}
                          {t("cart.freeShippingAway")}
                        </>
                      ) : (
                        <span className="font-semibold text-sage-deep">
                          {t("cart.freeShippingDone")} ✓
                        </span>
                      )}
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-sage-deep transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <ul className="flex flex-col gap-4">
                    {items.map((item) => {
                      const key = itemKey(item);
                      return (
                        <li key={key} className="card-solid flex gap-3 p-3">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={close}
                            className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream"
                          >
                            <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                                {item.variantName && (
                                  <p className="text-xs text-ink-soft">{item.variantName}</p>
                                )}
                              </div>
                              <p className="whitespace-nowrap text-sm font-semibold">
                                {formatUsd(item.priceUsd * item.qty)}
                              </p>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-lg border border-ink/15">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  className="px-2.5 py-1 text-ink-soft hover:text-ink"
                                  onClick={() => setQty(key, item.qty - 1)}
                                >
                                  −
                                </button>
                                <span className="min-w-6 text-center text-sm">{item.qty}</span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  className="px-2.5 py-1 text-ink-soft hover:text-ink disabled:opacity-40"
                                  disabled={item.qty >= item.maxStock}
                                  onClick={() => setQty(key, item.qty + 1)}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(key)}
                                className="text-xs text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                              >
                                {t("cart.remove")}
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Totals — solid, high contrast per design spec */}
                <div className="border-t border-ink/10 bg-white px-6 py-4">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm text-ink-soft">{t("cart.subtotal")}</span>
                    <span className="font-serif text-xl text-ink">{formatUsd(subtotalUsd)}</span>
                  </div>
                  <p className="mb-4 text-xs text-ink-soft">
                    {formatKhr(usdToKhr(subtotalUsd))} · {t("cart.shippingNote")}
                  </p>
                  <Link href="/checkout" onClick={close} className="btn-solid w-full">
                    {t("cart.checkout")}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
