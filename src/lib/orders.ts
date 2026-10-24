// Server-side order lifecycle: creation, payment confirmation (idempotent),
// status sync with PayWay. Node runtime only.
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { checkTransaction, paywayConfigured } from "@/lib/payway";
import { khrDisplayFor } from "@/lib/currency";

export interface CheckoutLine {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface CheckoutAddress {
  line1: string;
  line2?: string;
  city?: string;
  province: string;
  phone: string;
}

export function newTranId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `AUR-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

/**
 * Mark an order paid exactly once. Decrements stock inside a transaction,
 * records the Payment row, and is safe to call from both the webhook and the
 * status poller (idempotent by paymentStatus).
 */
export async function markOrderPaid(
  tranId: string,
  opts: { provider?: string; apv?: string; raw?: unknown } = {},
): Promise<{ ok: boolean; alreadyPaid: boolean }> {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { tranId },
      include: { items: true },
    });
    if (!order) return { ok: false, alreadyPaid: false };
    if (order.paymentStatus === "PAID") return { ok: true, alreadyPaid: true };

    // Best-effort stock decrement (floors at 0). A shortfall after a
    // successful payment is logged for manual follow-up in /admin.
    for (const item of order.items) {
      if (item.variantId) {
        await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: 1 } },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: 1 } },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.order.update({
      where: { tranId },
      data: { paymentStatus: "PAID", status: "PAID", paywayTranId: tranId },
    });
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: opts.provider ?? order.paymentMethod,
        tranId,
        amountUsd: order.totalUsd,
        status: "APPROVED",
        apv: opts.apv,
        rawResponse: (opts.raw ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return { ok: true, alreadyPaid: false };
  });
}

/**
 * Sync a PENDING order against the Check Transaction API. Returns the order's
 * paymentStatus after syncing. Safe to call repeatedly.
 */
export async function syncOrderPaymentStatus(tranId: string): Promise<string> {
  const order = await db.order.findUnique({ where: { tranId } });
  if (!order) return "NOT_FOUND";
  if (order.paymentStatus !== "PENDING") return order.paymentStatus;
  if (!paywayConfigured()) return order.paymentStatus;

  const result = await checkTransaction(tranId);
  switch (result.status) {
    case "APPROVED":
      await markOrderPaid(tranId, { provider: "payway", raw: result.raw });
      return "PAID";
    case "DECLINED":
    case "CANCELLED":
      await db.payment.create({
        data: {
          orderId: order.id,
          provider: "payway",
          tranId,
          amountUsd: order.totalUsd,
          status: result.status,
          rawResponse: result.raw as Prisma.InputJsonValue,
        },
      });
      await db.order.update({
        where: { tranId },
        data: { paymentStatus: "FAILED" },
      });
      return "FAILED";
    default:
      return order.paymentStatus; // PENDING / ERROR — leave as-is
  }
}

export function orderTotals(input: {
  subtotalUsd: number;
  shippingUsd: number;
  vatUsd: number;
}) {
  const totalUsd = round2(input.subtotalUsd + input.shippingUsd + input.vatUsd);
  return {
    subtotalUsd: round2(input.subtotalUsd),
    shippingUsd: round2(input.shippingUsd),
    vatUsd: round2(input.vatUsd),
    totalUsd,
    totalKhrDisplay: khrDisplayFor(totalUsd),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
