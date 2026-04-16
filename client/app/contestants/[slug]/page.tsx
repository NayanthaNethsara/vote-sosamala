import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContestantShareButton } from "@/components/public/contestant-share-button";
import {
  getAllPublicContestants,
  getPublicContestantBySlug,
} from "@/lib/public-contestants";
import { createContestantSlug } from "@/lib/utils/contestant-slug";

interface ContestantDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
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

export async function generateStaticParams() {
  const contestants = await getAllPublicContestants();

  return contestants.map((contestant) => ({
    slug: createContestantSlug({
      id: contestant.id,
      name: contestant.name,
      studentId: contestant.studentId,
      nic: contestant.nic,
    }),
  }));
}

export default async function ContestantDetailPage({
  params,
}: ContestantDetailPageProps) {
  const { slug } = await params;
  const contestant = await getPublicContestantBySlug(slug);

  if (!contestant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#18181b_35%,_#09090b_100%)] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <section className="container mx-auto max-w-4xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start">
          <div className="mx-auto w-64 shrink-0 sm:w-72 md:mx-0">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: "3 / 4",
                boxShadow:
                  "0 8px 32px oklch(0.03 0.005 264 / 0.85), 0 0 0 1px oklch(0.25 0.025 264 / 0.35)",
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-md">
                Contestant Profile
              </span>
              <span className="inline-flex max-w-xs items-center truncate rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-zinc-200 backdrop-blur-md">
                {getFacultyLabel(contestant)}
              </span>
            </div>

            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-4xl">
              {contestant.name}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              {getOrdinalYear(contestant.academicYear)} year,{" "}
              {contestant.semester} semester contestant profile.
            </p>

            <dl className="flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 py-3">
                <dt className="text-sm text-zinc-400">Date of Birth</dt>
                <dd className="text-sm font-medium text-zinc-100">
                  {formatDate(contestant.dateOfBirth)}
                </dd>
              </div>
              <div className="flex items-center justify-between pt-3">
                <dt className="text-sm text-zinc-400">Year &amp; Semester</dt>
                <dd className="text-sm font-medium text-zinc-100">
                  {getOrdinalYear(contestant.academicYear)} Year{" "}
                  {contestant.semester} Semester
                </dd>
              </div>
            </dl>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <dt className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Student ID
                </dt>
                <dd className="mt-2 text-sm font-medium text-zinc-100">
                  {contestant.studentId ?? "-"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <dt className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  NIC
                </dt>
                <dd className="mt-2 text-sm font-medium text-zinc-100">
                  {contestant.nic ?? "-"}
                </dd>
              </div>
            </div>

            <div className="flex flex-wrap items-stretch gap-3 pt-1">
              <Link
                href={
                  contestant.gender.toLowerCase() === "female" ? "/ms" : "/mr"
                }
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-medium text-zinc-100 transition hover:bg-white/14"
              >
                Back to Contestants
              </Link>
              <ContestantShareButton name={contestant.name} slug={slug} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
