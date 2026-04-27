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

  const displayCategory = category === "male" ? "Kumaraya" : "Kumariya";

  return (
    <div className="relative min-h-screen px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Aurudu {displayCategory} 2026
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-amber-100/75 sm:text-base">
                All active Aurudu {displayCategory} for SLIIT Wasantha Udanaya
                2026. Support your favorites by casting your vote below!
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
                    <div className="relative aspect-square overflow-hidden bg-[#2d0f15]/80">
                      <Image
                        src={contestant.image_url}
                        alt={contestant.name}
                        width={800}
                        height={800}
                        sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent transition-opacity duration-500 group-hover:from-black/70" />

                      {/* Top Badges */}
                      <div className="absolute left-4 top-4 flex gap-2">
                        <Badge className="border-none bg-[#a16207]/80 text-amber-50 backdrop-blur-md shadow-lg">
                          {stats.voteCount} votes
                        </Badge>
                        <Badge className="border-none bg-black/40 text-amber-100 backdrop-blur-md shadow-lg">
                          {stats.rank > 0 ? `Rank #${stats.rank}` : "-"}
                        </Badge>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-6 pt-20">
                        <h2 className="text-2xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-amber-200">
                          {contestant.name}
                        </h2>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200/60 transition-colors duration-300 group-hover:text-amber-200/90">
                          {contestant.faculty}
                        </p>
                      </div>
                    </div>
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
