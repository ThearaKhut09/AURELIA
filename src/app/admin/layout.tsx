import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto w-full max-w-site px-5 pb-20 pt-24 sm:px-8 md:pt-28">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <p className="eyebrow">AURELIA</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">Admin</h1>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Admin">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
