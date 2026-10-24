import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SuccessClient } from "@/components/success-client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tran_id?: string }>;
}) {
  const { tran_id: tranId } = await searchParams;
  if (!tranId) notFound();

  const order = await db.order.findUnique({
    where: { tranId },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-32 sm:px-8 md:pt-40">
      <SuccessClient
        initial={{
          tranId: order.tranId,
          paymentStatus: order.paymentStatus,
          status: order.status,
          totalUsd: Number(order.totalUsd),
          totalKhrDisplay: order.totalKhrDisplay,
          items: order.items.map((i) => ({
            name: i.name,
            variantName: i.variantName,
            quantity: i.quantity,
          })),
        }}
      />
    </div>
  );
}
