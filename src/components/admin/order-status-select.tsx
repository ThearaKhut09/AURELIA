"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderStatusSelect({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs"
      onChange={(e) => {
        const next = e.target.value as (typeof STATUSES)[number];
        startTransition(async () => {
          await updateOrderStatus(orderId, {
            status: next,
            // Fulfilment to PAID implies payment confirmed (manual reconciliation)
            paymentStatus: next === "PAID" ? "PAID" : undefined,
          });
          router.refresh();
        });
      }}
      aria-label="Order status"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s === "PENDING" && paymentStatus === "FAILED" ? "FAILED (payment)" : s}
        </option>
      ))}
    </select>
  );
}
