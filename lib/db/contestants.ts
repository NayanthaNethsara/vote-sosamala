import { createClient } from "@/lib/supabase/server";

export async function getActiveContestants(category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("contestants")
    .select("id, name, image_url, bio, faculty, vote_count, category, active")
    .eq("active", true)
    .eq("category", category);

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return data;
}

export async function getContestantById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contestants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getAllContestants() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contestants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data;
}
