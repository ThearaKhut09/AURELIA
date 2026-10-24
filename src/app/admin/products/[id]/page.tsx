import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm, VariantManager } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl">Edit — {product.name}</h2>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          ingredients: product.ingredients,
          howToUse: product.howToUse,
          category: product.category,
          skinTypes: product.skinTypes,
          concerns: product.concerns,
          images: (Array.isArray(product.images) ? (product.images as string[]) : []).join("\n"),
          basePriceUsd: Number(product.basePriceUsd),
          compareAtUsd: product.compareAtUsd ? Number(product.compareAtUsd) : null,
          stock: product.stock,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            priceUsd: Number(v.priceUsd),
            stock: v.stock,
          })),
        }}
      />
      <VariantManager
        productId={product.id}
        variants={product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          priceUsd: Number(v.priceUsd),
          stock: v.stock,
        }))}
      />
    </div>
  );
}
