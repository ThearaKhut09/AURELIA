import { cn } from "@/lib/utils";

// Server-safe order status pill.
export function OrderStatusBadge({
  status,
  paymentStatus,
}: {
  status: string;
  paymentStatus: string;
}) {
  const failed = paymentStatus === "FAILED";
  const tone =
    status === "DELIVERED"
      ? "bg-sage/40 text-ink"
      : status === "SHIPPED"
        ? "bg-gold/30 text-ink"
        : status === "PAID"
          ? "bg-ink text-cream"
          : failed
            ? "bg-rose/30 text-ink"
            : status === "CANCELLED"
              ? "bg-rose/20 text-ink-soft"
              : "bg-ink/5 text-ink-soft";

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", tone)}>
      {status === "PENDING" && failed ? "FAILED" : status}
    </span>
  );
}
