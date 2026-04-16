import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export async function generateStaticParams() {
  const contestants = await getAllPublicContestants();

  return contestants.map((contestant) => ({
    slug: createContestantSlug(contestant.name, contestant.id),
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#27272a_0%,#18181b_35%,#09090b_100%)] px-4 py-10 text-zinc-100 sm:px-6 lg:px-10">
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/25 bg-white/[0.08]">
          <Image
            src={contestant.photoURL ?? "/logo/logo.png"}
            alt={contestant.name}
            fill
            loading="eager"
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 22rem"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        </div>

        <div className="space-y-6 rounded-[28px] border border-white/20 bg-white/[0.05] p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">
              Contestant Profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {contestant.name}
            </h1>
            <p className="mt-2 text-zinc-300">
              {contestant.academicYear} • {contestant.semester}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-black/20 p-4">
              <dt className="text-zinc-400">Gender</dt>
              <dd className="mt-1 capitalize text-zinc-100">
                {contestant.gender}
              </dd>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/20 p-4">
              <dt className="text-zinc-400">Date of Birth</dt>
              <dd className="mt-1 text-zinc-100">{contestant.dateOfBirth}</dd>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/20 p-4">
              <dt className="text-zinc-400">Student ID</dt>
              <dd className="mt-1 text-zinc-100">
                {contestant.studentId ?? "-"}
              </dd>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/20 p-4">
              <dt className="text-zinc-400">NIC</dt>
              <dd className="mt-1 text-zinc-100">{contestant.nic ?? "-"}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={
                contestant.gender.toLowerCase() === "female" ? "/ms" : "/mr"
              }
              className="inline-flex h-9 items-center justify-center rounded-none border border-white/20 bg-white/10 px-4 text-xs font-medium text-zinc-100 transition hover:bg-white/20"
            >
              Back to Contestants
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
