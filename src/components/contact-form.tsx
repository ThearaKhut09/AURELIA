"use client";

import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setState("done");
      } else setState("error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="card-solid p-6 text-sm text-sage-deep">
        Thank you — we reply within one business day.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="card-solid space-y-4 p-6">
      <div>
        <label className="label" htmlFor="c-name">Name</label>
        <input
          id="c-name" required className="input" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="c-email">Email</label>
        <input
          id="c-email" type="email" required className="input" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="label" htmlFor="c-message">Message</label>
        <textarea
          id="c-message" required rows={5} className="input" value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      {state === "error" && (
        <p className="text-xs text-rose-deep">Something went wrong — please try again.</p>
      )}
      <button type="submit" disabled={state === "loading"} className="btn-solid w-full">
        Send message
      </button>
    </form>
  );
}
