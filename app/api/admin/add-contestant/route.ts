import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = await createClient(cookieStore);

function createVersionedFilename(name: string, version = 1, ext = "webp") {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return `${slug}_v${version}.${ext}`;
}

export async function POST(req: Request) {
  const sb = supabase;
  const form = await req.formData();

  const session = await sb.auth.getUser();
  const user = session.data?.user;

  // Optional: check if user is admin by email
  if (!user || !user.email?.endsWith("@.com")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = form.get("name")?.toString().trim();
  const bio = form.get("bio")?.toString().trim();
  const category = form.get("category")?.toString().trim();
  const file = form.get("image") as File;

  if (!name || !bio || !category || !file) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const filename = createVersionedFilename(name);

  // Upload image to Supabase Storage
  const { error: uploadError } = await sb.storage
    .from("contestants")
    .upload(filename, file, {
      cacheControl: "31536000", // 1 year
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }

  const { data: urlData } = sb.storage
    .from("contestants")
    .getPublicUrl(filename);

  const { error: insertError } = await sb.from("contestants").insert({
    name,
    bio,
    category,
    image_url: urlData.publicUrl,
    active: true,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Database insert failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
