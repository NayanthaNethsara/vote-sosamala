import type { Contestant } from "@/types";

import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/supabase/auth";

import { ContestantManager } from "../../components/admin/contestant-manager";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  await requireAdminUser();

  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contestants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const contestants = (data ?? []) as Contestant[];

  return (
    <div className="space-y-6">
      {(params.message || params.error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            params.error
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : "border-white/10 bg-neutral-900 text-neutral-200"
          }`}
        >
          {params.error ?? params.message}
        </div>
      )}

      <ContestantManager contestants={contestants} />
    </div>
  );
}
