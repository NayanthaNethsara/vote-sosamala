import { ImageResponse } from "next/og";

import { getContestantByCategoryAndSlugAction } from "@/app/actions/public/contestant-actions";
import { isContestantCategory } from "@/lib/contestants";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function fallbackImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1f0a12 0%, #3c111a 55%, #1a070d 100%)",
        color: "#fde68a",
        fontSize: 56,
        fontWeight: 800,
      }}
    >
      Vote Now
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

  const categoryLabel =
    category === "male" ? "Aurudu Kumara" : "Aurudu Kumariya";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background:
          "linear-gradient(135deg, #1f0a12 0%, #3c111a 55%, #1a070d 100%)",
        color: "#fff7ed",
        padding: "28px",
        gap: "28px",
      }}
    >
      <div
        style={{
          width: "470px",
          height: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.18)",
          display: "flex",
        }}
      >
        <img
          src={contestant.image_url}
          alt={contestant.name}
          width={470}
          height={630}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            Wasantha Muwadora 2026
          </div>

          <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 900 }}>
            {contestant.name}
          </div>

          <div
            style={{
              fontSize: 30,
              lineHeight: 1.2,
              opacity: 0.9,
            }}
          >
            {categoryLabel}
          </div>

          <div
            style={{
              fontSize: 26,
              lineHeight: 1.35,
              opacity: 0.85,
            }}
          >
            Support your favorite contestant and cast your vote today.
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            width: "fit-content",
            padding: "12px 26px",
            borderRadius: "999px",
            background: "rgba(251,191,36,0.18)",
            border: "1px solid rgba(251,191,36,0.45)",
            color: "#fef3c7",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          Cast Your Vote Now
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
