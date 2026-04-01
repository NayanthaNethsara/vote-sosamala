import env from "@/config/env";
import type { AuthUser } from "@/types/auth";
import type { MeResponse } from "@/types/user";

// Gets a fresh Firebase ID token from the authenticated user and attaches it as a Bearer header.
async function authFetch(
  user: AuthUser,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await user.getIdToken();

  return fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
}

export async function fetchMe(user: AuthUser): Promise<MeResponse> {
  const res = await authFetch(user, "/api/me");
  if (!res.ok) {
    throw new Error(`/api/me failed: ${res.status}`);
  }
  return res.json();
}
