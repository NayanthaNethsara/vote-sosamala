import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
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

      <div className="relative px-4 py-16 text-amber-50 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-14">
          {/* Hero / Title */}
          <header className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-balance font-mono text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              <span className="block text-[0.65em] uppercase tracking-[0.35em] text-amber-200/60">
                Wasantha Muwadora
              </span>
              <span className="mt-4 block bg-gradient-to-b from-amber-50 via-amber-200 to-amber-500 bg-clip-text font-bold normal-case tracking-tighter text-transparent">
                Aurudu Kumara &amp; Kumariya
              </span>
            </h1>

            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-amber-100/70 sm:text-base md:text-lg">
              A celebration of culture, tradition and the bright spirit of the
              Sinhala &amp; Tamil New Year. Meet our contestants, learn their
              stories, and cast your vote for the prince and princess of Aurudu.
            </p>

            <div className="mt-2 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] text-amber-200/40">
              <span className="h-px w-12 bg-linear-to-r from-transparent to-amber-200/20" />
              <span>Ayubowan</span>
              <span className="h-px w-12 bg-linear-to-l from-transparent to-amber-200/20" />
            </div>
          </header>

          {/* Categories */}
          <section
            aria-label="Categories"
            className="grid gap-6 sm:grid-cols-2"
          >
            {publicCategories.map((category) => (
              <Card
                key={category.href}
                className="group overflow-hidden border-amber-200/10 bg-amber-50/5 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-amber-50/8"
              >
                <Link
                  href={category.href}
                  className="flex flex-col gap-4 p-6 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-200/50">
                        {category.eyebrow}
                      </span>
                      <h2 className="font-mono text-2xl font-bold leading-tight text-white sm:text-3xl">
                        {category.title}
                      </h2>
                      <span className="font-mono text-[13px] font-medium tracking-wide text-amber-200/40">
                        {category.sinhala}
                      </span>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/5 text-amber-200/70 transition-all duration-500 group-hover:border-amber-300/50 group-hover:bg-amber-300/10 group-hover:text-amber-100">
                      <IconArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                    </span>
                  </div>

                  <p className="text-pretty text-sm leading-relaxed text-amber-100/60">
                    {category.description}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200/40 transition-colors group-hover:text-amber-200/60">
                    <span className="h-px w-8 bg-amber-200/20 transition-colors group-hover:bg-amber-200/40" />
                    <span>Explore Contestants</span>
                  </div>
                </Link>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
