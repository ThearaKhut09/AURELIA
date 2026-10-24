"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleProductActive } from "@/app/admin/actions";

export function ToggleActiveButtons({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleProductActive(id, !isActive);
          router.refresh();
        })
      }
      className="text-ink-soft underline underline-offset-2 hover:text-ink"
    >
      {isActive ? "Hide" : "Publish"}
    </button>
  );
}
