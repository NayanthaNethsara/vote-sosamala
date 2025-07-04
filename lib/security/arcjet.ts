import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({ mode: "LIVE", refillRate: 5, interval: 10, capacity: 10 }),
  ],
});

export async function applyArcjetProtection(req: Request, tokens = 1) {
  const decision = await aj.protect(req, { requested: tokens });

  if (decision.isDenied()) {
    if (decision.results.some(isSpoofedBot)) {
      return NextResponse.json({ error: "Spoofed bot" }, { status: 403 });
    }
    if (decision.reason.isBot()) {
      return NextResponse.json({ error: "Bot blocked" }, { status: 403 });
    }
    if (decision.reason.isRateLimit()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
