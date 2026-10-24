import Link from "next/link";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl">Orders ({orders.length})</h2>

      <div className="card-solid overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-ink-soft">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfilment</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    {o.tranId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">
                  {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3">
                  {o.contactName}
                  <span className="block text-xs text-ink-soft">{o.contactPhone}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{formatUsd(Number(o.totalUsd))}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      o.paymentStatus === "PAID"
                        ? "bg-sage/40 text-ink"
                        : o.paymentStatus === "FAILED"
                          ? "bg-rose/30 text-ink"
                          : "bg-ink/5 text-ink-soft"
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect
                    orderId={o.id}
                    status={o.status}
                    paymentStatus={o.paymentStatus}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="text-xs underline underline-offset-2">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
