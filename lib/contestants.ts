import type { Contestant, ContestantCategory } from "@/types";
export const contestantCategories = ["male", "female"] as const;
export const CONTESTANTS_CACHE_TAG = "contestants";

export type PublicContestant = Omit<Contestant, "vote_count">;

export function isContestantCategory(
  value: string,
): value is ContestantCategory {
  return contestantCategories.includes(value as ContestantCategory);
}
