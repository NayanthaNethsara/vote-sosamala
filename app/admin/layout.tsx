import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/lib/supabase/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminUser();

  return (
    <div className="min-h-screen text-amber-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-amber-200/20 bg-amber-50/5 px-6 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between shadow-2xl shadow-black/20">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.45em] text-amber-200/70">
              Control Panel
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contestant management
            </h1>
            <p className="max-w-2xl text-sm text-amber-100/60">
              Create, update, and remove contestants from a single protected
              dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="border border-amber-200/20 bg-amber-100/10 text-amber-50 hover:bg-amber-100/20"
            >
              <Link href="/" prefetch={false}>
                Back to site
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
