import { NextResponse } from "next/server";
import { syncOrderPaymentStatus } from "@/lib/orders";

export const runtime = "nodejs";

// GET /api/orders/status?tran_id=... — used by the success page poller.
// Syncs against the PayWay Check Transaction API when still pending.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tranId = searchParams.get("tran_id") ?? "";
  if (!tranId) {
    return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
  }
  try {
    const paymentStatus = await syncOrderPaymentStatus(tranId);
    return NextResponse.json({ paymentStatus });
  } catch (error) {
    console.error("[orders/status] sync failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
