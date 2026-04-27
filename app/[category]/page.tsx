import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCategoryVoteStatsAction,
  getContestantsByCategoryAction,
} from "@/app/actions/public/contestant-actions";
import { contestantCategories, isContestantCategory } from "@/lib/contestants";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return contestantCategories.map((category) => ({ category }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!isContestantCategory(category)) {
    notFound();
  }

  const contestants = await getContestantsByCategoryAction(category);
  const contestantVoteStats = await getCategoryVoteStatsAction(category);

  const rankedContestants = [...contestants].sort((left, right) => {
    const leftVotes = contestantVoteStats[left.id]?.voteCount ?? 0;
    const rightVotes = contestantVoteStats[right.id]?.voteCount ?? 0;

    if (leftVotes !== rightVotes) {
      return rightVotes - leftVotes;
    }

    return left.name.localeCompare(right.name);
  });

  return (
    <div className="relative min-h-screen px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border border-amber-200/30 bg-amber-100/10 text-amber-100">
              Category
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {category} contestants
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-amber-100/75 sm:text-base">
                Browse the active contestants in this category. Profile data is
                cached, while vote counts refresh on each load.
              </p>
            </div>
          </div>
        </header>

        {contestants.length === 0 ? (
          <Card className="border-amber-200/20 bg-amber-50/6 text-amber-50 backdrop-blur">
            <CardContent className="p-8 text-sm text-amber-100/75">
              No active contestants are available in this category yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {rankedContestants.map((contestant, index) => {
              const stats = contestantVoteStats[contestant.id] ?? {
                voteCount: 0,
                rank: 0,
              };

              return (
                <Card
                  key={contestant.id}
                  className="group overflow-hidden border-amber-200/20 bg-amber-50/6 text-amber-50 shadow-2xl shadow-black/25 backdrop-blur transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-amber-50/10"
                >
                  <Link
                    href={`/${category}/${contestant.slug}`}
                    className="block h-full"
                  >
                    <div className="relative aspect-4/4 overflow-hidden bg-[#2d0f15]/80">
                      <Image
                        src={contestant.image_url}
                        alt={contestant.name}
                        width={800}
                        height={800}
                        sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#25090f] via-[#25090f]/10 to-transparent" />
                      <div className="absolute left-4 top-4 flex gap-2">
                        <Badge className="bg-[#2d0f15]/70 text-amber-100">
                          {contestant.category}
                        </Badge>
                        <Badge className="bg-[#a16207] text-amber-50">
                          {stats.voteCount} votes
                        </Badge>
                        <Badge className="bg-amber-100/15 text-amber-100">
                          {stats.rank > 0 ? `#${stats.rank}` : "-"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {contestant.name}
                        </h2>
                        <p className="text-sm text-amber-100/75">
                          {contestant.faculty}
                        </p>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-amber-100/75">
                        {contestant.bio}
                      </p>

                      <div className="flex items-center justify-between border-t border-amber-200/15 pt-4 text-xs uppercase tracking-[0.3em] text-amber-100/55">
                        <span>{contestant.slug}</span>
                        <span>Open profile</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
