import "server-only";

import env from "@/config/env";
import { z } from "zod";

interface PublicBackendRequestParams {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  revalidateSeconds?: number;
  tags?: string[];
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

export async function publicBackendRequest<T>(
  params: PublicBackendRequestParams,
  schema: z.ZodType<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${params.path}`, {
      method: params.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
      cache: "force-cache",
      next: {
        revalidate: params.revalidateSeconds ?? 120,
        tags: params.tags,
      },
    });
  } catch {
    throw new Error(`Unable to reach backend API at ${env.apiBaseUrl}`);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, "Public request failed"));
  }

  return schema.parse(payload);
}
