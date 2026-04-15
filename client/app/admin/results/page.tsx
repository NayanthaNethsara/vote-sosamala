"use client";

import { CheckSquareOffset } from "@phosphor-icons/react";

export default function ResultsAdminPage() {
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
      <div className="border bg-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <CheckSquareOffset size={48} className="text-muted-foreground/30" />
        <div>
          <p className="font-semibold text-lg">Results Board</p>
          <p className="text-muted-foreground text-sm">
            Real-time statistics will populate here once voting begins.
          </p>
        </div>
      </div>
    </div>
  );
}
