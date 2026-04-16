"use client";

import { ContestantCard } from "@/components/ui/contestant-card";
import { createContestantSlug } from "@/lib/utils/contestant-slug";
import type { Contestant } from "@/types/contestant";

interface ContestantCategoryPageProps {
  badgeLabel: string;
  title: string;
  description: string;
  contestants: Contestant[];
}

export function ContestantCategoryPage({
  badgeLabel,
  title,
  description,
  contestants,
}: ContestantCategoryPageProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#27272a_0%,#18181b_35%,#09090b_100%)] px-4 py-10 text-zinc-100 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-7xl space-y-8">
        <header className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
            {description}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 justify-items-center sm:justify-items-start md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {contestants.map((contestant, index) => (
            <ContestantCard
              key={contestant.id}
              name={contestant.name}
              title={badgeLabel}
              subtitle={`${contestant.academicYear} • ${contestant.semester}`}
              votesLabel={contestant.studentId ?? "Student contestant"}
              imageUrl={contestant.photoURL ?? "/logo/logo.png"}
              href={`/contestants/${createContestantSlug({
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
      </section>
    </main>
  );
}
