"use client";

// 4-step checkout: Contact → Shipping → Payment → Review.
// SOLID surfaces only — clarity and trust first per design spec.
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useT } from "@/components/locale-provider";
import { formatDual, formatKhr, formatUsd, usdToKhr } from "@/lib/currency";
import { PROVINCES, shippingFor } from "@/lib/shipping";
import { cn } from "@/lib/utils";

export interface Prefill {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    phone?: string;
  } | null;
}

const STEP_KEYS = ["stepContact", "stepShipping", "stepPayment", "stepReview"] as const;

export function CheckoutForm({
  prefill,
  vatRate,
  canceled,
  paywayReady,
}: {
  prefill: Prefill;
  vatRate: number;
  canceled: boolean;
  paywayReady: boolean;
}) {
  const { t } = useT();
  const router = useRouter();
  const { items, subtotalUsd, clear } = useCart();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contact, setContact] = useState({
    name: prefill.name ?? "",
    email: prefill.email ?? "",
    phone: prefill.phone ?? prefill.address?.phone ?? "",
  });
  const [shipping, setShipping] = useState({
    province: prefill.address?.province ?? "Phnom Penh",
    city: prefill.address?.city ?? "",
    line1: prefill.address?.line1 ?? "",
    line2: prefill.address?.line2 ?? "",
    notes: "",
  });
  const [paymentOption, setPaymentOption] = useState<"abapay_khqr" | "cards" | "choose">(
    "abapay_khqr",
  );

  const shippingUsd = useMemo(
    () => shippingFor(shipping.province, subtotalUsd),
    [shipping.province, subtotalUsd],
  );
  const vatUsd = useMemo(
    () => Math.round(subtotalUsd * vatRate * 100) / 100,
    [subtotalUsd, vatRate],
  );
  const totalUsd = Math.round((subtotalUsd + shippingUsd + vatUsd) * 100) / 100;

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (contact.name.trim().length < 2) return t("auth.genericError");
      if (!/.+@.+\..+/.test(contact.email)) return "Email is not valid";
      const phone = contact.phone.replace(/[\s.-]/g, "");
      if (!/^(\+855|0)[1-9]\d{7,8}$/.test(phone)) return "Phone must be a Cambodian number (e.g. 012 345 678)";
    }
    if (current === 1 && shipping.line1.trim().length < 3) return "Street address is required";
    return null;
  }

  function next() {
    const problem = validateStep(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(3, s + 1));
  }

  async function placeOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.qty,
          })),
          contact: contact,
          shipping: shipping,
          paymentOption,
        }),
      });
      const data = (await res.json()) as
        | { mode: "demo"; redirectUrl: string; tranId: string }
        | { mode: "payway"; action: string; fields: Record<string, string>; tranId: string }
        | { error: string; code?: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Checkout failed");
        setSubmitting(false);
        return;
      }

      clear();
      if (data.mode === "demo") {
        router.push(data.redirectUrl);
        return;
      }
      // Hosted checkout: auto-submit the signed multipart form to PayWay.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.action;
      form.enctype = "multipart/form-data";
      form.style.display = "none";
      for (const [key, value] of Object.entries(data.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="card-solid mx-auto max-w-md p-10 text-center">
        <p className="text-sm text-ink-soft">{t("checkout.emptyCart")}</p>
        <a href="/shop" className="btn-solid mt-6">
          {t("cart.emptyCta")}
        </a>
      </div>
    );
  }

  const stepLabels = STEP_KEYS.map((k) => t(`checkout.${k}`));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        {/* Step indicator */}
        <ol className="mb-8 flex flex-wrap items-center gap-2 text-xs">
          {stepLabels.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-colors",
                  i === step && "bg-ink text-cream",
                  i < step && "bg-sage/40 text-ink hover:bg-sage/60",
                  i > step && "bg-ink/5 text-ink-soft",
                )}
              >
                <span>{i + 1}</span> {label}
              </button>
              {i < stepLabels.length - 1 && <span className="text-ink/25">→</span>}
            </li>
          ))}
        </ol>

        {canceled && (
          <div className="mb-6 rounded-xl border border-rose/40 bg-rose/10 p-4 text-sm text-ink">
            {t("checkout.canceledNote")}
          </div>
        )}

        {/* Step 1 — Contact */}
        {step === 0 && (
          <section className="card-solid space-y-4 p-6">
            <h2 className="font-serif text-xl">{t("checkout.stepContact")}</h2>
            <div>
              <label className="label" htmlFor="co-name">{t("checkout.fullName")}</label>
              <input id="co-name" className="input" autoComplete="name" value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="co-email">{t("checkout.email")}</label>
                <input id="co-email" type="email" className="input" autoComplete="email" value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="co-phone">{t("checkout.phone")}</label>
                <input id="co-phone" type="tel" inputMode="tel" placeholder={t("checkout.phoneHint")} className="input" autoComplete="tel" value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
            </div>
          </section>
        )}

        {/* Step 2 — Shipping */}
        {step === 1 && (
          <section className="card-solid space-y-4 p-6">
            <h2 className="font-serif text-xl">{t("checkout.stepShipping")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="co-province">{t("checkout.province")}</label>
                <select id="co-province" className="input" value={shipping.province}
                  onChange={(e) => setShipping({ ...shipping, province: e.target.value })}>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="co-city">{t("checkout.city")}</label>
                <input id="co-city" className="input" placeholder="e.g. Chamkarmon" value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="co-line1">{t("checkout.address1")}</label>
              <input id="co-line1" className="input" autoComplete="street-address" value={shipping.line1}
                onChange={(e) => setShipping({ ...shipping, line1: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="co-line2">{t("checkout.address2")}</label>
              <input id="co-line2" className="input" value={shipping.line2}
                onChange={(e) => setShipping({ ...shipping, line2: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="co-notes">{t("checkout.notes")}</label>
              <textarea id="co-notes" rows={2} className="input" value={shipping.notes}
                onChange={(e) => setShipping({ ...shipping, notes: e.target.value })} />
            </div>
          </section>
        )}

        {/* Step 3 — Payment */}
        {step === 2 && (
          <section className="card-solid space-y-4 p-6">
            <h2 className="font-serif text-xl">{t("checkout.paymentLabel")}</h2>
            {[
              { id: "abapay_khqr", title: t("checkout.payAbapay"), desc: t("checkout.payAbapayDesc") },
              { id: "cards", title: t("checkout.payCards"), desc: t("checkout.payCardsDesc") },
              { id: "choose", title: t("checkout.payChoose"), desc: t("checkout.payChooseDesc") },
            ].map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  paymentOption === opt.id ? "border-ink bg-ink/[0.03]" : "border-ink/15 hover:border-ink/40",
                )}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  className="mt-1 accent-ink"
                  checked={paymentOption === opt.id}
                  onChange={() => setPaymentOption(opt.id as typeof paymentOption)}
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{opt.title}</span>
                  <span className="block text-xs text-ink-soft">{opt.desc}</span>
                </span>
              </label>
            ))}
            <p className="text-xs text-ink-soft">
              {paywayReady
                ? t("checkout.secureNote")
                : "⚠ Sandbox/demo mode — no live PayWay merchant configured on this deployment."}
            </p>
          </section>
        )}

        {/* Step 4 — Review */}
        {step === 3 && (
          <section className="card-solid space-y-5 p-6">
            <h2 className="font-serif text-xl">{t("checkout.stepReview")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="label">{t("checkout.contactInfo")}</p>
                <p className="text-sm text-ink">
                  {contact.name}
                  <br />
                  {contact.email}
                  <br />
                  {contact.phone}
                </p>
              </div>
              <div>
                <p className="label">{t("checkout.shippingInfo")}</p>
                <p className="text-sm text-ink">
                  {shipping.line1}
                  {shipping.line2 ? `, ${shipping.line2}` : ""}
                  <br />
                  {shipping.city ? `${shipping.city}, ` : ""}
                  {shipping.province}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="text-xs font-medium text-ink-soft underline underline-offset-4" onClick={() => setStep(0)}>
                {t("checkout.edit")}
              </button>
            </div>
            {error && <p className="text-sm text-rose-deep">{error}</p>}
            <button type="button" onClick={placeOrder} disabled={submitting} className="btn-solid w-full py-4 text-base">
              {submitting ? t("common.loading") : `${t("checkout.placeOrder")} · ${formatUsd(totalUsd)}`}
            </button>
          </section>
        )}

        {error && step < 3 && <p className="mt-4 text-sm text-rose-deep">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
            className="text-sm text-ink-soft hover:text-ink"
          >
            ← {t("checkout.back")}
          </button>
          {step < 3 && (
            <button type="button" onClick={next} className="btn-solid">
              {t("checkout.continue")}
            </button>
          )}
        </div>
      </div>

      {/* Order summary — SOLID */}
      <aside className="h-fit lg:sticky lg:top-28">
        <div className="card-solid p-6">
          <h2 className="mb-4 font-serif text-xl">{t("checkout.orderSummary")}</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={`${i.productId}-${i.variantId ?? "base"}`} className="flex items-center gap-3">
                <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-cream">
                  <Image src={i.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{i.name}</span>
                  <span className="block text-xs text-ink-soft">
                    {i.variantName ? `${i.variantName} · ` : ""}× {i.qty}
                  </span>
                </span>
                <span className="text-sm font-semibold">{formatUsd(i.priceUsd * i.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t("checkout.subtotal")}</dt>
              <dd>{formatUsd(subtotalUsd)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t("checkout.shippingLabel")}</dt>
              <dd>{shippingUsd === 0 ? t("common.free") : formatUsd(shippingUsd)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t("checkout.vat")}</dt>
              <dd>{formatUsd(vatUsd)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3">
              <dt className="font-semibold">{t("checkout.total")}</dt>
              <dd className="text-right">
                <span className="font-serif text-xl">{formatUsd(totalUsd)}</span>
                <span className="block text-xs text-ink-soft">
                  {formatKhr(usdToKhr(totalUsd))} · {formatDual(totalUsd).split("·")[1]?.trim()}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
