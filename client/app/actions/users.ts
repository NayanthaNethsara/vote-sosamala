"use server";

import { z } from "zod";

import { toActionError } from "@/lib/actions/action-error";
import { backendRequest } from "@/lib/utils/backend-request";
import { systemUserListSchema } from "@/lib/validation/user";
import type { ActionResult } from "@/types/action";
import type { SystemUser } from "@/types/user";

const tokenSchema = z.object({
  token: z.string().min(1, "Missing auth token"),
});

export async function listUsersAction(input: {
  token: string;
}): Promise<ActionResult<SystemUser[]>> {
  try {
    const parsedInput = tokenSchema.parse(input);
    const users = await backendRequest(
      {
        path: "/api/admin/users",
        token: parsedInput.token,
      },
      systemUserListSchema,
    );

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    return toActionError(error, "Failed to list users");
  }
}
