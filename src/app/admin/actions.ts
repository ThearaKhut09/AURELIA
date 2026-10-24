"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().max(90).optional().or(z.literal("")),
  description: z.string().min(10).max(3000),
  ingredients: z.string().max(2000).default(""),
  howToUse: z.string().max(2000).default(""),
  category: z.enum(["skincare", "fragrance", "rituals"]),
  skinTypes: z.string().max(120).default(""),
  concerns: z.string().max(120).default(""),
  images: z.string().max(2000).default(""), // newline/comma-separated URLs
  basePriceUsd: z.number().min(0.5).max(10000),
  compareAtUsd: z.number().min(0).max(10000).nullable().optional(),
  stock: z.number().int().min(0).max(100000),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const variantSchema = z.object({
  name: z.string().min(1).max(40),
  sku: z.string().min(2).max(40),
  priceUsd: z.number().min(0.5).max(10000),
  stock: z.number().int().min(0).max(100000),
});

function parseImages(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProduct(input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid product data" };
  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  const exists = await db.product.findUnique({ where: { slug } });
  if (exists) return { ok: false as const, error: "Slug already exists" };

  const product = await db.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      ingredients: data.ingredients,
      howToUse: data.howToUse,
      category: data.category,
      skinTypes: data.skinTypes.replace(/\s*,\s*/g, ","),
      concerns: data.concerns.replace(/\s*,\s*/g, ","),
      images: parseImages(data.images),
      basePriceUsd: data.basePriceUsd,
      compareAtUsd: data.compareAtUsd ?? null,
      stock: data.stock,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true as const, id: product.id };
}

export async function updateProduct(id: string, input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid product data" };
  const data = parsed.data;

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      ingredients: data.ingredients,
      howToUse: data.howToUse,
      category: data.category,
      skinTypes: data.skinTypes.replace(/\s*,\s*/g, ","),
      concerns: data.concerns.replace(/\s*,\s*/g, ","),
      images: parseImages(data.images),
      basePriceUsd: data.basePriceUsd,
      compareAtUsd: data.compareAtUsd ?? null,
      stock: data.stock,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const items = await db.orderItem.count({ where: { productId: id } });
  if (items > 0) {
    // Has order history — deactivate instead of deleting.
    await db.product.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/products");
    return { ok: true as const, deactivated: true };
  }
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true as const, deactivated: false };
}

export async function addVariant(productId: string, input: unknown) {
  await requireAdmin();
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid variant data" };
  const data = parsed.data;
  try {
    await db.variant.create({
      data: {
        productId,
        name: data.name,
        sku: data.sku,
        priceUsd: data.priceUsd,
        stock: data.stock,
      },
    });
  } catch {
    return { ok: false as const, error: "SKU already exists" };
  }
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function removeVariant(variantId: string) {
  await requireAdmin();
  await db.variant.delete({ where: { id: variantId } });
  revalidatePath("/shop");
  return { ok: true as const };
}

const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export async function updateOrderStatus(orderId: string, input: unknown) {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid status" };
  await db.order.update({
    where: { id: orderId },
    data: {
      status: parsed.data.status,
      ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
    },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true as const };
}
