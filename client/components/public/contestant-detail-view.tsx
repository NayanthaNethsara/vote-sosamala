import Image from "next/image";

import { ContestantShareButton } from "@/components/public/contestant-share-button";
import { ContestantVoteButton } from "@/components/public/contestant-vote-button";
import type { Contestant } from "@/types/contestant";
import { GridDecoration } from "./page-deco";

interface ContestantDetailViewProps {
  contestant: Contestant;
  slug: string;
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

function calculateAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasNotHadBirthdayYetThisYear =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());

  if (hasNotHadBirthdayYetThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getContestantDescription(contestant: Contestant): string {
  const age = calculateAge(contestant.dateOfBirth);
  const yearLabel = getOrdinalYear(contestant.academicYear);
  const semesterLabel = contestant.semester;

  const specializationOptions = [
    "full-stack engineering",
    "AI and machine learning",
    "data engineering",
    "cybersecurity",
    "cloud-native development",
  ];
  const activityOptions = [
    "participates in hackathons and coding competitions",
    "enjoys mentoring juniors in programming clubs",
    "builds practical open-source tools for students",
    "explores UI/UX ideas and rapid product prototyping",
    "focuses on solving real-world problems with software",
  ];

  const seed = stableHash(`${contestant.id}:${contestant.name}`);
  const specialization =
    specializationOptions[seed % specializationOptions.length];
  const activity = activityOptions[(seed >> 3) % activityOptions.length];

  const ageText = age !== null ? `${age}-year-old ` : "";

  return `${contestant.name} is a ${ageText}${yearLabel} year, ${semesterLabel} semester undergraduate reading BSc (Hons) in Computer Science at the Faculty of Computing. The contestant has a strong interest in ${specialization} and ${activity}.`;
}

export function ContestantDetailView({
  contestant,
  slug,
  shareBasePath,
}: ContestantDetailViewProps) {
  const yearSemesterLabel = `${getOrdinalYear(contestant.academicYear)} Year ${contestant.semester} Semester`;
  const contestantDescription = getContestantDescription(contestant);

  return (
    <main className="vote-shell relative min-h-screen overflow-hidden text-foreground">
      <GridDecoration />

      <section className="relative container mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <div className="mx-auto w-64 sm:w-72 lg:mx-0 lg:w-full">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "3 / 4",
              }}
            >
              <Image
                src={contestant.photoURL ?? "/logo/logo.png"}
                alt={contestant.name}
                fill
                sizes="(max-width: 1024px) 288px, 300px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          <article className="vote-panel space-y-6 rounded-[28px] p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="vote-pill px-3! py-1! font-bold text-foreground! tracking-[0.16em]!">
                Contestant Profile
              </span>
              <span className="vote-pill max-w-xs truncate px-3! py-1! text-foreground/80! tracking-[0.16em]!">
                {getFacultyLabel(contestant)}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="vote-heading text-balance text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
                {contestant.name}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-foreground/88 sm:text-lg">
                {contestantDescription}
              </p>
            </div>

            <dl className="space-y-0">
              <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3">
                <dt className="vote-kicker tracking-[0.18em]! text-muted-foreground!">
                  Date of Birth
                </dt>
                <dd className="text-right text-sm font-medium text-foreground sm:text-base">
                  {formatDate(contestant.dateOfBirth)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="vote-kicker tracking-[0.18em]! text-muted-foreground!">
                  Year &amp; Semester
                </dt>
                <dd className="text-right text-sm font-medium text-foreground sm:text-base">
                  {yearSemesterLabel}
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-1 items-end gap-3 pt-1 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="w-full">
                <ContestantVoteButton contestantId={contestant.id} />
              </div>
              <ContestantShareButton
                name={contestant.name}
                slug={slug}
                basePath={shareBasePath}
                className="h-12 w-full sm:w-auto sm:min-w-36"
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
