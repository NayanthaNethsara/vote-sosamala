import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { SplashIntro } from "@/components/splash-intro";

const publicCategories = [
  {
    href: "/male",
    eyebrow: "Category I",
    title: "Aurudu Kumara",
    sinhala: "අවුරුදු කුමාරයා",
    description:
      "The young prince of the new year — poised, graceful and rooted in heritage.",
  },
  {
    href: "/female",
    eyebrow: "Category II",
    title: "Aurudu Kumariya",
    sinhala: "අවුරුදු කුමාරිය",
    description:
      "The radiant princess of the dawn — embodying tradition, charm and elegance.",
  },
];

export default function HomePage() {
  return (
    <>
      <SplashIntro />

      <div className="relative px-4 py-12 text-amber-50 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          {/* Hero / Title */}
          <header className="flex flex-col items-center gap-5 text-center">
            <h1 className="text-balance font-mono text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
              <span className="block text-[0.72em] uppercase tracking-[0.32em] text-amber-100/80">
                Wasantha Muwadora
              </span>
              <span className="mt-3 block bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 bg-clip-text font-semibold normal-case tracking-tight text-transparent">
                Aurudu Kumara &amp; Kumariya
              </span>
            </h1>

            <p className="max-w-xl text-pretty text-sm leading-relaxed text-amber-100/65 sm:text-base">
              A celebration of culture, tradition and the bright spirit of the
              Sinhala &amp; Tamil New Year. Meet our contestants, learn their
              stories, and cast your vote for the prince and princess of Aurudu.
            </p>

            <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-amber-200/55">
              <span className="h-px w-10 bg-amber-200/30" />
              <span>Ayubowan</span>
              <span className="h-px w-10 bg-amber-200/30" />
            </div>
          </header>

          {/* Categories */}
          <section
            aria-label="Categories"
            className="grid gap-4 sm:grid-cols-2"
          >
            {publicCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group flex flex-col gap-3 rounded-2xl border border-amber-200/15 bg-[#2a0a12]/70 p-5 transition-all hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-[#350c16]/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-amber-200/75">
                      {category.eyebrow}
                    </span>
                    <span className="font-mono text-lg font-semibold leading-tight text-amber-50 sm:text-xl">
                      {category.title}
                    </span>
                    <span className="font-mono text-xs text-amber-200/60">
                      {category.sinhala}
                    </span>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200/25 text-amber-200/85 transition-all group-hover:border-amber-300/60 group-hover:text-amber-100">
                    <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                <p className="text-pretty text-xs leading-relaxed text-amber-100/65 sm:text-[13px]">
                  {category.description}
                </p>

                <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-amber-200/55">
                  <span className="h-px w-6 bg-amber-200/30" />
                  <span>View Contestants</span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
