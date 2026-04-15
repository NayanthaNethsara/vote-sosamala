"use server";

import { z } from "zod";

import { toActionError } from "@/lib/actions/action-error";
import { revalidatePublicContestantsCache } from "@/lib/cache/public-contestants";
import { backendRequest } from "@/lib/utils/backend-request";
import {
  contestantInputSchema,
  contestantListSchema,
  contestantSchema,
} from "@/lib/validation/contestant";
import type { ActionResult } from "@/types/action";
import type { Contestant, ContestantInput } from "@/types/contestant";

const tokenSchema = z.object({
  token: z.string().min(1, "Missing auth token"),
});

const idSchema = z.string().min(1, "Contestant id is required");

const createContestantActionSchema = tokenSchema.extend({
  payload: contestantInputSchema,
});

const updateContestantActionSchema = createContestantActionSchema.extend({
  id: idSchema,
});

const deleteContestantActionSchema = tokenSchema.extend({
  id: idSchema,
});

export async function listContestantsAction(input: {
  token: string;
}): Promise<ActionResult<Contestant[]>> {
  try {
    const parsedInput = tokenSchema.parse(input);
    const contestants = await backendRequest(
      {
        path: "/api/admin/contestants",
        token: parsedInput.token,
      },
      contestantListSchema,
    );

    return {
      success: true,
      data: contestants,
    };
  } catch (error) {
    return toActionError(error, "Invalid contestant data");
  }
}

export async function createContestantAction(input: {
  token: string;
  payload: ContestantInput;
}): Promise<ActionResult<Contestant>> {
  try {
    const parsedInput = createContestantActionSchema.parse(input);
    const contestant = await backendRequest(
      {
        path: "/api/admin/contestants",
        token: parsedInput.token,
        method: "POST",
        body: parsedInput.payload,
      },
      contestantSchema,
    );

    revalidatePublicContestantsCache();

    return {
      success: true,
      data: contestant,
    };
  } catch (error) {
    return toActionError(error, "Invalid contestant data");
  }
}

export async function updateContestantAction(input: {
  token: string;
  id: string;
  payload: ContestantInput;
}): Promise<ActionResult<Contestant>> {
  try {
    const parsedInput = updateContestantActionSchema.parse(input);
    const contestant = await backendRequest(
      {
        path: `/api/admin/contestants/${parsedInput.id}`,
        token: parsedInput.token,
        method: "PUT",
        body: parsedInput.payload,
      },
      contestantSchema,
    );

    revalidatePublicContestantsCache();

    return {
      success: true,
      data: contestant,
    };
  } catch (error) {
    return toActionError(error, "Invalid contestant data");
  }
}

export async function deleteContestantAction(input: {
  token: string;
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const parsedInput = deleteContestantActionSchema.parse(input);

    await backendRequest(
      {
        path: `/api/admin/contestants/${parsedInput.id}`,
        token: parsedInput.token,
        method: "DELETE",
      },
      z.object({ message: z.string() }),
    );

    revalidatePublicContestantsCache();

    return {
      success: true,
      data: { id: parsedInput.id },
    };
  } catch (error) {
    return toActionError(error, "Invalid contestant data");
  }
}
