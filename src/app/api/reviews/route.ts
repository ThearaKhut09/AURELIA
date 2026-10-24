import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  productId: z.string().min(1),
  author: z.string().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
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
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true },
  });
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 404 });

  // Reviews publish immediately; flip isApproved to false + moderate in
  // /admin if spam becomes a problem.
  await db.review.create({
    data: {
      productId: parsed.data.productId,
      author: parsed.data.author,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      isApproved: true,
    },
  });
  return NextResponse.json({ ok: true });
}
