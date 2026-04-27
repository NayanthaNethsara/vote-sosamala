import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { Database } from "@/types/supabase";

const allowedMimeToExtension: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const maxImageSizeInBytes = 4 * 1024 * 1024;

function getBucketName() {
  return env.SUPABASE_CONTESTANTS_BUCKET;
}

export function validateContestantImageFile(
  value: FormDataEntryValue | null,
  required: boolean,
): { file: File | null; error: string | null } {
  if (!(value instanceof File) || value.size === 0) {
    if (required) {
      return { file: null, error: "Contestant image is required." };
    }

    return { file: null, error: null };
  }

  if (value.size > maxImageSizeInBytes) {
    return { file: null, error: "Image must be 4MB or less." };
  }

  if (!Object.hasOwn(allowedMimeToExtension, value.type)) {
    return {
      file: null,
      error: "Invalid image format. Use PNG, JPEG, or WEBP.",
    };
  }

  return { file: value, error: null };
}

function buildStorageObjectPath(slug: string, file: File) {
  const extension = allowedMimeToExtension[file.type] ?? "png";
  const timestamp = Date.now();
  return `${slug}-${timestamp}.${extension}`;
}

export async function uploadContestantImage(
  supabase: SupabaseClient<Database>,
  slug: string,
  file: File,
): Promise<{ publicUrl: string; objectPath: string }> {
  const bucket = getBucketName();
  const objectPath = buildStorageObjectPath(slug, file);

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, arrayBuffer, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    throw new Error(uploadError.message || "Failed to upload image.");
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  return {
    publicUrl: publicUrlData.publicUrl,
    objectPath,
  };
}

function getStorageObjectPathFromPublicUrl(imageUrl: string) {
  const bucket = getBucketName();

  try {
    const parsedUrl = new URL(imageUrl);
    const prefix = `/storage/v1/object/public/${bucket}/`;

    if (!parsedUrl.pathname.startsWith(prefix)) {
      return null;
    }

    const objectPath = parsedUrl.pathname.slice(prefix.length);
    return objectPath ? decodeURIComponent(objectPath) : null;
  } catch {
    return null;
  }
}

export async function removeContestantImageByUrl(
  supabase: SupabaseClient<Database>,
  imageUrl: string,
) {
  const bucket = getBucketName();
  const objectPath = getStorageObjectPathFromPublicUrl(imageUrl);

  if (!objectPath) {
    return;
  }

  await supabase.storage.from(bucket).remove([objectPath]);
}

export async function removeContestantImageByPath(
  supabase: SupabaseClient<Database>,
  objectPath: string,
) {
  const bucket = getBucketName();

  await supabase.storage.from(bucket).remove([objectPath]);
}
