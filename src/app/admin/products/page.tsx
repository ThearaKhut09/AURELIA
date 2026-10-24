import Link from "next/link";
import { db } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { ToggleActiveButtons } from "@/components/admin/toggle-active";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true, _count: { select: { orderItems: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Products ({products.length})</h2>
        <Link href="/admin/products/new" className="btn-solid">
          + New product
        </Link>
      </div>

      <div className="card-solid overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-ink-soft">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:underline">
                    {p.name}
                  </Link>
                  <span className="block font-mono text-xs text-ink-soft">/{p.slug}</span>
                </td>
                <td className="px-4 py-3 capitalize text-ink-soft">{p.category}</td>
                <td className="px-4 py-3">{formatUsd(Number(p.basePriceUsd))}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.variants.length}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      p.isActive ? "bg-sage/40 text-ink" : "bg-ink/5 text-ink-soft"
                    }`}
                  >
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs">
                    <Link href={`/admin/products/${p.id}`} className="text-ink underline underline-offset-2">
                      Edit
                    </Link>
                    <ToggleActiveButtons id={p.id} isActive={p.isActive} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
