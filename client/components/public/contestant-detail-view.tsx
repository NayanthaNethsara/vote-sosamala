import Image from "next/image";
import Link from "next/link";

import { ContestantShareButton } from "@/components/public/contestant-share-button";
import { ContestantVoteButton } from "@/components/public/contestant-vote-button";
import type { Contestant } from "@/types/contestant";
import { GridDecoration } from "./page-deco";

interface ContestantDetailViewProps {
  contestant: Contestant;
  slug: string;
  backHref: string;
  shareBasePath: string;
}

function getFacultyLabel(contestant: {
  studentId?: string;
  nic?: string;
}): string {
  const studentIdPrefix = contestant.studentId?.trim().slice(0, 2);
  if (studentIdPrefix) {
    return studentIdPrefix.toUpperCase();
  }

  const nicSuffix = contestant.nic?.trim().slice(-4);
  if (nicSuffix) {
    return `NIC ${nicSuffix}`;
  }

  return "General";
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getOrdinalYear(value: string): string {
  const year = Number.parseInt(value, 10);

  if (Number.isNaN(year)) {
    return value;
  }

  const suffix =
    year % 100 >= 11 && year % 100 <= 13
      ? "th"
      : (["th", "st", "nd", "rd"][year % 10] ?? "th");

  return `${year}${suffix}`;
}

export function ContestantDetailView({
  contestant,
  slug,
  backHref,
  shareBasePath,
}: ContestantDetailViewProps) {
  return (
    <main className="vote-shell relative min-h-screen overflow-hidden text-foreground">
      <GridDecoration />
      <section className="relative container mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start">
          <div className="mx-auto w-64 shrink-0 sm:w-72 md:mx-0">
            <div
              className="vote-panel-strong relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "3 / 4",
              }}
            >
              <Image
                src={contestant.photoURL ?? "/logo/logo.png"}
                alt={contestant.name}
                fill
                sizes="288px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="vote-pill px-3! py-1! font-bold text-foreground! tracking-[0.16em]!">
                Contestant Profile
              </span>
              <span className="vote-pill max-w-xs truncate px-3! py-1! text-foreground/80! tracking-[0.16em]!">
                {getFacultyLabel(contestant)}
              </span>
            </div>

            <h1 className="vote-heading text-balance text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              {contestant.name}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {getOrdinalYear(contestant.academicYear)} year,{" "}
              {contestant.semester} semester contestant profile.
            </p>

            <dl className="flex flex-col">
              <div className="flex items-center justify-between border-b border-border/70 py-3">
                <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDate(contestant.dateOfBirth)}
                </dd>
              </div>
              <div className="flex items-center justify-between pt-3">
                <dt className="text-sm text-muted-foreground">
                  Year &amp; Semester
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {getOrdinalYear(contestant.academicYear)} Year{" "}
                  {contestant.semester} Semester
                </dd>
              </div>
            </dl>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="vote-panel rounded-2xl p-4">
                <dt className="vote-kicker tracking-[0.18em]! text-muted-foreground!">
                  Student ID
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">
                  {contestant.studentId ?? "-"}
                </dd>
              </div>
              <div className="vote-panel rounded-2xl p-4">
                <dt className="vote-kicker tracking-[0.18em]! text-muted-foreground!">
                  NIC
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">
                  {contestant.nic ?? "-"}
                </dd>
              </div>
            </div>

            <div className="flex flex-wrap items-stretch gap-3 pt-1">
              <div className="w-full sm:w-auto sm:min-w-56">
                <ContestantVoteButton contestantId={contestant.id} />
              </div>
              <Link
                href={backHref}
                className="glass-button inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-medium"
              >
                Back to Contestants
              </Link>
              <ContestantShareButton
                name={contestant.name}
                slug={slug}
                basePath={shareBasePath}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
