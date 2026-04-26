import { ImageResponse } from "next/og";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { isContestantCategory } from "@/lib/contestants";
import type { Database } from "@/types/supabase";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type ContestantOgData = {
  name: string;
  faculty: string;
  academic_year: string | null;
  bio: string | null;
  image_url: string;
  slug: string;
  category: string;
};

function createPublicServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createSupabaseClient<Database>(supabaseUrl, supabasePublishableKey);
}

async function getContestantOgData(category: string, slug: string) {
  const supabase = createPublicServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("contestants")
    .select("name, faculty, academic_year, bio, image_url, slug, category")
    .eq("category", category)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  return (data ?? null) as ContestantOgData | null;
}

function buildDescription(input: {
  faculty: string;
  academicYear: string | null;
  bio: string | null;
}) {
  const summary = input.bio?.trim() || "Vote now on Sosamala Voting.";
  const yearLabel = input.academicYear ? `, ${input.academicYear}` : "";

  return `${input.faculty}${yearLabel} • ${summary}`;
}

function fallbackImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at top, rgba(16,185,129,0.2), transparent 40%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "#ffffff",
        fontSize: 56,
        fontWeight: 700,
        letterSpacing: -1,
      }}
    >
      <div>Sosamala Voting</div>
      <div
        style={{ marginTop: 18, fontSize: 28, fontWeight: 400, opacity: 0.8 }}
      >
        Contestant profile
      </div>
    </div>,
    {
      ...size,
    },
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: { category: string; "contestant-slug": string };
}) {
  const category = params.category;
  const contestantSlug = params["contestant-slug"];

  if (!isContestantCategory(category)) {
    return fallbackImage();
  }

  const contestant = await getContestantOgData(category, contestantSlug);

  if (!contestant) {
    return fallbackImage();
  }

  const description = buildDescription({
    faculty: contestant.faculty,
    academicYear: contestant.academic_year,
    bio: contestant.bio,
  });

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        background:
          "radial-gradient(circle at top right, rgba(16,185,129,0.25), transparent 35%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: "40px",
        gap: "32px",
      }}
    >
      <img
        src={contestant.image_url}
        alt={contestant.name}
        width={420}
        height={550}
        style={{
          objectFit: "cover",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 20,
              opacity: 0.75,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Sosamala Voting
          </div>

          <div style={{ fontSize: 74, lineHeight: 1.02, fontWeight: 800 }}>
            {contestant.name}
          </div>

          <div
            style={{
              fontSize: 30,
              opacity: 0.88,
              textTransform: "capitalize",
            }}
          >
            {contestant.category}
          </div>

          <div style={{ fontSize: 28, lineHeight: 1.35, opacity: 0.9 }}>
            {description.length > 160
              ? `${description.slice(0, 157)}...`
              : description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            opacity: 0.8,
          }}
        >
          <div>vote-sosamala.vercel.app</div>
          <div style={{ textTransform: "uppercase", letterSpacing: 2 }}>
            Vote Now
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
