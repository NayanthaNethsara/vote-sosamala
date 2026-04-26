import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getContestantByCategoryAndSlugAction,
  getContestantVoteStatsAction,
} from "@/app/actions/public/contestant-actions";
import { voteForContestantAction } from "@/app/actions/public/vote-actions";
import { isContestantCategory } from "@/lib/contestants";

function buildContestantMetaDescription(input: {
  faculty: string;
  academicYear: string | null;
  bio: string | null;
}) {
  const summary = input.bio?.trim() || "View profile and cast your vote.";
  const yearLabel = input.academicYear ? `, ${input.academicYear}` : "";

  return `${input.faculty}${yearLabel}. ${summary}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; "contestant-slug": string }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const category = routeParams.category;
  const contestantSlug = routeParams["contestant-slug"];

  if (!isContestantCategory(category)) {
    return {
      title: "Contestant Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const contestant = await getContestantByCategoryAndSlugAction(
    category,
    contestantSlug,
  );

  if (!contestant) {
    return {
      title: "Contestant Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const profilePath = `/${category}/${contestant.slug}`;
  const description = buildContestantMetaDescription({
    faculty: contestant.faculty,
    academicYear: contestant.academic_year,
    bio: contestant.bio,
  });
  const title = `${contestant.name} | Sosamala Voting`;
  const ogImagePath = `/${category}/${contestant.slug}/opengraph-image?v=${encodeURIComponent(contestant.updated_at)}`;

  return {
    title,
    description,
    alternates: {
      canonical: profilePath,
    },
    openGraph: {
      title,
      description,
      url: profilePath,
      type: "profile",
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: contestant.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath],
    },
  };
}

export default async function ContestantPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; "contestant-slug": string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const category = routeParams.category;
  const contestantSlug = routeParams["contestant-slug"];

  if (!isContestantCategory(category)) {
    notFound();
  }

  const contestant = await getContestantByCategoryAndSlugAction(
    category,
    contestantSlug,
  );

  if (!contestant) {
    notFound();
  }

  const voteStats = await getContestantVoteStatsAction(category, contestant.id);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#020617_0%,#020617_60%,#0f172a_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {(queryParams.message || queryParams.error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur ${
              queryParams.error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {queryParams.error ?? queryParams.message}
          </div>
        )}

        <Button asChild variant="secondary" className="w-fit">
          <Link href={`/${category}`}>Back to {category}</Link>
        </Button>

        <Card className="overflow-hidden border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="relative min-h-105 bg-slate-900/80">
              <Image
                src={contestant.image_url}
                alt={contestant.name}
                width={840}
                height={840}
                sizes="(min-width: 1024px) 420px, 100vw"
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>

            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/10 text-white">
                    {contestant.category}
                  </Badge>
                  <Badge className="bg-emerald-500 text-white">
                    {voteStats.voteCount} votes
                  </Badge>
                  <Badge className="bg-white/10 text-white">
                    {voteStats.rank > 0 ? `#${voteStats.rank}` : "-"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    {contestant.name}
                  </h1>
                  <p className="text-sm text-white/65 sm:text-base">
                    {contestant.faculty}
                  </p>
                </div>
              </div>

              <p className="max-w-3xl text-base leading-7 text-white/75">
                {contestant.bio}
              </p>

              <form
                action={voteForContestantAction}
                className="flex flex-wrap gap-3"
              >
                <input
                  type="hidden"
                  name="contestantId"
                  value={contestant.id}
                />
                <input
                  type="hidden"
                  name="contestantSlug"
                  value={contestant.slug}
                />
                <input type="hidden" name="category" value={category} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/${category}/${contestant.slug}`}
                />
                <Button type="submit">Vote for {contestant.name}</Button>
              </form>

              <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/20 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Student ID
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {contestant.student_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Academic year
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {contestant.academic_year ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Slug
                  </p>
                  <p className="mt-2 font-mono text-sm text-emerald-200">
                    {contestant.slug}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Public image
                  </p>
                  <p className="mt-2 font-mono text-sm text-emerald-200">
                    {contestant.image_url}
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
