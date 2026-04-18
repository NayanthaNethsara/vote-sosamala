import { NextRequest, NextResponse } from "next/server";

import env from "@/config/env";
import type { VoteLeaderboardResponse } from "@/types/vote";

interface ErrorPayload {
  error?: string;
}

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page") ?? "1";
  const limit = request.nextUrl.searchParams.get("limit") ?? "100";

  let response: Response;
  try {
    response = await fetch(
      `${env.apiBaseUrl}/api/results?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to reach results service" },
      { status: 502 },
    );
  }

  const payload = (await response.json().catch(() => ({}))) as
    | VoteLeaderboardResponse
    | ErrorPayload;

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Failed to fetch leaderboard",
      },
      { status: response.status },
    );
  }

  return NextResponse.json(payload, { status: 200 });
}
