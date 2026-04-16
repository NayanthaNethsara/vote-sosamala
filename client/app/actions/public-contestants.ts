"use server";

import { z } from "zod";

import { toActionError } from "@/lib/actions/action-error";
import { publicBackendRequest } from "@/lib/utils/public-backend-request";
import {
  contestantListSchema,
  publicContestantListResponseSchema,
} from "@/lib/validation/contestant";
import type { ActionResult } from "@/types/action";
import type { PublicContestantListResponse } from "@/types/contestant";

const listPublicContestantsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(12),
});

export async function listPublicContestantsAction(input: {
  page?: number;
  limit?: number;
}): Promise<ActionResult<PublicContestantListResponse>> {
  try {
    const parsedInput = listPublicContestantsInputSchema.parse(input);
    const query = new URLSearchParams({
      page: String(parsedInput.page),
      limit: String(parsedInput.limit),
    });

    const payload = await publicBackendRequest(
      {
        path: `/api/contestants?${query.toString()}`,
        revalidateSeconds: 120,
        tags: ["public-contestants"],
      },
      z.union([publicContestantListResponseSchema, contestantListSchema]),
    );

    const normalizedPayload = Array.isArray(payload)
      ? (() => {
          const total = payload.length;
          const totalPages = Math.ceil(total / parsedInput.limit);
          const currentPage =
            totalPages === 0
              ? 1
              : Math.min(parsedInput.page, Math.max(1, totalPages));
          const start = (currentPage - 1) * parsedInput.limit;
          const contestants = payload.slice(start, start + parsedInput.limit);

          return {
            contestants,
            pagination: {
              page: currentPage,
              limit: parsedInput.limit,
              total,
              totalPages,
              hasNext: currentPage < totalPages,
              hasPrev: currentPage > 1,
            },
          } satisfies PublicContestantListResponse;
        })()
      : payload;

    return {
      success: true,
      data: normalizedPayload,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return toActionError(error, "Failed to list public contestants");
  }
}
