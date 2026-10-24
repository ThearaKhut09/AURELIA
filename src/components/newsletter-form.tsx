"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function NewsletterForm() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="text-sm font-medium text-sage-deep">{t("home.newsletterSuccess")}</p>;
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("home.newsletterPlaceholder")}
        aria-label={t("home.newsletterPlaceholder")}
        className="w-full flex-1 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/10"
      />
      <button type="submit" disabled={state === "loading"} className="btn-solid shrink-0">
        {t("home.newsletterCta")}
      </button>
      {state === "error" && (
        <p className="text-xs text-rose-deep sm:hidden">{t("home.newsletterError")}</p>
      )}
    </form>
  );
}
