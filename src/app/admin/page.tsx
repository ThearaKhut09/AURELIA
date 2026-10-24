import Link from "next/link";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatUsd } from "@/lib/currency";
import { OrderStatusBadge } from "@/components/order-status-badge";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [revenueAgg, ordersCount, paidCount, productCount, customerCount, topItems, recent] =
    await Promise.all([
      db.order.aggregate({
        _sum: { totalUsd: true },
        where: { paymentStatus: "PAID" },
      }),
      db.order.count(),
      db.order.count({ where: { paymentStatus: "PAID" } }),
      db.product.count({ where: { isActive: true } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.orderItem.groupBy({
        by: ["productId", "name"],
        _sum: { quantity: true },
        where: { order: { paymentStatus: "PAID" } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
    ]);

  const revenue30 = await db.order.aggregate({
    _sum: { totalUsd: true },
    where: { paymentStatus: "PAID", createdAt: { gte: monthAgo } },
  });

  const stats = [
    { label: "Revenue (all time)", value: formatUsd(Number(revenueAgg._sum.totalUsd ?? 0)) },
    { label: "Revenue (30 days)", value: formatUsd(Number(revenue30._sum.totalUsd ?? 0)) },
    { label: "Orders", value: String(ordersCount) },
    { label: "Paid orders", value: String(paidCount) },
    { label: "Active products", value: String(productCount) },
    { label: "Customers", value: String(customerCount) },
  ];

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-solid p-5">
            <p className="text-xs uppercase tracking-wider text-ink-soft">{s.label}</p>
            <p className="mt-2 font-serif text-2xl text-ink">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="card-solid p-6">
          <h2 className="mb-4 font-serif text-xl">Top products (paid orders)</h2>
          {topItems.length === 0 ? (
            <p className="text-sm text-ink-soft">No paid orders yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topItems.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-ink">{item.name}</span>
                  <span className="font-semibold">{item._sum.quantity ?? 0} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-solid p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-sage-deep hover:text-ink">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-soft">No orders yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recent.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3">
                  <Link href={`/admin/orders/${order.id}`} className="min-w-0 truncate font-mono text-xs text-ink hover:underline">
                    {order.tranId}
                  </Link>
                  <span className="whitespace-nowrap">{formatUsd(Number(order.totalUsd))}</span>
                  <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
