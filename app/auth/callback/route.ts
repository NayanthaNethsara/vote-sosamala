import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  authCallbackSchema,
  authErrorSchema,
} from "@/lib/validation/authSchema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const errorResult = authErrorSchema.safeParse({
    error: searchParams.get("error"),
    error_description: searchParams.get("error_description"),
  });

  if (errorResult.success && errorResult.data.error) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("error", "auth_callback_error");
    redirectUrl.searchParams.set(
      "message",
      errorResult.data.error_description ?? "Authentication failed",
    );
    return NextResponse.redirect(redirectUrl);
  }

  const callbackResult = authCallbackSchema.safeParse({
    code: searchParams.get("code"),
    next: searchParams.get("next") ?? "/",
  });

  if (!callbackResult.success) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("error", "invalid_callback");
    redirectUrl.searchParams.set("message", "Invalid authentication callback");
    return NextResponse.redirect(redirectUrl);
  }

  const { code, next } = callbackResult.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("error", "code_exchange_error");
    redirectUrl.searchParams.set(
      "message",
      "Failed to complete authentication",
    );
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = new URL(next, request.url);
  return NextResponse.redirect(redirectUrl);
}
