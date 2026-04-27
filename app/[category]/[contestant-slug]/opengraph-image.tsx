import { ImageResponse } from "next/og";

import {
  getContestantByCategoryAndSlugAction,
  getContestantsByCategoryAction,
} from "@/app/actions/public/contestant-actions";
import { contestantCategories, isContestantCategory } from "@/lib/contestants";
import { siteConfig } from "@/config/site-config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamic = "force-static";

const siteUrl = siteConfig.url;
const siteHost = new URL(siteUrl).host;

export async function generateStaticParams() {
  const params = await Promise.all(
    contestantCategories.map(async (category) => {
      const contestants = await getContestantsByCategoryAction(category);

      return contestants.map((contestant) => ({
        category,
        "contestant-slug": contestant.slug,
      }));
    }),
  );

  return params.flat();
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

  const contestant = await getContestantByCategoryAndSlugAction(
    category,
    contestantSlug,
  );

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

          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              padding: "10px 22px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.12)",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Cast Your Vote Today
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
          <div>{siteHost}</div>
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
