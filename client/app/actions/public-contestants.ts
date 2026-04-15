"use server";

import { z } from "zod";

import { toActionError } from "@/lib/actions/action-error";
import { publicBackendRequest } from "@/lib/utils/public-backend-request";
import { publicContestantListResponseSchema } from "@/lib/validation/contestant";
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
      publicContestantListResponseSchema,
    );

    return {
      success: true,
      data: payload,
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
