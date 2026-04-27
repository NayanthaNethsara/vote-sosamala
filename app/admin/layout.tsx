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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-neutral-900 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.45em] text-neutral-300">
              Admin
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contestant management
            </h1>
            <p className="max-w-2xl text-sm text-neutral-400">
              Create, update, and remove contestants from a single protected
              dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/">Back to site</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
