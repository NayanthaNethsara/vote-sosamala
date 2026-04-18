import { getAllPublicContestants } from "@/lib/public-contestants";
import { ResultsBoard } from "@/components/admin/results-board";

export default async function ResultsAdminPage() {
  const contestants = await getAllPublicContestants(100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">
          Vote Results
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitor live voting results and analytics.
        </p>
      </div>

      <ResultsBoard contestants={contestants} />
    </div>
  );
}
