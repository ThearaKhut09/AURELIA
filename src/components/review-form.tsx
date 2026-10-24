"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";

export function ReviewForm({ productId }: { productId: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, author: name, rating, comment }),
      });
      if (res.ok) {
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-outline text-xs">
        {t("product.writeReview")}
      </button>
    );
  }

  if (state === "done") {
    return <p className="text-sm font-medium text-sage-deep">{t("product.reviewThanks")}</p>;
  }

  return (
    <form onSubmit={submit} className="card-solid w-full max-w-md space-y-3 p-4">
      <div>
        <label className="label" htmlFor="review-name">{t("product.yourName")}</label>
        <input
          id="review-name"
          required
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <span className="label">{t("product.rating")}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              aria-label={`${r} stars`}
              aria-pressed={rating === r}
              className="text-xl leading-none text-gold"
            >
              {r <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="review-comment">{t("product.comment")}</label>
        <textarea
          id="review-comment"
          required
          rows={3}
          className="input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      {state === "error" && (
        <p className="text-xs text-rose-deep">{t("home.newsletterError")}</p>
      )}
      <button type="submit" disabled={state === "loading"} className="btn-solid w-full">
        {t("product.submitReview")}
      </button>
    </form>
  );
}
