import { db } from "@/lib/db";
import { formatUsd } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const spendByUser = await db.order.groupBy({
    by: ["userId"],
    _sum: { totalUsd: true },
    where: { paymentStatus: "PAID", userId: { not: null } },
  });
  const spendMap = new Map(spendByUser.map((s) => [s.userId, Number(s._sum.totalUsd ?? 0)]));

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl">Customers ({customers.length})</h2>

      <div className="card-solid overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-ink-soft">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Lifetime spend</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium">{c.name ?? "—"}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">{c._count.orders}</td>
                <td className="px-4 py-3 font-semibold">{formatUsd(spendMap.get(c.id) ?? 0)}</td>
                <td className="px-4 py-3 text-xs text-ink-soft">
                  {c.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
