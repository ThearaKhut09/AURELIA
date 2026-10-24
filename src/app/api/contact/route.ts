import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  message: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  // Stored for the team; wire to Resend or a support inbox as needed.
  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {},
    create: { email: parsed.data.email.toLowerCase() },
  }).catch(() => {});
  console.log(`[contact] ${parsed.data.name} <${parsed.data.email}>: ${parsed.data.message}`);
  return NextResponse.json({ ok: true });
}
