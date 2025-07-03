"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function signInWithGoogle() {
  const supabase = await createClient(cookies());
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  return data.url;
}

export async function signOut() {
  const supabase = await createClient(cookies());
  await supabase.auth.signOut();
}
