import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuruduBackdrop } from "@/components/public/aurudu-backdrop";
import { Badge } from "@/components/ui/badge";
import { LoginModal } from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteSubmitButton } from "../../../components/votes/vote-submit-button";
import {
  getContestantByCategoryAndSlugAction,
  getContestantVoteStatsAction,
} from "@/app/actions/public/contestant-actions";
import { voteForContestantAction } from "@/app/actions/public/vote-actions";
import { isContestantCategory } from "@/lib/contestants";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

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
  const user = await getAuthenticatedUser();
  const feedbackMessage = queryParams.error ?? queryParams.message;
  const isErrorFeedback = Boolean(queryParams.error);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(160deg,#24080f_0%,#40101a_45%,#27080f_100%)] px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <AuruduBackdrop />
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
          variant="secondary"
          className="w-fit border border-amber-200/25 bg-amber-100/10 text-amber-50 hover:bg-amber-100/20"
        >
          <Link href={`/${category}`}>Back to {category}</Link>
        </Button>

        <Card className="overflow-hidden border-amber-200/20 bg-amber-50/6 text-amber-50 shadow-2xl shadow-black/25 backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="relative min-h-105 bg-[#2d0f15]/80">
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
                  <Badge className="bg-amber-100/15 text-amber-100">
                    {contestant.category}
                  </Badge>
                  <Badge className="bg-[#a16207] text-amber-50">
                    {voteStats.voteCount} votes
                  </Badge>
                  <Badge className="bg-amber-100/15 text-amber-100">
                    {voteStats.rank > 0 ? `#${voteStats.rank}` : "-"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    {contestant.name}
                  </h1>
                  <p className="text-sm text-amber-100/75 sm:text-base">
                    {contestant.faculty}
                  </p>
                </div>
              </div>

              <p className="max-w-3xl text-base leading-7 text-amber-100/80">
                {contestant.bio}
              </p>

              {user ? (
                <div className="space-y-3">
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
                    <VoteSubmitButton contestantName={contestant.name} />
                  </form>

                  <div className="min-h-11">
                    {feedbackMessage ? (
                      <div
                        className={`rounded-xl border px-4 py-3 text-sm backdrop-blur ${
                          isErrorFeedback
                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                            : "border-amber-300/40 bg-amber-200/10 text-amber-100"
                        }`}
                        role="status"
                        aria-live="polite"
                      >
                        {feedbackMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <LoginModal
                  nextPath={`/${category}/${contestant.slug}`}
                  triggerLabel="Vote to login"
                  triggerSize="default"
                />
              )}

              <div className="grid gap-4 rounded-3xl border border-amber-200/15 bg-[#1f0b11]/35 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100/60">
                    Student ID
                  </p>
                  <p className="mt-2 text-sm text-amber-50">
                    {contestant.student_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100/60">
                    Academic year
                  </p>
                  <p className="mt-2 text-sm text-amber-50">
                    {contestant.academic_year ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100/60">
                    Slug
                  </p>
                  <p className="mt-2 font-mono text-sm text-amber-200">
                    {contestant.slug}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100/60">
                    Public image
                  </p>
                  <p className="mt-2 font-mono text-sm text-amber-200">
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
