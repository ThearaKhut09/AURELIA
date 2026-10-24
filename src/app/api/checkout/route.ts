import { NextResponse } from "next/server";
import {
  CheckoutError,
  checkoutInputSchema,
  createOrder,
  startPayment,
} from "@/lib/checkout-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    // Prices and stock are re-validated server-side inside createOrder.
    const order = await createOrder(parsed.data);
    const payment = await startPayment(order);
    return NextResponse.json({ tranId: order.tranId, ...payment });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === "OUT_OF_STOCK" || error.code === "PRODUCT_NOT_FOUND" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[checkout] failed:", error);
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
