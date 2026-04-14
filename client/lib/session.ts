import crypto from "crypto";

export const SESSION_COOKIE_NAME = "vote_session";

export type SessionRole = "guest" | "admin" | "super-admin";

export interface SessionPayload {
  uid: string;
  role: SessionRole;
  exp: number;
}

function getSessionSecret(): string | null {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) {
    return null;
  }
  return secret;
}

function toBase64URL(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64URL(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadB64: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
}

export function encodeSession(payload: SessionPayload): string | null {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const payloadB64 = toBase64URL(JSON.stringify(payload));
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return null;
  }

  const expectedSig = sign(payloadB64, secret);
  const providedSig = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSig);

  if (providedSig.length !== expectedSigBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(providedSig, expectedSigBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64URL(payloadB64)) as SessionPayload;
    if (!parsed.uid || !parsed.role || !parsed.exp) {
      return null;
    }

    if (Date.now() >= parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
