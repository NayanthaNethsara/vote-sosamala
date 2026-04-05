import { z } from "zod";

import type { ActionResult } from "@/types/action";

export function toActionError(
  error: unknown,
  invalidDataMessage = "Invalid request data",
): ActionResult<never> {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: invalidDataMessage,
      fieldErrors: error.flatten().fieldErrors,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Unexpected server error",
  };
}
