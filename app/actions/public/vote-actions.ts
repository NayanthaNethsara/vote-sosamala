"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CONTESTANTS_CACHE_TAG, isContestantCategory } from "@/lib/contestants";
import { isSafeRelativePath } from "@/lib/security/redirect";
import { applyArcjetProtection } from "@/lib/security/arcjet";
import { createClient } from "@/lib/supabase/server";
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
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "https://localhost";

  const requestHeaders = new Headers();
  for (const [name, value] of headerStore.entries()) {
    requestHeaders.set(name, value);
  }

  const protectionResponse = await applyArcjetProtection(
    new Request(new URL(returnTo, origin).toString(), {
      method: "POST",
      headers: requestHeaders,
    }),
    2,
  );

  return protectionResponse;
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
