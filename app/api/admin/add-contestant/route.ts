import { getAdminUserOrThrow } from "@/lib/utils/auth";

export async function POST(req: Request) {
  try {
    const admin = await getAdminUserOrThrow();

    const form = await req.formData();
    const name = form.get("name")?.toString().trim();
    const image = form.get("image") as File;

    if (!name || !image) {
      return new Response("Missing fields", { status: 400 });
    }

    // 👇 handle upload and DB insert securely...

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Unauthorized", { status: 401 });
  }
}
