import env from "@/config/env";
import type { AuthUser } from "@/types/auth";
import type { MeResponse } from "@/types/user";

async function authFetch(
  user: AuthUser,
  path: string,
  init?: RequestInit,
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

import type { Contestant, ContestantInput } from "@/types/contestant";

export async function listContestants(user: AuthUser): Promise<Contestant[]> {
  const res = await authFetch(user, "/api/admin/contestants");
  if (!res.ok) throw new Error("Failed to list contestants");
  return res.json();
}

export async function createContestant(
  user: AuthUser,
  data: ContestantInput
): Promise<Contestant> {
  const res = await authFetch(user, "/api/admin/contestants", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create contestant");
  return res.json();
}

export async function updateContestant(
  user: AuthUser,
  id: string,
  data: ContestantInput
): Promise<Contestant> {
  const res = await authFetch(user, `/api/admin/contestants/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update contestant");
  return res.json();
}

export async function deleteContestant(
  user: AuthUser,
  id: string
): Promise<void> {
  const res = await authFetch(user, `/api/admin/contestants/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete contestant");
}
