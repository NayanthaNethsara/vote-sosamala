import { headers } from "next/headers";

import { env } from "@/config/env";
import { applyArcjetProtection } from "@/lib/security/arcjet";

type RateLimitProfile = "default" | "auth" | "vote" | "admin";

function getTrustedOrigin() {
  return env.NEXT_PUBLIC_SITE_URL ?? "https://localhost";
}

export async function enforceServerActionRateLimit(
  path: string,
  tokens = 1,
  profile: RateLimitProfile = "default",
) {
  const headerStore = await headers();
  const origin = getTrustedOrigin();

  const requestHeaders = new Headers();
  for (const [name, value] of headerStore.entries()) {
    requestHeaders.set(name, value);
  }

  return applyArcjetProtection(
    new Request(new URL(path, origin).toString(), {
      method: "POST",
      headers: requestHeaders,
    }),
    tokens,
    profile,
  );
}
