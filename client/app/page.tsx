import { ContestantsShowcase } from "@/components/public/contestants-showcase";
import { PublicAuthCta } from "@/components/public/public-auth-cta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicContestantsPage } from "@/lib/public-contestants";
import type {
  Contestant,
  PublicContestantListResponse,
} from "@/types/contestant";

export const revalidate = 120;

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const limitParam = Array.isArray(params.limit)
    ? params.limit[0]
    : params.limit;

  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const requestedLimit = Number.parseInt(limitParam ?? "12", 10);

  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 12;

  let contestants: Contestant[] = [];
  let pagination: PublicContestantListResponse["pagination"] = {
    page,
    limit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };
  let fetchError: string | null = null;

  try {
    const payload = await getPublicContestantsPage(page, limit);
    contestants = payload.contestants;
    pagination = payload.pagination;
  } catch {
    fetchError = "The contestant feed is temporarily unavailable.";
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative isolate overflow-hidden border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:py-20">
          <div className="space-y-6 text-center">
            <Badge variant="outline" className="uppercase tracking-widest">
              Public Contestants Board
            </Badge>
            <h1 className="text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              Sosamala Voting
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Browse all registered contestants, filter by category, and stay up
              to date with a feed optimized for speed.
            </p>
            <PublicAuthCta />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
        {fetchError ? (
          <Card>
            <CardContent className="p-4 text-destructive">
              <p className="text-sm">{fetchError}</p>
            </CardContent>
          </Card>
        ) : (
          <ContestantsShowcase
            contestants={contestants}
            pagination={pagination}
          />
        )}
      </section>
    </main>
  );
}
