import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

const MAX_SLUG_LENGTH = 32;

function normalizeSlugSegments(name: string): string[] {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function trimSlug(slug: string): string {
  const trimmed = slug.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, "");
  return trimmed || "contestant";
}

export function createContestantSlugBase(name: string): string {
  const segments = normalizeSlugSegments(name);

  if (segments.length === 0) {
    return "contestant";
  }

  const firstSegment = segments[0].slice(0, 12);
  const lastSegment =
    segments.length > 1 ? segments[segments.length - 1].slice(0, 12) : "";

  return trimSlug([firstSegment, lastSegment].filter(Boolean).join("-"));
}

export async function generateUniqueContestantSlug(
  supabase: SupabaseClient<Database>,
  name: string,
  excludedContestantId?: string,
): Promise<string> {
  const { data, error } = await supabase.from("contestants").select("id, slug");

  if (error) {
    throw error;
  }

  const contestants = (data ?? []) as Array<{ id: string; slug: string }>;

  const takenSlugs = new Set(
    contestants
      .filter((contestant) => contestant.id !== excludedContestantId)
      .map((contestant) => contestant.slug),
  );

  const baseSlug = createContestantSlugBase(name);
  let nextSlug = baseSlug;
  let suffix = 2;

  while (takenSlugs.has(nextSlug)) {
    const suffixPart = `-${suffix}`;
    const availableBaseLength = Math.max(
      1,
      MAX_SLUG_LENGTH - suffixPart.length,
    );
    nextSlug = trimSlug(
      `${baseSlug.slice(0, availableBaseLength)}${suffixPart}`,
    );
    suffix += 1;
  }

  return nextSlug;
}
