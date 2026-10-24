import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email().max(120) });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  try {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: {},
      create: { email: parsed.data.email.toLowerCase() },
    });
  } catch (error) {
    // Newsletter must never hard-fail the UX
    console.error("[newsletter] subscribe failed:", error);
  }
  return NextResponse.json({ ok: true });
}
