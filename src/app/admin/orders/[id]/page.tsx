import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, payments: { orderBy: { createdAt: "desc" } }, user: true },
  });
  if (!order) notFound();

  const address = order.shippingAddress as {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    phone?: string;
    notes?: string;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-mono text-xl font-semibold">{order.tranId}</h2>
          <p className="text-xs text-ink-soft">
            {order.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            {order.user ? ` · account: ${order.user.email}` : " · guest"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          <OrderStatusSelect orderId={order.id} status={order.status} paymentStatus={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="card-solid p-6">
          <h3 className="mb-4 font-serif text-lg">Items</h3>
          <ul className="space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 border-b border-ink/5 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-ink-soft">
                    {item.variantName ? `${item.variantName} · ` : ""}qty {item.quantity} ×{" "}
                    {formatUsd(Number(item.priceUsd))}
                  </p>
                </div>
                <p className="font-semibold">{formatUsd(Number(item.priceUsd) * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatUsd(Number(order.subtotalUsd))}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{formatUsd(Number(order.shippingUsd))}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">VAT</dt><dd>{formatUsd(Number(order.vatUsd))}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatUsd(Number(order.totalUsd))} · {order.totalKhrDisplay}</dd></div>
          </dl>
        </section>

        <div className="space-y-8">
          <section className="card-solid p-6 text-sm">
            <h3 className="mb-4 font-serif text-lg">Customer & shipping</h3>
            <p className="text-ink">
              {order.contactName}
              <br />
              {order.contactEmail}
              <br />
              {order.contactPhone}
            </p>
            <p className="mt-3 text-ink-soft">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city ? `${address.city}, ` : ""}
              {address.province}
              {address.notes ? (
                <>
                  <br />
                  <em>Notes: {address.notes}</em>
                </>
              ) : null}
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              Method: {order.paymentMethod}
              {order.paymentOption ? ` (${order.paymentOption})` : ""}
            </p>
          </section>

          <section className="card-solid p-6 text-sm">
            <h3 className="mb-4 font-serif text-lg">Payments</h3>
            {order.payments.length === 0 ? (
              <p className="text-ink-soft">No payment records yet.</p>
            ) : (
              <ul className="space-y-2">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 border-b border-ink/5 pb-2 last:border-0">
                    <span className="font-mono text-xs">{p.tranId}</span>
                    <span>{p.provider}</span>
                    <span className="font-semibold">{p.status}</span>
                    <span>{formatUsd(Number(p.amountUsd))}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
