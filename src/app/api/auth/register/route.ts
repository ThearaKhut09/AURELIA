import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(8).max(100),
  phone: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v ? v.replace(/[\s.-]/g, "") : undefined)),
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
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  await db.user.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: "CUSTOMER",
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
