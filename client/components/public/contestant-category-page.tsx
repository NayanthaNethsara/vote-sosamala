"use client";
import { StarFourIcon } from "@phosphor-icons/react";

import { ContestantCard } from "@/components/ui/contestant-card";
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
      <section className="mx-auto max-8w-xl px-12 space-y-8">
        <header className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
            {description}
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contestants.map((contestant) => (
            <ContestantCard
              key={contestant.id}
              name={contestant.name}
              title={badgeLabel}
              subtitle={`${contestant.academicYear} • ${contestant.semester}`}
              votesLabel={contestant.studentId ?? "Student contestant"}
              imageUrl={contestant.photoURL ?? "/logo/logo.png"}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
