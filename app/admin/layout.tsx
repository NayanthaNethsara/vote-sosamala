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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#020617_55%,_#0f172a_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.45em] text-emerald-300">
              Admin
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contestant management
            </h1>
            <p className="max-w-2xl text-sm text-white/65">
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
