"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import type { ColumnDef } from "@tanstack/react-table";

import { useLeaderboardResults } from "@/hooks/use-leaderboard-results";
import { buildHydratedLeaderboardRows } from "@/lib/utils/leaderboard";
import type { Contestant } from "@/types/contestant";

type HydratedResultRow = ReturnType<
  typeof buildHydratedLeaderboardRows
>[number];

interface ResultsBoardProps {
  contestants: Contestant[];
}

const resultColumns: ColumnDef<HydratedResultRow>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    size: 80,
    cell: ({ row }) => {
      const rank = row.original.rank;
      if (rank === null) {
        return <span className="text-muted-foreground">-</span>;
      }

      if (rank <= 3) {
        return (
          <Badge variant="default" className="font-semibold tabular-nums">
            #{rank}
          </Badge>
        );
      }

      return <span className="font-medium tabular-nums">#{rank}</span>;
    },
  },
  {
    id: "contestant",
    header: "Contestant",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 border">
            <AvatarImage
              src={item.photoURL}
              alt={item.name}
              className="object-cover"
            />
            <AvatarFallback className="text-xs font-medium">
              {item.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{item.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.studentId ?? item.contestantId}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "votes",
    header: "Votes",
    size: 100,
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">{row.original.votes}</span>
    ),
  },
  {
    accessorKey: "academicYear",
    header: "Academic Year",
    cell: ({ row }) => row.original.academicYear,
  },
  {
    accessorKey: "semester",
    header: "Semester",
    cell: ({ row }) => row.original.semester,
  },
];

function searchResultRows(
  row: { original: HydratedResultRow },
  _columnId: string,
  filterValue: string,
): boolean {
  const search = filterValue.toLowerCase();
  const resultRow = row.original;

  return (
    resultRow.name.toLowerCase().includes(search) ||
    resultRow.contestantId.toLowerCase().includes(search) ||
    (resultRow.studentId?.toLowerCase().includes(search) ?? false)
  );
}

export function ResultsBoard({ contestants }: ResultsBoardProps) {
  const { results, error } = useLeaderboardResults({ limit: 100 });

  const rows = useMemo(
    () => buildHydratedLeaderboardRows(contestants, results),
    [contestants, results],
  );

  const totalVotes = useMemo(
    () => rows.reduce((sum, row) => sum + row.votes, 0),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Votes
          </p>
          <p className="text-2xl font-bold tabular-nums">{totalVotes}</p>
        </div>
        <div className="border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Ranked Candidates
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {rows.filter((row) => row.rank !== null).length}
          </p>
        </div>
        <div className="border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Contestants
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {contestants.length}
          </p>
        </div>
      </div>

      <DataTable
        columns={resultColumns}
        data={rows}
        searchPlaceholder="Search by name, candidate ID, or student ID..."
        globalFilterFn={searchResultRows}
      />

      {error ? (
        <p className="text-xs text-amber-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
