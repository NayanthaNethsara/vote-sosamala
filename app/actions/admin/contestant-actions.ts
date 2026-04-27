"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CONTESTANTS_CACHE_TAG } from "@/lib/contestants";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import { requireAdminUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  contestantCreateSchema,
  contestantDeleteSchema,
  contestantUpdateSchema,
} from "@/lib/validation/adminContestantSchema";
import { generateUniqueContestantSlug } from "@/lib/contestant-slug";

function getReadableDatabaseError(error: {
  code?: string;
  message?: string;
}): string {
  const errorMessage = error.message ?? "";

  if (
    error.code === "23505" &&
    errorMessage.includes("contestants_student_id")
  ) {
    return "That student ID is already in use.";
  }

  if (error.code === "23505" && errorMessage.includes("contestants_slug_key")) {
    return "That slug is already in use. Try a different name.";
  }

  return errorMessage || "An unexpected database error occurred.";
}

function redirectWithMessage(
  messageType: "message" | "error",
  message: string,
): never {
  redirect(`/admin?${messageType}=${encodeURIComponent(message)}`);
}

export async function createContestantAction(formData: FormData) {
  const protectionResponse = await enforceServerActionRateLimit(
    "/admin",
    2,
    "admin",
  );
  if (protectionResponse) {
    redirectWithMessage("error", "Too many requests. Please try again soon.");
  }

  await requireAdminUser();

  const parsed = contestantCreateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid contestant data",
    );
  }

  const supabase = await createClient();
  const slug = await generateUniqueContestantSlug(supabase, parsed.data.name);

  const { error } = await supabase.from("contestants").insert({
    name: parsed.data.name,
    student_id: parsed.data.student_id,
    bio: parsed.data.bio,
    faculty: parsed.data.faculty,
    academic_year: parsed.data.academic_year || null,
    category: parsed.data.category,
    active: parsed.data.active === "true",
    slug,
    image_url: `/${slug}.png`,
  });

  if (error) {
    redirectWithMessage("error", getReadableDatabaseError(error));
  }

  revalidateTag(CONTESTANTS_CACHE_TAG, "max");
  revalidatePath("/admin");
  redirectWithMessage("message", "Contestant created.");
}

export async function updateContestantAction(formData: FormData) {
  const protectionResponse = await enforceServerActionRateLimit(
    "/admin",
    2,
    "admin",
  );
  if (protectionResponse) {
    redirectWithMessage("error", "Too many requests. Please try again soon.");
  }

  await requireAdminUser();

  const parsed = contestantUpdateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid contestant data",
    );
  }

  const supabase = await createClient();
  const slug = await generateUniqueContestantSlug(
    supabase,
    parsed.data.name,
    parsed.data.id,
  );

  const { error } = await supabase
    .from("contestants")
    .update({
      name: parsed.data.name,
      student_id: parsed.data.student_id,
      bio: parsed.data.bio,
      faculty: parsed.data.faculty,
      academic_year: parsed.data.academic_year || null,
      category: parsed.data.category,
      active: parsed.data.active === "true",
      slug,
      image_url: `/${slug}.png`,
    })
    .eq("id", parsed.data.id);

  if (error) {
    redirectWithMessage("error", getReadableDatabaseError(error));
  }

  revalidateTag(CONTESTANTS_CACHE_TAG, "max");
  revalidatePath("/admin");
  redirectWithMessage("message", "Contestant updated.");
}

export async function deleteContestantAction(formData: FormData) {
  const protectionResponse = await enforceServerActionRateLimit(
    "/admin",
    2,
    "admin",
  );
  if (protectionResponse) {
    redirectWithMessage("error", "Too many requests. Please try again soon.");
  }

  await requireAdminUser();

  const parsed = contestantDeleteSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    redirectWithMessage("error", "Invalid contestant id.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contestants")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    redirectWithMessage("error", getReadableDatabaseError(error));
  }

  revalidateTag(CONTESTANTS_CACHE_TAG, "max");
  revalidatePath("/admin");
  redirectWithMessage("message", "Contestant deleted.");
}

export async function recalculateVoteCountsAction() {
  const protectionResponse = await enforceServerActionRateLimit(
    "/admin",
    3,
    "admin",
  );
  if (protectionResponse) {
    redirectWithMessage("error", "Too many requests. Please try again soon.");
  }

  await requireAdminUser();

  const supabase = await createClient();
  const { error } = await supabase.rpc("recalculate_vote_counts");

  if (error) {
    redirectWithMessage("error", "Failed to recalculate vote counts.");
  }

  revalidateTag(CONTESTANTS_CACHE_TAG, "max");
  revalidatePath("/admin");
  redirectWithMessage("message", "Vote counts recalculated successfully.");
}
