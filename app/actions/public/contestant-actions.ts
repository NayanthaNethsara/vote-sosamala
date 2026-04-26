"use server";

import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import { CONTESTANTS_CACHE_TAG, type PublicContestant } from "@/lib/contestants";
import type { ContestantCategory } from "@/types";
import type { Database } from "@/types/supabase";

type VoteRow = {
  id: string;
  vote_count: number;
};

export type ContestantVoteStats = {
  voteCount: number;
  rank: number;
};

function createPublicServerClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

const publicContestantSelect =
  "id, name, student_id, bio, faculty, academic_year, image_url, active, category, slug, created_at, updated_at";

const getContestantsByCategoryCached = unstable_cache(
  async (category: ContestantCategory) => {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("contestants")
      .select(publicContestantSelect)
      .eq("category", category)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as PublicContestant[];
  },
  ["public-contestants-by-category"],
  {
    revalidate: 3600,
    tags: [CONTESTANTS_CACHE_TAG],
  },
);

const getContestantByCategoryAndSlugCached = unstable_cache(
  async (category: ContestantCategory, slug: string) => {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("contestants")
      .select(publicContestantSelect)
      .eq("category", category)
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? null) as PublicContestant | null;
  },
  ["public-contestant-by-category-and-slug"],
  {
    revalidate: 3600,
    tags: [CONTESTANTS_CACHE_TAG],
  },
);

export async function getContestantsByCategoryAction(category: ContestantCategory) {
  return getContestantsByCategoryCached(category);
}

export async function getContestantByCategoryAndSlugAction(
  category: ContestantCategory,
  slug: string,
) {
  return getContestantByCategoryAndSlugCached(category, slug);
}

export async function getContestantVoteCountAction(contestantId: string) {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("contestants")
    .select("vote_count")
    .eq("id", contestantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const contestant = data as { vote_count: number } | null;

  return contestant?.vote_count ?? 0;
}

function buildContestantVoteStats(rows: VoteRow[]): Record<string, ContestantVoteStats> {
  let previousVoteCount: number | null = null;
  let currentRank = 0;
  let currentPosition = 0;

  const stats: Record<string, ContestantVoteStats> = {};

  for (const row of rows) {
    currentPosition += 1;

    if (previousVoteCount === null || row.vote_count !== previousVoteCount) {
      currentRank = currentPosition;
      previousVoteCount = row.vote_count;
    }

    stats[row.id] = {
      voteCount: row.vote_count,
      rank: currentRank,
    };
  }

  return stats;
}

export async function getCategoryVoteStatsAction(category: ContestantCategory) {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("contestants")
    .select("id, vote_count")
    .eq("category", category)
    .eq("active", true)
    .order("vote_count", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return buildContestantVoteStats((data ?? []) as VoteRow[]);
}

export async function getContestantVoteStatsAction(
  category: ContestantCategory,
  contestantId: string,
) {
  const categoryStats = await getCategoryVoteStatsAction(category);

  return (
    categoryStats[contestantId] ?? {
      voteCount: 0,
      rank: 0,
    }
  );
}