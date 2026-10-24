import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { formatUsd } from "@/lib/currency";
import {
  AddressManager,
  ProfileForm,
  SignOutButton,
} from "@/components/account-client";
import { OrderStatusBadge } from "@/components/order-status-badge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const { t } = await getT();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: true },
      },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-36">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("account.title")}</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">
            {t("account.welcome")}, {user.name ?? user.email}
          </h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <ProfileForm name={user.name ?? ""} phone={user.phone ?? ""} />
          <AddressManager
            addresses={user.addresses.map((a) => ({
              id: a.id,
              label: a.label,
              line1: a.line1,
              line2: a.line2,
              city: a.city,
              province: a.province,
              phone: a.phone,
              isDefault: a.isDefault,
            }))}
          />
        </div>

        <div>
          <div className="card-solid p-6">
            <h2 className="mb-4 font-serif text-xl">{t("account.orders")}</h2>
            {user.orders.length === 0 ? (
              <p className="text-sm text-ink-soft">{t("account.noOrders")}</p>
            ) : (
              <ul className="space-y-4">
                {user.orders.map((order) => (
                  <li key={order.id} className="rounded-xl border border-ink/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm font-semibold text-ink">{order.tranId}</p>
                        <p className="text-xs text-ink-soft">
                          {order.createdAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          · {order.items.reduce((s, i) => s + i.quantity, 0)} {t("account.items").toLowerCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatUsd(Number(order.totalUsd))}</span>
                        <OrderStatusBadge
                          status={order.status}
                          paymentStatus={order.paymentStatus}
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">
                      {order.items.map((i) => `${i.name}${i.variantName ? ` (${i.variantName})` : ""} ×${i.quantity}`).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
