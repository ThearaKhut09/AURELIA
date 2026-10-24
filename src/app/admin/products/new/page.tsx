import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl">New product</h2>
      <ProductForm />
    </div>
  );
}
