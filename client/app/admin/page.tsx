"use client";

import { SquaresFour } from "@phosphor-icons/react";

export default function AdminDashboardPage() {
  return (
    <div className="py-10 px-6 sm:px-8 max-w-5xl mx-auto space-y-8 font-mono">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of the voting system.
        </p>
      </div>
      <div className="border bg-card p-12 flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <SquaresFour size={48} className="text-muted-foreground/30" />
        <div>
          <p className="font-semibold text-lg">System Dashboard</p>
          <p className="text-muted-foreground text-sm">
            Metrics and overview will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
