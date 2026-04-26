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
    <div className="relative min-h-screen px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <Badge className="w-fit self-center border border-amber-200/30 bg-amber-100/10 text-amber-100">
            Sosamala Voting
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Pick a category and explore the contestants.
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-amber-100/75 sm:text-base">
            Public contestant pages are cached for speed, while vote counts are
            refreshed on each page load.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {publicCategories.map((category) => (
            <Card
              key={category.href}
              className="border-amber-200/20 bg-amber-50/6 text-amber-50 shadow-2xl shadow-black/25 backdrop-blur transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-amber-50/10"
            >
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-200/90">
                    Category
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {category.title}
                  </h2>
                </div>
                <p className="text-sm leading-6 text-amber-100/75">
                  {category.description}
                </p>
                <Button
                  asChild
                  className="w-fit bg-[#7f1d2d] text-amber-50 hover:bg-[#97233a]"
                >
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
