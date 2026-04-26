"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CONTESTANTS_CACHE_TAG } from "@/lib/contestants";
import { createClient } from "@/lib/supabase/server";
import type { ContestantCategory } from "@/types";

function isSafeRelativePath(path: string): boolean {
  if (path.startsWith("//") || path.includes("://")) {
    return false;
  }

  return path.startsWith("/");
}

function buildRedirectUrl(
  returnTo: string,
  messageType: "message" | "error",
  message: string,
) {
  const safeReturnTo = isSafeRelativePath(returnTo) ? returnTo : "/";
  const searchParams = new URLSearchParams({
    [messageType]: message,
  });

  return `${safeReturnTo}?${searchParams.toString()}`;
}

export async function voteForContestantAction(formData: FormData) {
  const contestantId = String(formData.get("contestantId") ?? "").trim();
  const contestantSlug = String(formData.get("contestantSlug") ?? "").trim();
  const category = String(
    formData.get("category") ?? "",
  ).trim() as ContestantCategory;
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  const safeReturnTo = isSafeRelativePath(returnTo)
    ? returnTo
    : `/${category}/${contestantSlug}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(safeReturnTo)}`);
  }

  const { data: contestant, error: contestantError } = await supabase
    .from("contestants")
    .select("id, category, active, slug")
    .eq("id", contestantId)
    .eq("slug", contestantSlug)
    .maybeSingle();

  if (contestantError || !contestant || !contestant.active) {
    redirect(
      buildRedirectUrl(safeReturnTo, "error", "Contestant is not available."),
    );
  }

  if (contestant.category !== category) {
    redirect(
      buildRedirectUrl(
        safeReturnTo,
        "error",
        "Invalid category for this contestant.",
      ),
    );
  }

  const { error } = await supabase.from("votes").insert({
    user_id: user.id,
    contestant_id: contestant.id,
    category,
  });

  if (error?.code === "23505") {
    redirect(
      buildRedirectUrl(
        safeReturnTo,
        "error",
        "You already voted in this category.",
      ),
    );
  }

  if (error) {
    redirect(buildRedirectUrl(safeReturnTo, "error", "Failed to submit vote."));
  }

  revalidateTag(CONTESTANTS_CACHE_TAG, "max");
  redirect(
    buildRedirectUrl(safeReturnTo, "message", "Vote submitted successfully."),
  );
}
