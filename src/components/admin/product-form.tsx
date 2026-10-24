"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addVariant,
  createProduct,
  removeVariant,
  updateProduct,
} from "@/app/admin/actions";

export interface AdminProduct {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  ingredients: string;
  howToUse: string;
  category: string;
  skinTypes: string;
  concerns: string;
  images: string; // newline-separated
  basePriceUsd: number;
  compareAtUsd: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  variants?: Array<{ id: string; name: string; sku: string; priceUsd: number; stock: number }>;
}

export function ProductForm({ initial }: { initial?: AdminProduct }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    ingredients: initial?.ingredients ?? "",
    howToUse: initial?.howToUse ?? "",
    category: initial?.category ?? "skincare",
    skinTypes: initial?.skinTypes ?? "",
    concerns: initial?.concerns ?? "",
    images: initial?.images ?? "/products/discovery-set.svg",
    basePriceUsd: initial?.basePriceUsd ?? 24,
    compareAtUsd: initial?.compareAtUsd ?? ("" as number | ""),
    stock: initial?.stock ?? 20,
    isActive: initial?.isActive ?? true,
    isFeatured: initial?.isFeatured ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      basePriceUsd: Number(form.basePriceUsd),
      compareAtUsd:
        form.compareAtUsd === "" || form.compareAtUsd === null
          ? null
          : Number(form.compareAtUsd),
      stock: Number(form.stock),
    };
    startTransition(async () => {
      const res = isEdit && initial?.id
        ? await updateProduct(initial.id, payload)
        : await createProduct(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-2">
      <div className="card-solid space-y-4 p-6">
        <Field label="Name">
          <input className="input" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Slug (optional — from name)">
          <input className="input" value={form.slug} disabled={isEdit}
            onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <Field label="Category">
          <select className="input" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="skincare">skincare</option>
            <option value="fragrance">fragrance</option>
            <option value="rituals">rituals</option>
          </select>
        </Field>
        <Field label="Description">
          <textarea className="input" rows={4} required value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Ingredients">
          <textarea className="input" rows={3} value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
        </Field>
        <Field label="How to use">
          <textarea className="input" rows={3} value={form.howToUse}
            onChange={(e) => setForm({ ...form, howToUse: e.target.value })} />
        </Field>
      </div>

      <div className="card-solid h-fit space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Base price (USD)">
            <input className="input" type="number" step="0.01" min="0.5" required value={form.basePriceUsd}
              onChange={(e) => setForm({ ...form, basePriceUsd: Number(e.target.value) })} />
          </Field>
          <Field label="Compare-at price (optional)">
            <input className="input" type="number" step="0.01" min="0" value={form.compareAtUsd}
              onChange={(e) =>
                setForm({ ...form, compareAtUsd: e.target.value === "" ? "" : Number(e.target.value) })
              } />
          </Field>
          <Field label="Stock">
            <input className="input" type="number" min="0" required value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </Field>
          <Field label="Skin types (comma-sep)">
            <input className="input" placeholder="dry,oily,sensitive" value={form.skinTypes}
              onChange={(e) => setForm({ ...form, skinTypes: e.target.value })} />
          </Field>
        </div>
        <Field label="Concerns (comma-sep)">
          <input className="input" placeholder="hydration,brightening" value={form.concerns}
            onChange={(e) => setForm({ ...form, concerns: e.target.value })} />
        </Field>
        <Field label="Image URLs (one per line — /products/*.svg or Cloudinary/Blob URLs)">
          <textarea className="input" rows={3} value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })} />
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured
          </label>
        </div>

        {error && <p className="text-sm text-rose-deep">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-solid">
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: AdminProduct["variants"];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    e.currentTarget.reset();
    startTransition(async () => {
      const res = await addVariant(productId, {
        name: String(fd.get("name") ?? ""),
        sku: String(fd.get("sku") ?? ""),
        priceUsd: Number(fd.get("priceUsd") ?? 0),
        stock: Number(fd.get("stock") ?? 0),
      });
      if (!res.ok) setError(res.error);
      else setError(null);
      router.refresh();
    });
  }

  return (
    <div className="card-solid p-6">
      <h2 className="mb-4 font-serif text-xl">Variants</h2>
      <ul className="mb-4 space-y-2 text-sm">
        {(variants ?? []).map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 px-3 py-2">
            <span>
              <span className="font-medium">{v.name}</span>
              <span className="ml-2 font-mono text-xs text-ink-soft">{v.sku}</span>
            </span>
            <span className="flex items-center gap-3">
              <span>${v.priceUsd.toFixed(2)} · {v.stock} in stock</span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await removeVariant(v.id);
                    router.refresh();
                  })
                }
                className="text-xs text-rose-deep hover:underline"
              >
                Remove
              </button>
            </span>
          </li>
        ))}
        {(variants ?? []).length === 0 && (
          <li className="text-ink-soft">No variants — product sells at base price / stock.</li>
        )}
      </ul>

      <form onSubmit={add} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <input name="name" required placeholder="50 ml" className="input" />
        <input name="sku" required placeholder="SKU" className="input" />
        <input name="priceUsd" type="number" step="0.01" min="0.5" required placeholder="Price" className="input" />
        <input name="stock" type="number" min="0" required placeholder="Stock" className="input" />
        <button type="submit" disabled={pending} className="btn-solid">Add</button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-deep">{error}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
