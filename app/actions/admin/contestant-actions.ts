"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CONTESTANTS_CACHE_TAG } from "@/lib/contestants";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import {
  removeContestantImageByPath,
  removeContestantImageByUrl,
  uploadContestantImage,
  validateContestantImageFile,
} from "@/lib/supabase/storage";
import { requireAdminUser } from "@/lib/supabase/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";
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
  const storageClient = createAdminClient();
  const slug = await generateUniqueContestantSlug(supabase, parsed.data.name);

  const imageFileValidation = validateContestantImageFile(
    formData.get("image_file"),
    true,
  );

  console.log("Image file validation:", {
    hasFile: !!imageFileValidation.file,
    size: imageFileValidation.file?.size,
    type: imageFileValidation.file?.type,
    name: imageFileValidation.file?.name,
    error: imageFileValidation.error,
  });

  if (imageFileValidation.error || !imageFileValidation.file) {
    redirectWithMessage(
      "error",
      imageFileValidation.error ?? "Contestant image is required.",
    );
  }

  let uploadedObjectPath: string | null = null;

  try {
    const uploadedImage = await uploadContestantImage(
      storageClient,
      slug,
      imageFileValidation.file,
    );
    uploadedObjectPath = uploadedImage.objectPath;

    const { error: dbError } = await supabase.from("contestants").insert({
      name: parsed.data.name,
      student_id: parsed.data.student_id,
      bio: parsed.data.bio,
      faculty: parsed.data.faculty,
      academic_year: parsed.data.academic_year || null,
      category: parsed.data.category,
      active: parsed.data.active === "true",
      slug,
      image_url: uploadedImage.publicUrl,
    });

    if (dbError) {
      await removeContestantImageByPath(
        storageClient,
        uploadedImage.objectPath,
      );
      redirectWithMessage("error", getReadableDatabaseError(dbError));
    }
  } catch (error) {
    if (uploadedObjectPath) {
      await removeContestantImageByPath(storageClient, uploadedObjectPath);
    }

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    redirectWithMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Failed to upload contestant image.",
    );
  }

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
  const storageClient = createAdminClient();
  const slug = await generateUniqueContestantSlug(
    supabase,
    parsed.data.name,
    parsed.data.id,
  );

  const imageFileValidation = validateContestantImageFile(
    formData.get("image_file"),
    false,
  );

  if (imageFileValidation.error) {
    redirectWithMessage("error", imageFileValidation.error);
  }

  const { data: existingContestant, error: existingContestantError } =
    await supabase
      .from("contestants")
      .select("image_url")
      .eq("id", parsed.data.id)
      .maybeSingle();

  if (existingContestantError || !existingContestant) {
    redirectWithMessage("error", "Contestant not found.");
  }

  let nextImageUrl = existingContestant.image_url;
  let uploadedObjectPath: string | null = null;

  try {
    if (imageFileValidation.file) {
      const uploadedImage = await uploadContestantImage(
        storageClient,
        slug,
        imageFileValidation.file,
      );

      nextImageUrl = uploadedImage.publicUrl;
      uploadedObjectPath = uploadedImage.objectPath;
    }

    const { error: dbError } = await supabase
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
        image_url: nextImageUrl,
      })
      .eq("id", parsed.data.id);

    if (dbError) {
      if (uploadedObjectPath) {
        await removeContestantImageByPath(storageClient, uploadedObjectPath);
      }

      redirectWithMessage("error", getReadableDatabaseError(dbError));
    }

    if (uploadedObjectPath && existingContestant.image_url !== nextImageUrl) {
      await removeContestantImageByUrl(
        storageClient,
        existingContestant.image_url,
      );
    }
  } catch (error) {
    if (uploadedObjectPath) {
      await removeContestantImageByPath(storageClient, uploadedObjectPath);
    }

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    redirectWithMessage(
      "error",
      error instanceof Error
        ? error.message
        : "Failed to upload contestant image.",
    );
  }

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
  const storageClient = createAdminClient();
  const { data: existingContestant, error: existingContestantError } =
    await supabase
      .from("contestants")
      .select("image_url")
      .eq("id", parsed.data.id)
      .maybeSingle();

  if (existingContestantError || !existingContestant) {
    redirectWithMessage("error", "Contestant not found.");
  }

  const { error } = await supabase
    .from("contestants")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    redirectWithMessage("error", getReadableDatabaseError(error));
  }

  await removeContestantImageByUrl(storageClient, existingContestant.image_url);

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

  revalidatePath("/admin");
  revalidatePath("/male");
  revalidatePath("/female");
  redirectWithMessage("message", "Vote counts recalculated successfully.");
}
