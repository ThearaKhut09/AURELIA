import type { Metadata } from "next";
import { ShopView, type ShopSearchParams } from "@/components/shop-view";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("nav.skincare") };
}

export default async function SkincarePage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp = await searchParams;
  const { t } = await getT();
  return (
    <ShopView
      title={t("home.collectionSkincare")}
      subtitle={t("home.collectionSkincareDesc")}
      defaultCategory="skincare"
      searchParams={sp}
    />
  );
}
