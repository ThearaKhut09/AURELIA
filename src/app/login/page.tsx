import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-site items-center justify-center px-5 pb-20 pt-28 sm:px-8">
      <Suspense fallback={<div className="h-96 w-full max-w-md rounded-2xl bg-white/60" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
