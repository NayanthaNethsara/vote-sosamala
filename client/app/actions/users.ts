"use server";

import { z } from "zod";

import { toActionError } from "@/lib/actions/action-error";
import { backendRequest } from "@/lib/utils/backend-request";
import { userRoleValues, userListResponseSchema } from "@/lib/validation/user";
import type { ActionResult } from "@/types/action";
import type { UserListResponse } from "@/types/user";

const listUsersInputSchema = z.object({
  token: z.string().min(1, "Missing auth token"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  role: z.enum([...userRoleValues, "all"]).default("all"),
});

export async function listUsersAction(input: {
  token: string;
  page?: number;
  limit?: number;
  role?: "all" | (typeof userRoleValues)[number];
}): Promise<ActionResult<UserListResponse>> {
  try {
    const parsedInput = listUsersInputSchema.parse(input);

    const query = new URLSearchParams({
      page: String(parsedInput.page),
      limit: String(parsedInput.limit),
    });

    if (parsedInput.role !== "all") {
      query.set("role", parsedInput.role);
    }

    const payload = await backendRequest(
      {
        path: `/api/admin/users?${query.toString()}`,
        token: parsedInput.token,
      },
      userListResponseSchema,
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

    return toActionError(error, "Failed to list users");
  }
}
