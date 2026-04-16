import "server-only";

import { unstable_cache } from "next/cache";

import { listPublicContestantsAction } from "@/app/actions/public-contestants";
import type {
  Contestant,
  PublicContestantListResponse,
} from "@/types/contestant";

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

const fetchAllPublicContestants = unstable_cache(
  async (limit: number): Promise<Contestant[]> => {
    const allContestants: Contestant[] = [];
    let currentPage = 1;

    while (true) {
      const pageData = await getPublicContestantsPage(currentPage, limit);
      allContestants.push(...pageData.contestants);

      if (!pageData.pagination.hasNext) {
        break;
      }

      currentPage += 1;
    }

    return allContestants;
  },
  ["public-contestants-all"],
  {
    revalidate: 120,
    tags: ["public-contestants"],
  },
);

export async function getAllPublicContestants(
  limit = 100,
): Promise<Contestant[]> {
  return fetchAllPublicContestants(limit);
}
