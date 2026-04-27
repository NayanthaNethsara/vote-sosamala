"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CONTESTANTS_CACHE_TAG, isContestantCategory } from "@/lib/contestants";
import { isSafeRelativePath } from "@/lib/security/redirect";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ContestantCategory } from "@/types";

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

async function enforceVoteRateLimit(returnTo: string) {
  return enforceServerActionRateLimit(returnTo, 2, "vote");
}

export async function voteForContestantAction(formData: FormData) {
  const contestantId = String(formData.get("contestantId") ?? "").trim();
  const contestantSlug = String(formData.get("contestantSlug") ?? "").trim();
  const categoryInput = String(formData.get("category") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  if (!isContestantCategory(categoryInput)) {
    redirect(buildRedirectUrl("/", "error", "Invalid category."));
  }

  const category: ContestantCategory = categoryInput;

  const safeReturnTo = isSafeRelativePath(returnTo)
    ? returnTo
    : `/${category}/${contestantSlug}`;

  const protectionResponse = await enforceVoteRateLimit(safeReturnTo);

  if (protectionResponse) {
    if (protectionResponse.status === 429) {
      redirect(
        buildRedirectUrl(
          safeReturnTo,
          "error",
          "Too many vote attempts. Please wait and try again.",
        ),
      );
    }

    redirect(
      buildRedirectUrl(safeReturnTo, "error", "Vote request was blocked."),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildRedirectUrl(safeReturnTo, "error", "Please login to vote."));
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

  const adminSupabase = createAdminClient();
  const { data: voteResult, error } = await adminSupabase.rpc("cast_vote", {
    p_user_id: user.id,
    p_contestant_id: contestant.id,
    p_category: category,
  });

  if (voteResult === "already_voted") {
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

  if (voteResult !== "success") {
    redirect(buildRedirectUrl(safeReturnTo, "error", "Failed to submit vote."));
  }

  const cookieStore = await cookies();
  cookieStore.set(`vote_device_${category}`, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidateTag(CONTESTANTS_CACHE_TAG, "max");
  redirect(
    buildRedirectUrl(safeReturnTo, "message", "Vote submitted successfully."),
  );
}
