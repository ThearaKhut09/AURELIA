import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { CheckoutError, startPayment } from "@/lib/checkout-server";

export const runtime = "nodejs";

const schema = z.object({ tranId: z.string().min(4) });

// Retry an unpaid order (customer cancelled the PayWay dialog).
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { tranId: parsed.data.tranId },
    include: { items: true },
  });
  if (!order || order.paymentStatus !== "PENDING") {
    return NextResponse.json({ error: "Order not payable" }, { status: 404 });
  }

  try {
    const payment = await startPayment(order);
    return NextResponse.json({ tranId: order.tranId, ...payment });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("[checkout-retry] failed:", error);
    return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
  }
}
