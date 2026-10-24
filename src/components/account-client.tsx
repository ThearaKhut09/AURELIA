"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useT } from "@/components/locale-provider";
import { signOut } from "next-auth/react";
import {
  deleteAddress,
  saveAddress,
  setDefaultAddress,
  updateProfile,
} from "@/app/account/actions";
import { PROVINCES } from "@/lib/shipping";
import type { AddressDTO } from "@/components/account-client-types";

export function SignOutButton() {
  const { t } = useT();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-rose-deep underline-offset-4 hover:underline"
    >
      {t("account.signOut")}
    </button>
  );
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const { t } = useT();
  const router = useRouter();
  const [form, setForm] = useState({ name, phone });
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfile(form);
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={submit} className="card-solid space-y-4 p-6">
      <h2 className="font-serif text-xl">{t("account.profile")}</h2>
      <div>
        <label className="label" htmlFor="acc-name">{t("account.name")}</label>
        <input id="acc-name" className="input" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="acc-phone">Phone</label>
        <input id="acc-phone" className="input" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <button type="submit" disabled={pending} className="btn-solid">
        {saved ? t("account.saved") : t("account.updateProfile")}
      </button>
    </form>
  );
}

export function AddressManager({ addresses }: { addresses: AddressDTO[] }) {
  const { t } = useT();
  const router = useRouter();
  const [editing, setEditing] = useState<AddressDTO | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveAddress({
        id: editing && editing !== "new" ? editing.id : undefined,
        label: String(fd.get("label") ?? ""),
        line1: String(fd.get("line1") ?? ""),
        line2: String(fd.get("line2") ?? ""),
        city: String(fd.get("city") ?? ""),
        province: String(fd.get("province") ?? "Phnom Penh"),
        phone: String(fd.get("phone") ?? ""),
        isDefault: fd.get("isDefault") === "on",
      });
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <div className="card-solid p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl">{t("account.addresses")}</h2>
        <button type="button" onClick={() => setEditing("new")} className="text-sm font-semibold text-sage-deep hover:text-ink">
          + {t("account.addAddress")}
        </button>
      </div>

      {editing && (
        <form onSubmit={onSubmit} className="mb-6 space-y-3 rounded-xl border border-ink/10 bg-cream/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ad-label">{t("account.label")}</label>
              <input id="ad-label" name="label" className="input" defaultValue={editing !== "new" ? editing.label ?? "" : ""} />
            </div>
            <div>
              <label className="label" htmlFor="ad-phone">{t("account.phone")}</label>
              <input id="ad-phone" name="phone" required className="input" defaultValue={editing !== "new" ? editing.phone : ""} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="ad-line1">{t("account.line1")}</label>
            <input id="ad-line1" name="line1" required className="input" defaultValue={editing !== "new" ? editing.line1 : ""} />
          </div>
          <div>
            <label className="label" htmlFor="ad-line2">{t("account.line2")}</label>
            <input id="ad-line2" name="line2" className="input" defaultValue={editing !== "new" ? editing.line2 ?? "" : ""} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ad-city">{t("account.city")}</label>
              <input id="ad-city" name="city" className="input" defaultValue={editing !== "new" ? editing.city ?? "" : ""} />
            </div>
            <div>
              <label className="label" htmlFor="ad-province">{t("account.province")}</label>
              <select id="ad-province" name="province" className="input" defaultValue={editing !== "new" ? editing.province : "Phnom Penh"}>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="isDefault" defaultChecked={editing !== "new" ? editing.isDefault : addresses.length === 0} />
            {t("account.setDefault")}
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="btn-solid">{t("account.save")}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">{t("checkout.back")}</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !editing && (
        <p className="text-sm text-ink-soft">{t("account.addAddress")} →</p>
      )}

      <ul className="space-y-3">
        {addresses.map((a) => (
          <li key={a.id} className="rounded-xl border border-ink/10 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">
                  {a.label || t("account.addresses")}
                  {a.isDefault && (
                    <span className="ml-2 rounded-full bg-sage/40 px-2 py-0.5 text-[11px] font-semibold">
                      {t("account.default")}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-ink-soft">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}
                  {a.city ? `, ${a.city}` : ""}, {a.province} · {a.phone}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                <button type="button" onClick={() => setEditing(a)} className="text-ink-soft underline underline-offset-2 hover:text-ink">
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await setDefaultAddress(a.id);
                        router.refresh();
                      })
                    }
                    className="text-ink-soft underline underline-offset-2 hover:text-ink"
                  >
                    {t("account.setDefault")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(t("account.delete") + "?")) {
                      startTransition(async () => {
                        await deleteAddress(a.id);
                        router.refresh();
                      });
                    }
                  }}
                  className="text-rose-deep underline underline-offset-2 hover:text-rose"
                >
                  {t("account.delete")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
