import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const publicCategories = [
  {
    href: "/male",
    title: "Male",
    description:
      "Browse the current male contestant list and open each profile.",
  },
  {
    href: "/female",
    title: "Female",
    description:
      "Browse the current female contestant list and open each profile.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#020617_55%,#0f172a_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <Badge className="w-fit self-center bg-white/10 text-white">
            Sosamala Voting
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Pick a category and explore the contestants.
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-white/65 sm:text-base">
            Public contestant pages are cached for speed, while vote counts are
            refreshed on each page load.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {publicCategories.map((category) => (
            <Card
              key={category.href}
              className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-400/30"
            >
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
                    Category
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {category.title}
                  </h2>
                </div>
                <p className="text-sm leading-6 text-white/70">
                  {category.description}
                </p>
                <Button asChild className="w-fit">
                  <Link href={category.href}>Open category</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
