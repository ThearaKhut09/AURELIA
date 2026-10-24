"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/locale-provider";

export type SuccessOrder = {
  tranId: string;
  paymentStatus: string;
  status: string;
  totalUsd: number;
  totalKhrDisplay: string;
  items: Array<{ name: string; variantName: string | null; quantity: number }>;
};

// Polls /api/orders/status (backed by the PayWay Check Transaction API)
// while payment is pending, then flips to confirmed automatically.
export function SuccessClient({ initial }: { initial: SuccessOrder }) {
  const { t } = useT();
  const router = useRouter();
  const [order, setOrder] = useState(initial);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order.paymentStatus !== "PENDING") return;
    let cancelled = false;
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders/status?tran_id=${encodeURIComponent(order.tranId)}`);
        if (res.ok) {
          const data = (await res.json()) as { paymentStatus: string };
          if (!cancelled && data.paymentStatus && data.paymentStatus !== order.paymentStatus) {
            setOrder((o) => ({ ...o, paymentStatus: data.paymentStatus }));
            router.refresh();
          }
        }
      } catch {
        /* keep polling */
      }
      if (attempts >= 24 && !cancelled) clearInterval(timer);
    }, 3500);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [order.paymentStatus, order.tranId, router]);

  async function retryPayment() {
    setRetrying(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tranId: order.tranId }),
      });
      const data = (await res.json()) as
        | { mode: "demo"; redirectUrl: string }
        | { mode: "payway"; action: string; fields: Record<string, string> }
        | { error: string };
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Could not start payment");
        setRetrying(false);
        return;
      }
      if (data.mode === "demo") {
        router.push(data.redirectUrl);
        return;
      }
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
      setRetrying(false);
    }
  }

  const paid = order.paymentStatus === "PAID";
  const failed = order.paymentStatus === "FAILED";

  return (
    <div className="mx-auto max-w-xl text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
          paid ? "bg-sage/40 text-ink" : failed ? "bg-rose/30 text-ink" : "bg-ink/5 text-ink-soft"
        }`}
        aria-hidden="true"
      >
        {paid ? "✓" : failed ? "✕" : "⏳"}
      </div>
      <h1 className="mt-6 font-serif text-4xl text-ink">{t("success.title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("success.orderNo")} <span className="font-mono font-semibold text-ink">{order.tranId}</span>
      </p>

      <div className="card-solid mt-8 p-6 text-left">
        <ul className="space-y-2 text-sm">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3">
              <span className="text-ink">
                {i.name}
                {i.variantName ? ` — ${i.variantName}` : ""} × {i.quantity}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-ink/10 pt-3 text-right font-serif text-xl">
          ${order.totalUsd.toFixed(2)} USD · {order.totalKhrDisplay}
        </p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        {paid
          ? t("success.paid")
          : failed
            ? t("success.failed")
            : order.paymentStatus === "PENDING"
              ? `${t("success.pending")} ${t("success.processing")}`
              : t("success.failed")}
      </p>

      {order.paymentStatus === "PENDING" && (
        <button type="button" onClick={retryPayment} disabled={retrying} className="btn-solid mt-6">
          {retrying ? t("common.loading") : t("success.retry")}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/account" className="btn-outline">
          {t("success.viewOrders")}
        </a>
        <a href="/shop" className="btn-outline">
          {t("success.continue")}
        </a>
      </div>
    </div>
  );
}
