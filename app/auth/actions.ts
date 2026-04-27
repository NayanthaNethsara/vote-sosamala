"use server";

import { createClient } from "@/lib/supabase/server";
import { isSafeRelativePath } from "@/lib/security/redirect";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import { redirect } from "next/navigation";

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const nextPath = String(formData.get("next") ?? "/");
  const safeNextPath = isSafeRelativePath(nextPath) ? nextPath : "/";

  const protectionResponse = await enforceServerActionRateLimit(
    "/auth",
    1,
    "auth",
  );

  if (protectionResponse) {
    redirect("/");
  }

  if (!siteOrigin) {
    console.error("NEXT_PUBLIC_SITE_URL is not configured.");
    redirect("/");
  }

  let callbackUrl: URL;

  try {
    callbackUrl = new URL("/auth/callback", siteOrigin);
  } catch {
    redirect("/");
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
    if (error) {
      console.error("Failed to initiate Google sign-in", error);
    }

    redirect("/");
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Failed to sign out", error);
    redirect("/");
  }

  redirect("/");
}
