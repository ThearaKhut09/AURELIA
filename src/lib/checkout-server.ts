// Server-side checkout pipeline. Prices are ALWAYS recalculated from the DB —
// client-sent prices are never trusted.
import { Prisma, type Order } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { orderTotals, markOrderPaid, newTranId, round2 } from "@/lib/orders";
import {
  PURCHASE_ENDPOINT,
  buildPurchaseFields,
  demoModeEnabled,
  paywayConfigured,
  type PurchaseFields,
} from "@/lib/payway";
import { shippingFor } from "@/lib/shipping";

export const VAT_RATE = (() => {
  const v = Number(process.env.VAT_RATE ?? "0.1");
  return Number.isFinite(v) && v >= 0 && v < 1 ? v : 0.1;
})();

// Cambodian phone: 0XX XXX XXX / +855 XX XXX XXX (spaces stripped first)
const khPhone = z
  .string()
  .transform((s) => s.replace(/[\s.-]/g, ""))
  .pipe(z.string().regex(/^(\+855|0)[1-9]\d{7,8}$/, "Invalid Cambodian phone number"));

export const checkoutInputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).nullable().optional(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  contact: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(80),
    phone: khPhone,
  }),
  shipping: z.object({
    province: z.string().min(2).max(40),
    city: z.string().max(60).optional().default(""),
    line1: z.string().min(3).max(160),
    line2: z.string().max(160).optional().default(""),
    notes: z.string().max(400).optional().default(""),
  }),
  paymentOption: z.enum(["abapay_khqr", "cards", "choose"]).default("choose"),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export class CheckoutError extends Error {
  constructor(
    message: string,
    public code:
      | "PRODUCT_NOT_FOUND"
      | "OUT_OF_STOCK"
      | "PAYWAY_NOT_CONFIGURED"
      | "INVALID",
  ) {
    super(message);
  }
}

export interface CheckoutLineResolved {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  priceUsd: number;
  quantity: number;
  image: string | null;
}

export async function resolveLines(input: CheckoutInput): Promise<{
  lines: CheckoutLineResolved[];
  subtotalUsd: number;
}> {
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: CheckoutLineResolved[] = [];
  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product) throw new CheckoutError("Product not available", "PRODUCT_NOT_FOUND");

    let variant = null;
    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId) ?? null;
      if (!variant) throw new CheckoutError("Variant not available", "PRODUCT_NOT_FOUND");
    }

    const price = variant ? Number(variant.priceUsd) : Number(product.basePriceUsd);
    const available = variant ? variant.stock : product.stock;
    if (available < item.quantity) {
      throw new CheckoutError(
        `Only ${Math.max(available, 0)} left of ${product.name}`,
        "OUT_OF_STOCK",
      );
    }

    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      variantName: variant?.name ?? null,
      priceUsd: price,
      quantity: item.quantity,
      image: (Array.isArray(product.images) ? (product.images as string[]) : [])[0] ?? null,
    });
  }

  const subtotalUsd = round2(lines.reduce((s, l) => s + l.priceUsd * l.quantity, 0));
  return { lines, subtotalUsd };
}

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export async function createOrder(input: CheckoutInput): Promise<OrderWithItems> {
  const session = await getServerSession(authOptions);
  const { lines, subtotalUsd } = await resolveLines(input);
  const shippingUsd = shippingFor(input.shipping.province, subtotalUsd);
  const vatUsd = round2(subtotalUsd * VAT_RATE);
  const totals = orderTotals({ subtotalUsd, shippingUsd, vatUsd });

  return db.order.create({
    data: {
      tranId: newTranId(),
      userId: session?.user?.id ?? null,
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotalUsd: new Prisma.Decimal(totals.subtotalUsd),
      shippingUsd: new Prisma.Decimal(totals.shippingUsd),
      vatUsd: new Prisma.Decimal(totals.vatUsd),
      totalUsd: new Prisma.Decimal(totals.totalUsd),
      totalKhrDisplay: totals.totalKhrDisplay,
      paymentMethod: demoModeEnabled() && !paywayConfigured() ? "demo" : "payway",
      paymentOption: input.paymentOption,
      contactName: input.contact.name,
      contactEmail: input.contact.email,
      contactPhone: input.contact.phone,
      shippingAddress: {
        line1: input.shipping.line1,
        line2: input.shipping.line2 || undefined,
        city: input.shipping.city || undefined,
        province: input.shipping.province,
        phone: input.contact.phone,
        notes: input.shipping.notes || undefined,
      },
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          name: l.name,
          variantName: l.variantName,
          priceUsd: new Prisma.Decimal(l.priceUsd),
          quantity: l.quantity,
          image: l.image,
        })),
      },
    },
    include: { items: true },
  });
}

export type StartPaymentResult =
  | { mode: "demo"; redirectUrl: string }
  | { mode: "payway"; action: string; fields: PurchaseFields };

/**
 * Start payment for a PENDING order: demo-completes when demo mode is on
 * (dev only), otherwise returns the signed PayWay purchase form fields.
 */
export async function startPayment(order: OrderWithItems): Promise<StartPaymentResult> {
  if (demoModeEnabled() && !paywayConfigured()) {
    await markOrderPaid(order.tranId, { provider: "demo", raw: { demo: true } });
    await sendOrderConfirmation({
      tranId: order.tranId,
      contactName: order.contactName,
      contactEmail: order.contactEmail,
      totalUsd: Number(order.totalUsd),
      items: order.items.map((i) => ({
        name: i.name,
        variantName: i.variantName,
        quantity: i.quantity,
        priceUsd: Number(i.priceUsd),
      })),
    });
    return { mode: "demo", redirectUrl: `/checkout/success?tran_id=${order.tranId}` };
  }

  if (!paywayConfigured()) {
    throw new CheckoutError(
      "Payments are not configured yet (PAYWAY_MERCHANT_ID / PAYWAY_API_KEY missing).",
      "PAYWAY_NOT_CONFIGURED",
    );
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const successUrl = new URL(process.env.PAYWAY_SUCCESS_URL ?? `${site}/checkout/success`);
  successUrl.searchParams.set("tran_id", order.tranId);
  const cancelUrl = new URL(process.env.PAYWAY_CANCEL_URL ?? `${site}/checkout?canceled=1`);
  cancelUrl.searchParams.set("tran_id", order.tranId);

  const [firstName, ...rest] = order.contactName.trim().split(/\s+/);
  const fields = buildPurchaseFields({
    tranId: order.tranId,
    amountUsd: Number(order.totalUsd),
    shippingUsd: Number(order.shippingUsd),
    items: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: Number(i.priceUsd),
    })),
    returnUrl: process.env.PAYWAY_RETURN_URL ?? `${site}/api/payway/webhook`,
    cancelUrl: cancelUrl.toString(),
    continueSuccessUrl: successUrl.toString(),
    paymentOption:
      order.paymentOption === "abapay_khqr" || order.paymentOption === "cards"
        ? order.paymentOption
        : undefined,
    customer: {
      firstName,
      lastName: rest.join(" ") || undefined,
      email: order.contactEmail,
      phone: order.contactPhone,
    },
  });

  return { mode: "payway", action: PURCHASE_ENDPOINT, fields };
}
