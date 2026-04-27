import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { siteConfig } from "@/config/site-config";

const publicCategories = [
  {
    href: "/male",
    title: "Aurudu Kumara",
    description:
      "Vote for your favorite contestant for the Aurudu Kumara title. Support their journey to become the pride of the season.",
  },
  {
    href: "/female",
    title: "Aurudu Kumariya",
    description:
      "Choose the most graceful Aurudu Kumariya contestant and cast your vote to help her win the crown.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen px-4 py-10 text-amber-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <Badge className="w-fit self-center border border-amber-200/30 bg-amber-100/10 text-amber-100">
            {siteConfig.name} 2026
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Choose your winners for Wasantha Muwadora.
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-amber-100/75 sm:text-base">
            Be a part of the tradition. Cast your vote for the contestants who best embody the spirit and grace of the season.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {publicCategories.map((category) => (
            <Card
              key={category.href}
              className="border-amber-200/20 bg-amber-50/6 text-amber-50 shadow-2xl shadow-black/25 backdrop-blur transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-amber-50/10"
            >
              <CardContent className="flex flex-col h-full space-y-6 p-6">
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-amber-200/90">
                      Competition
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight">
                      {category.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-6 text-amber-100/75">
                    {category.description}
                  </p>
                </div>
                <Button
                  asChild
                  className="h-12 w-full border border-amber-200/20 bg-amber-50/10 text-amber-50 hover:bg-amber-50/20 backdrop-blur-xl transition-all font-semibold"
                >
                  <Link href={category.href}>Open Category</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
