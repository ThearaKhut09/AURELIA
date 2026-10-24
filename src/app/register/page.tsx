import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-site items-center justify-center px-5 pb-20 pt-28 sm:px-8">
      <RegisterForm />
    </div>
  );
}
