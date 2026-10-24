import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { verifyPushback } from "@/lib/payway";
import { markOrderPaid } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * PayWay pushback receiver — this is the API-level `return_url`.
 * PayWay POSTs application/json: { tran_id, apv, status, return_params }
 * and signs the body with an HMAC-SHA512 (base64) in the
 * `X-PayWay-HMAC-SHA512` header. status "0" means success.
 *
 * Idempotent: marking an already-paid order is a no-op.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries()) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature =
    req.headers.get("x-payway-hmac-sha512") ?? req.headers.get("X-PayWay-HMAC-SHA512");

  if (!verifyPushback(body, signature)) {
    console.error(
      "[payway-webhook] signature verification FAILED — keys:",
      Object.keys(body).join(","),
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const tranId = String(body.tran_id ?? "");
  const status = String(body.status ?? "");
  const apv = body.apv ? String(body.apv) : undefined;
  if (!tranId) {
    return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { tranId }, include: { items: true } });
  if (!order) {
    console.error(`[payway-webhook] unknown tran_id ${tranId} — acking to stop retries`);
    return NextResponse.json({ received: true });
  }

  if (status === "0") {
    const result = await markOrderPaid(tranId, {
      provider: "payway",
      apv,
      raw: body,
    });
    if (result.ok && !result.alreadyPaid) {
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
    }
  } else {
    // DECLINED / CANCELLED pushback
    await db.order.updateMany({
      where: { tranId, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" },
    });
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "payway",
        tranId,
        amountUsd: order.totalUsd,
        status: status === "" ? "DECLINED" : `STATUS_${status}`,
        rawResponse: body as Prisma.InputJsonValue,
      },
    });
  }

  return NextResponse.json({ received: true });
}
