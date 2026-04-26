import {
  contestantCategories,
  type ContestantCategory,
} from "@/config/contestants";
import type { Contestant } from "@/types";

export { contestantCategories };
export const CONTESTANTS_CACHE_TAG = "contestants";

export type PublicContestant = Omit<Contestant, "vote_count">;

export function isContestantCategory(
  value: string,
): value is ContestantCategory {
  return contestantCategories.includes(value as ContestantCategory);
}
