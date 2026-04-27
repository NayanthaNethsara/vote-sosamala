import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";
import { env } from "@/config/env";

type ArcjetProfile = "default" | "auth" | "vote" | "admin";

const defaultAj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({ mode: "LIVE", refillRate: 60, interval: 60, capacity: 100 }),
  ],
});

const authAj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({ mode: "LIVE", refillRate: 15, interval: 60, capacity: 30 }),
  ],
});

const voteAj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({ mode: "LIVE", refillRate: 40, interval: 60, capacity: 80 }),
  ],
});

const adminAj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({ mode: "LIVE", refillRate: 30, interval: 60, capacity: 60 }),
  ],
});

function getArcjetByProfile(profile: ArcjetProfile) {
  if (profile === "auth") {
    return authAj;
  }

  if (profile === "vote") {
    return voteAj;
  }

  if (profile === "admin") {
    return adminAj;
  }

  return defaultAj;
}

export async function applyArcjetProtection(
  req: Request,
  tokens = 1,
  profile: ArcjetProfile = "default",
) {
  const aj = getArcjetByProfile(profile);
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
