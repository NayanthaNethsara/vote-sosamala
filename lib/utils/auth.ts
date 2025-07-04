import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function isAdmin(user: User | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!user?.email && user.email === adminEmail;
}

export async function getAdminUserOrThrow() {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdmin(user)) {
    throw new Error("Unauthorized");
  }

  return user;
}
export async function getAdminUserOrRedirect() {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdmin(user)) {
    redirect("/unauthorized");
  }

  return user;
}
