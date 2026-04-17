"use server";

import { z } from "zod";

import { toActionError } from "@/lib/actions/action-error";
import { backendRequest } from "@/lib/utils/backend-request";
import type { ActionResult } from "@/types/action";

const castVoteInputSchema = z.object({
  token: z.string().min(1, "Missing auth token"),
  contestantId: z.string().uuid("Invalid contestant id"),
});

const castVoteResponseSchema = z.object({
  accepted: z.boolean(),
  message: z.string(),
});

const voteStatusResponseSchema = z.object({
  hasVoted: z.boolean(),
});

export async function castVoteAction(input: {
  token: string;
  contestantId: string;
}): Promise<ActionResult<{ accepted: boolean; message: string }>> {
  try {
    const parsedInput = castVoteInputSchema.parse(input);

    const response = await backendRequest(
      {
        path: "/api/votes",
        token: parsedInput.token,
        method: "POST",
        body: {
          contestantId: parsedInput.contestantId,
        },
      },
      castVoteResponseSchema,
    );

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return toActionError(error, "Failed to cast vote");
  }
}

export async function getVoteStatusAction(input: {
  token: string;
}): Promise<ActionResult<{ hasVoted: boolean }>> {
  try {
    const parsedToken = z
      .object({ token: z.string().min(1, "Missing auth token") })
      .parse(input);

    const response = await backendRequest(
      {
        path: "/api/votes/status",
        token: parsedToken.token,
        method: "GET",
      },
      voteStatusResponseSchema,
    );

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return toActionError(error, "Failed to fetch vote status");
  }
}
