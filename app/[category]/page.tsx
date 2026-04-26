import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoteCountBadge } from "@/components/votes/vote-count-badge";
import { getContestantsByCategoryAction } from "@/app/actions/public/contestant-actions";
import { contestantCategories, isContestantCategory } from "@/lib/contestants";

export const dynamicParams = true;

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#020617_0%,#020617_60%,#0f172a_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit bg-white/10 text-white">Category</Badge>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {category} contestants
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/65 sm:text-base">
                Browse the active contestants in this category. Profile data is
                cached, while vote counts refresh on each load.
              </p>
            </div>
          </div>

          <Button asChild variant="secondary" className="w-fit">
            <Link href="/">Back home</Link>
          </Button>
        </header>

        {contestants.length === 0 ? (
          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardContent className="p-8 text-sm text-white/65">
              No active contestants are available in this category yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {contestants.map((contestant, index) => {
              return (
                <Card
                  key={contestant.id}
                  className="group overflow-hidden border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/8"
                >
                  <Link
                    href={`/${category}/${contestant.slug}`}
                    className="block h-full"
                  >
                    <div className="relative aspect-4/4 overflow-hidden bg-slate-900/80">
                      <Image
                        src={contestant.image_url}
                        alt={contestant.name}
                        width={800}
                        height={800}
                        sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/10 to-transparent" />
                      <div className="absolute left-4 top-4 flex gap-2">
                        <Badge className="bg-black/55 text-white">
                          {contestant.category}
                        </Badge>
                        <VoteCountBadge contestantId={contestant.id} />
                      </div>
                    </div>

                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {contestant.name}
                        </h2>
                        <p className="text-sm text-white/65">
                          {contestant.faculty}
                        </p>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-white/70">
                        {contestant.bio}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs uppercase tracking-[0.3em] text-white/45">
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
