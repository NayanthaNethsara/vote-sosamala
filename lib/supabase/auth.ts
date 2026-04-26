import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

async function getAuthenticatedUserRole(
  userId: string,
): Promise<"guest" | "admin" | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role;
}

export async function getAuthenticatedAdminUser(): Promise<User | null> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const role = await getAuthenticatedUserRole(user.id);

  if (role !== "admin") {
    return null;
  }

  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await getAuthenticatedAdminUser();

  if (!user) {
    redirect("/");
  }

  return user;
}
