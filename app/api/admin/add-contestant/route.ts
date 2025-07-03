import { applyArcjetProtection } from "@/lib/security/arcjet";
import { getAdminUserOrThrow } from "@/lib/utils/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import {
  createSafeFilename,
  validateContestantForm,
} from "@/lib/utils/contestant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 🛡️ Arcjet protection per request
  const arcjetResult = await applyArcjetProtection(req, 2); // Cost: 2 tokens
  if (arcjetResult) return arcjetResult;

  try {
    await getAdminUserOrThrow();

    const form = await req.formData();
    const name = form.get("name");
    const bio = form.get("bio");
    const category = form.get("category");
    const image = form.get("image");

    const { valid, error } = validateContestantForm({
      name,
      bio,
      category,
      image,
    });
    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const file = image as File;
    const filename = createSafeFilename(name as string);

    const supabase = await createClient(cookies());

    const { error: uploadError } = await supabase.storage
      .from("contestants")
      .upload(filename, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("contestants")
      .getPublicUrl(filename);
    const image_url = urlData?.publicUrl;

    const { error: insertError } = await supabase.from("contestants").insert({
      name,
      bio,
      category,
      image_url,
      active: true,
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
