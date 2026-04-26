"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function isSafeRelativePath(path: string): boolean {
  if (path.startsWith("//") || path.includes("://")) {
    return false;
  }

  return path.startsWith("/");
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const requestOrigin = host ? `${proto}://${host}` : undefined;
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? requestOrigin;
  const nextPath = String(formData.get("next") ?? "/");
  const safeNextPath = isSafeRelativePath(nextPath) ? nextPath : "/";

  if (!siteOrigin) {
    redirect(
      `/auth/login?error=oauth_init&message=${encodeURIComponent("Missing application origin configuration")}`,
    );
  }

  let callbackUrl: URL;

  try {
    callbackUrl = new URL("/auth/callback", siteOrigin);
  } catch {
    redirect(
      `/auth/login?error=oauth_init&message=${encodeURIComponent("Invalid application origin configuration")}`,
    );
  }

  callbackUrl.searchParams.set("next", safeNextPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      `/auth/login?error=oauth_init&message=${encodeURIComponent(error?.message ?? "Failed to initiate Google sign-in")}`,
    );
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(
      `/auth/login?error=signout_error&message=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/");
}
