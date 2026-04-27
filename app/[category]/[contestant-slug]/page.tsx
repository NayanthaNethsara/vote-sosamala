import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { LoginButton } from "@/components/auth/login-button";
import { ContestantShareButton } from "@/components/public/contestant-share-button";
import { FeedbackToast } from "@/components/public/feedback-toast";
import { SpinningMandala } from "@/components/background/spinning-mandala";
import { VoteSubmitButton } from "../../../components/votes/vote-submit-button";
import {
  getContestantByCategoryAndSlugAction,
  getContestantVoteStatsAction,
} from "@/app/actions/public/contestant-actions";
import { voteForContestantAction } from "@/app/actions/public/vote-actions";
import { isContestantCategory } from "@/lib/contestants";
import {
  getAuthenticatedUser,
  hasAuthenticatedUserVotedInCategory,
} from "@/lib/supabase/auth";
import { siteConfig } from "@/config/site-config";

function getOrdinalYear(value: string | null): string {
  if (!value) return "";
  const year = Number.parseInt(value, 10);
  if (Number.isNaN(year)) return value;
  const suffix =
    year % 100 >= 11 && year % 100 <= 13
      ? "th"
      : (["th", "st", "nd", "rd"][year % 10] ?? "th");
  return `${year}${suffix}`;
}

function generateFirstPersonBio(contestant: {
  name: string;
  faculty: string;
  academic_year: string | null;
  category: string;
}) {
  const yearLabel = getOrdinalYear(contestant.academic_year);
  const yearStr = yearLabel ? `a ${yearLabel}-year student` : "a student";

  return `Ayubowan! I'm ${contestant.name}, ${yearStr} from the ${contestant.faculty}, and it’s that time of the year again. I’m competing for the Aurudu ${contestant.category === "male" ? "Kumara" : "Kumariya"} title at this year's Wasantha Muwadura. Whether we've worked together, crammed for exams, or just crossed paths on campus, I'd love your support. Cast your vote for me below, and let’s celebrate the New Year!`;
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
    return {};
  }

  const contestant = await getContestantByCategoryAndSlugAction(
    category,
    contestantSlug,
  );

  if (!contestant) {
    return {};
  }

  const pageUrl = `${siteConfig.url}/${category}/${contestant.slug}`;
  const title = `${contestant.name} - Vote Now!`;
  const description =
    contestant.bio?.trim() ||
    `Support ${contestant.name} in the ${category} category and cast your vote now.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: contestant.image_url,
          width: 1200,
          height: 630,
          alt: `${contestant.name}'s vote banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [contestant.image_url],
    },
  };
}

import { ProtectedImage } from "@/components/public/protected-image";

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
  const cookieStore = await cookies();
  const hasDeviceVoteCookie = Boolean(
    cookieStore.get(`vote_device_${category}`)?.value,
  );
  const userVotedInCategory =
    user && !hasDeviceVoteCookie
      ? await hasAuthenticatedUserVotedInCategory(category)
      : false;
  const isVoteUiDisabled = userVotedInCategory || hasDeviceVoteCookie;

  const voteDisabledLabel = userVotedInCategory
    ? "Already Voted"
    : hasDeviceVoteCookie
      ? "Device Voted"
      : undefined;

  return (
    <div className="vote-shell relative px-4 py-10 sm:px-6 lg:px-8">
      <FeedbackToast error={queryParams.error} message={queryParams.message} />
      <section className="relative z-10 container mx-auto max-w-5xl">
        <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch">
          {/* Left: Image Panel */}
          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
            <div className="vote-panel aspect-[4/5] p-2 transition-all hover:bg-amber-50/10">
              <ProtectedImage
                src={contestant.image_url}
                alt={contestant.name}
                fill
                containerClassName="rounded-2xl bg-[#2d0f15]/80"
                sizes="(max-width: 1024px) 384px, 540px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          {/* Right: Details Panel */}
          <article className="vote-panel-strong relative overflow-hidden p-5 sm:p-7 lg:aspect-[4/5]">
            <SpinningMandala />
            <div className="relative z-10 flex h-full flex-col space-y-6 lg:space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                {voteStats.rank > 0 && (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-xl ${
                      voteStats.rank === 1
                        ? "border-yellow-400/50 bg-yellow-400/20 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                        : voteStats.rank === 2
                          ? "border-slate-300/50 bg-slate-300/20 text-slate-200 shadow-[0_0_15px_rgba(203,213,225,0.2)]"
                          : voteStats.rank === 3
                            ? "border-amber-600/50 bg-amber-600/20 text-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                            : "border-amber-200/15 bg-amber-50/10 text-amber-50"
                    }`}
                  >
                    Rank #{voteStats.rank}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-[#a16207]/40 bg-[#a16207]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur-xl">
                  {voteStats.voteCount} Votes
                </span>
              </div>

              <div className="space-y-4 flex-1">
                <h1 className="vote-heading text-balance text-2xl leading-tight text-amber-50 sm:text-4xl">
                  {contestant.name}
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-amber-100/80 sm:text-base">
                  {generateFirstPersonBio(contestant)}
                </p>
              </div>

              <div className="grid grid-cols-1 items-start gap-3 pt-1 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="w-full">
                  {user ? (
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
                      <VoteSubmitButton
                        contestantName={contestant.name}
                        className="h-12 w-full text-base font-semibold"
                        disabled={isVoteUiDisabled}
                        disabledLabel={voteDisabledLabel}
                      />
                    </form>
                  ) : (
                    <LoginButton
                      nextPath={`/${category}/${contestant.slug}`}
                      label="Login to vote"
                      size="default"
                      className="h-12 w-full text-base font-semibold border border-amber-200/20 bg-amber-50/10 text-amber-50 hover:bg-amber-50/20 backdrop-blur-xl transition-all"
                    />
                  )}
                </div>
                <ContestantShareButton
                  name={contestant.name}
                  path={`/${category}/${contestant.slug}`}
                  className="h-12 w-full sm:w-auto sm:min-w-36"
                />
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
