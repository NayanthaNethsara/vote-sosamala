import "server-only";

import { unstable_cache } from "next/cache";

import { listPublicContestantsAction } from "@/app/actions/public-contestants";
import type { PublicContestantListResponse } from "@/types/contestant";

const fetchPublicContestantsPage = unstable_cache(
  async (
    page: number,
    limit: number,
  ): Promise<PublicContestantListResponse> => {
    const result = await listPublicContestantsAction({ page, limit });

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  },
  ["public-contestants"],
  {
    revalidate: 120,
    tags: ["public-contestants"],
  },
);

export async function getPublicContestantsPage(
  page: number,
  limit: number,
): Promise<PublicContestantListResponse> {
  return fetchPublicContestantsPage(page, limit);
}
