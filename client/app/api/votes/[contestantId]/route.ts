import { NextRequest, NextResponse } from "next/server";

import env from "@/config/env";

interface VoteCountPayload {
  votes?: unknown;
  error?: string;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ contestantId: string }> },
) {
  const { contestantId: rawContestantId } = await context.params;
  const contestantId = rawContestantId?.trim();
  if (!contestantId) {
    return NextResponse.json(
      { error: "contestantId is required" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `${env.apiBaseUrl}/api/contestants/${encodeURIComponent(contestantId)}/votes`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to reach vote service" },
      { status: 502 },
    );
  }

  const payload = (await response.json().catch(() => ({}))) as VoteCountPayload;

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error ?? "Failed to fetch vote count" },
      { status: response.status },
    );
  }

  return NextResponse.json(
    {
      votes: typeof payload.votes === "number" ? payload.votes : 0,
    },
    { status: 200 },
  );
}
