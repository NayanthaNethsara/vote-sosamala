import "server-only";

import env from "@/config/env";
import { z } from "zod";

interface BackendRequestParams {
  path: string;
  token: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return fallback;
}

export async function backendRequest<T>(
  params: BackendRequestParams,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${params.path}`, {
    method: params.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: params.body ? JSON.stringify(params.body) : undefined,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, "Request to backend failed"));
  }

  return schema.parse(payload);
}
