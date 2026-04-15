import { NextResponse } from "next/server";

import { revalidatePublicContestantsCache } from "@/lib/cache/public-contestants";

interface RevalidateBody {
  secret?: string;
}

function getSecret(): string | null {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) {
    return null;
  }

  return secret;
}

export async function POST(request: Request) {
  const configuredSecret = getSecret();
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (body.secret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePublicContestantsCache();

  return NextResponse.json({ revalidated: true });
}
