import { createClient } from "@/lib/supabase/server";

export async function getActiveContestants(category?: string) {
  const supabase = await createClient();

  console.log(
    "[getActiveContestants] Fetching contestants for category:",
    category
  );

  let query = supabase
    .from("contestants")
    .select("id, name, image, bio, faculty, vote_count, category")
    .eq("active", true)
    .eq("category", category);

  const { data, error } = await query;

  if (error) {
    console.error("[getActiveContestants] Supabase error:", error.message);
    return [];
  }

  return data;
}
