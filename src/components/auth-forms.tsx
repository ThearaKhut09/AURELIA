"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useT } from "@/components/locale-provider";

export function LoginForm() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError(t("auth.invalid"));
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card-solid w-full max-w-md space-y-4 p-8">
      <div>
        <h1 className="font-serif text-3xl text-ink">{t("auth.loginTitle")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("auth.loginSubtitle")}</p>
      </div>
      <div>
        <label className="label" htmlFor="login-email">{t("auth.email")}</label>
        <input id="login-email" type="email" required autoComplete="email" className="input"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="login-password">{t("auth.password")}</label>
        <input id="login-password" type="password" required autoComplete="current-password" className="input"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-rose-deep">{error}</p>}
      <button type="submit" disabled={loading} className="btn-solid w-full">
        {loading ? t("common.loading") : t("auth.signIn")}
      </button>
      <p className="text-sm text-ink-soft">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-ink underline underline-offset-4">
          {t("auth.signUp")}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const { t } = useT();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error === "Email already registered" ? "Email already registered." : t("auth.genericError"));
      setLoading(false);
      return;
    }
    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card-solid w-full max-w-md space-y-4 p-8">
      <div>
        <h1 className="font-serif text-3xl text-ink">{t("auth.registerTitle")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("auth.registerSubtitle")}</p>
      </div>
      <div>
        <label className="label" htmlFor="reg-name">{t("auth.name")}</label>
        <input id="reg-name" required autoComplete="name" className="input" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="reg-email">{t("auth.email")}</label>
        <input id="reg-email" type="email" required autoComplete="email" className="input" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="reg-password">{t("auth.password")}</label>
          <input id="reg-password" type="password" required minLength={8} autoComplete="new-password" className="input"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <p className="mt-1 text-xs text-ink-soft">{t("auth.passwordHint")}</p>
        </div>
        <div>
          <label className="label" htmlFor="reg-phone">{t("auth.phone")}</label>
          <input id="reg-phone" type="tel" className="input" placeholder="012 345 678" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      {error && <p className="text-sm text-rose-deep">{error}</p>}
      <button type="submit" disabled={loading} className="btn-solid w-full">
        {loading ? t("common.loading") : t("auth.signUp")}
      </button>
      <p className="text-sm text-ink-soft">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
          {t("auth.signIn")}
        </Link>
      </p>
    </form>
  );
}
