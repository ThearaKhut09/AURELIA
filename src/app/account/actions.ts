"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  return session.user.id;
}

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid data" };
  await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });
  revalidatePath("/account");
  return { ok: true as const };
}

const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().max(40).optional().or(z.literal("")),
  line1: z.string().min(3).max(160),
  line2: z.string().max(160).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  province: z.string().min(2).max(40),
  phone: z.string().min(6).max(20),
  isDefault: z.boolean().optional(),
});

export async function saveAddress(input: z.infer<typeof addressSchema>) {
  const userId = await requireUserId();
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid address" };
  const data = parsed.data;

  if (data.isDefault) {
    await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  if (data.id) {
    const existing = await db.address.findFirst({ where: { id: data.id, userId } });
    if (!existing) return { ok: false as const, error: "Not found" };
    await db.address.update({
      where: { id: data.id },
      data: {
        label: data.label || null,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city || null,
        province: data.province,
        phone: data.phone,
        isDefault: data.isDefault ?? false,
      },
    });
  } else {
    const count = await db.address.count({ where: { userId } });
    await db.address.create({
      data: {
        userId,
        label: data.label || null,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city || null,
        province: data.province,
        phone: data.phone,
        isDefault: data.isDefault ?? count === 0,
      },
    });
  }
  revalidatePath("/account");
  return { ok: true as const };
}

export async function setDefaultAddress(id: string) {
  const userId = await requireUserId();
  const existing = await db.address.findFirst({ where: { id, userId } });
  if (!existing) return { ok: false as const };
  await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await db.address.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/account");
  return { ok: true as const };
}

export async function deleteAddress(id: string) {
  const userId = await requireUserId();
  await db.address.deleteMany({ where: { id, userId } });
  revalidatePath("/account");
  return { ok: true as const };
}
