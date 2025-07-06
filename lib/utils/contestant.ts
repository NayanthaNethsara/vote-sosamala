export function createSafeFilename(name: string, ext: string = "webp"): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const timestamp = Date.now();
  return `${slug}-${timestamp}.${ext}`;
}

export function validateContestantForm({
  name,
  bio,
  category,
  image,
  faculty,
}: {
  name: unknown;
  bio: unknown;
  category: unknown;
  image: unknown;
  faculty: unknown;
}): { valid: boolean; error?: string } {
  if (
    typeof name !== "string" ||
    typeof bio !== "string" ||
    typeof category !== "string" ||
    typeof faculty !== "string" ||
    !(image instanceof File)
  ) {
    return { valid: false, error: "Missing or invalid fields." };
  }

  // Optional: restrict length, category values, etc.
  if (name.length > 100 || bio.length > 500) {
    return { valid: false, error: "Name or bio too long." };
  }

  return { valid: true };
}
