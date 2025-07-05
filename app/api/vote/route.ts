import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashVoterEmail } from "@/lib/utils/hash";
import { applyArcjetProtection } from "@/lib/security/arcjet";
import { getUserOrThrow } from "@/lib/utils/auth";

export async function POST(req: Request) {
  const arcjetResult = await applyArcjetProtection(req, 1);
  if (arcjetResult) return arcjetResult;

  try {
    const user = await getUserOrThrow();
    const body = await req.json();
    const { contestant_id, category } = body;

    if (
      !contestant_id ||
      typeof contestant_id !== "string" ||
      contestant_id.length !== 36
    ) {
      return NextResponse.json(
        { error: "Invalid contestant ID" },
        { status: 400 }
      );
    }
    if (
      !category ||
      typeof category !== "string" ||
      !/^[a-zA-Z0-9_-]+$/.test(category)
    ) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (!contestant_id || !category) {
      return NextResponse.json({ error: "Missing vote data" }, { status: 400 });
    }

    const supabase = await createClient(cookies());

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contestant } = await supabase
      .from("contestants")
      .select("id")
      .eq("id", contestant_id)
      .eq("category", category)
      .eq("active", true)
      .maybeSingle();

    if (!contestant) {
      return NextResponse.json(
        { error: "Invalid or inactive contestant" },
        { status: 400 }
      );
    }

    const voter_hash = hashVoterEmail(user.email);

    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("voter_hash", voter_hash)
      .eq("category", category)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json(
        { error: "You already voted in this category" },
        { status: 409 }
      );
    }

    // Insert vote
    const { error: voteError } = await supabase.from("votes").insert({
      contestant_id,
      voter_hash,
      category,
    });

    if (voteError) {
      return NextResponse.json(
        { error: "Failed to save vote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
