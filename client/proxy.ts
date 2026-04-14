import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE_NAME } from "@/lib/session";

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken ? decodeSession(sessionToken) : null;
  const isAdmin = session?.role === "admin" || session?.role === "super-admin";

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return redirectTo("/login", request);
    }

    if (!isAdmin) {
      return redirectTo("/", request);
    }
  }

  if (pathname === "/login" && session) {
    if (isAdmin) {
      return redirectTo("/admin", request);
    }
    return redirectTo("/", request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
