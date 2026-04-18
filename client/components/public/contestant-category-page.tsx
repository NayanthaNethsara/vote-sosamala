"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

import { useLeaderboardResults } from "@/hooks/use-leaderboard-results";
import { ContestantCard } from "@/components/ui/contestant-card";
import { createContestantSlug } from "@/lib/utils/contestant-slug";
import {
  formatVotesLabel,
  mapContestantsWithLeaderboard,
  sortContestantLeaderboardRows,
} from "@/lib/utils/leaderboard";
import type { Contestant } from "@/types/contestant";

interface ContestantCategoryPageProps {
  badgeLabel: string;
  title: string;
  description: string;
  contestants: Contestant[];
  showLiveResults?: boolean;
  detailBasePath: string;
}

export function ContestantCategoryPage({
  badgeLabel,
  title,
  description,
  contestants,
  showLiveResults = false,
  detailBasePath,
}: ContestantCategoryPageProps) {
  const { results } = useLeaderboardResults({
    limit: 200,
    enabled: showLiveResults,
  });

  const contestantRows = useMemo(
    () =>
      showLiveResults
        ? sortContestantLeaderboardRows(
            mapContestantsWithLeaderboard(contestants, results),
          )
        : contestants.map((contestant) => ({
            contestant,
            rank: null,
            votes: 0,
          })),
    [contestants, results, showLiveResults],
  );

  return (
    <main className="vote-shell min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-7xl space-y-8">
        <header className="space-y-4 py-2">
          <p className="vote-kicker text-foreground/70! tracking-[0.2em]!">
            {badgeLabel}
          </p>
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="vote-section-title max-w-5xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-xl text-sm text-muted-foreground sm:text-base"
            >
              {description}
            </motion.p>
          </div>
        </header>

        <div className="vote-panel p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-4 justify-items-center sm:justify-items-start md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {contestantRows.map(({ contestant, rank, votes }, index) => (
              <ContestantCard
                key={contestant.id}
                name={contestant.name}
                title={badgeLabel}
                subtitle={`${contestant.academicYear} • ${contestant.semester}`}
                votesLabel={
                  showLiveResults
                    ? formatVotesLabel(rank, votes)
                    : (contestant.studentId ?? "Student contestant")
                }
                imageUrl={contestant.photoURL ?? "/logo/logo.png"}
                href={`${detailBasePath}/${createContestantSlug({
                  id: contestant.id,
                  name: contestant.name,
                  studentId: contestant.studentId,
                  nic: contestant.nic,
                })}`}
                eager={index === 0}
                className="w-full"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
