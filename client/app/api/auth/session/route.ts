import { NextResponse } from "next/server";
import env from "@/config/env";
import {
  encodeSession,
  SESSION_COOKIE_NAME,
  type SessionRole,
} from "@/lib/session";

interface SessionRequestBody {
  idToken?: string;
}

interface MeResponse {
  uid: string;
  role: SessionRole;
}

function shouldUseSecureCookie(): boolean {
  if (process.env.AUTH_COOKIE_SECURE?.toLowerCase() === "true") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

export async function POST(req: Request) {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "AUTH_SESSION_SECRET is not configured" },
      { status: 500 },
    );
  }

  let body: SessionRequestBody;
  try {
    body = (await req.json()) as SessionRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const idToken = body.idToken?.trim();
  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  const meRes = await fetch(`${env.apiBaseUrl}/api/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const me = (await meRes.json()) as MeResponse;
  const token = encodeSession({
    uid: me.uid,
    role: me.role,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  });

  if (!token) {
    return NextResponse.json(
      { error: "failed to create session" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ role: me.role });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
