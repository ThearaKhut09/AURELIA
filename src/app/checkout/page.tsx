import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VAT_RATE } from "@/lib/checkout-server";
import { paywayConfigured } from "@/lib/payway";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; tran_id?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getT();
  const session = await getServerSession(authOptions);

  let address = null;
  if (session?.user?.id) {
    const dbAddress = await db.address.findFirst({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    if (dbAddress) {
      address = {
        line1: dbAddress.line1,
        line2: dbAddress.line2 ?? "",
        city: dbAddress.city ?? "",
        province: dbAddress.province,
        phone: dbAddress.phone,
      };
    }
  }

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-28 sm:px-8 md:pt-32">
      <header className="mb-8">
        <p className="eyebrow">AURELIA</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">{t("checkout.title")}</h1>
      </header>

      <CheckoutForm
        prefill={{
          name: session?.user?.name,
          email: session?.user?.email,
          phone: null,
          address,
        }}
        vatRate={VAT_RATE}
        canceled={sp.canceled === "1"}
        paywayReady={paywayConfigured()}
      />
    </div>
  );
}
