"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/data-table";
import type { ColumnDef } from "@tanstack/react-table";

import type { Contestant } from "@/types/contestant";
import type { VoteLeaderboardResponse } from "@/types/vote";

interface HydratedResultRow {
  contestantId: string;
  rank: number | null;
  votes: number;
  name: string;
  photoURL?: string;
  studentId?: string;
  academicYear: string;
  semester: string;
}

interface ResultsBoardProps {
  contestants: Contestant[];
}

function buildHydratedRows(
  contestants: Contestant[],
  leaderboard: VoteLeaderboardResponse["results"],
): HydratedResultRow[] {
  const byContestantId = new Map(
    contestants.map((contestant) => [contestant.id, contestant]),
  );

  const hydratedFromLeaderboard: HydratedResultRow[] = leaderboard.map(
    (entry) => {
      const contestant = byContestantId.get(entry.contestantId);

      return {
        contestantId: entry.contestantId,
        rank: entry.rank,
        votes: entry.votes,
        name: contestant?.name ?? "Unknown Contestant",
        photoURL: contestant?.photoURL,
        studentId: contestant?.studentId,
        academicYear: contestant?.academicYear ?? "-",
        semester: contestant?.semester ?? "-",
      };
    },
  );

  const knownLeaderboardIds = new Set(
    leaderboard.map((entry) => entry.contestantId),
  );

  const missingContestants = contestants
    .filter((contestant) => !knownLeaderboardIds.has(contestant.id))
    .map((contestant) => ({
      contestantId: contestant.id,
      rank: null,
      votes: 0,
      name: contestant.name,
      photoURL: contestant.photoURL,
      studentId: contestant.studentId,
      academicYear: contestant.academicYear,
      semester: contestant.semester,
    }));

  return [...hydratedFromLeaderboard, ...missingContestants].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }

    return a.name.localeCompare(b.name);
  });
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
  const [rows, setRows] = useState<HydratedResultRow[]>(
    buildHydratedRows(contestants, []),
  );
  const [error, setError] = useState<string | null>(null);

  const totalVotes = useMemo(
    () => rows.reduce((sum, row) => sum + row.votes, 0),
    [rows],
  );

  const refreshVolatileResults = useCallback(async () => {
    try {
      const response = await fetch("/api/results?limit=100", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setError("Failed to refresh leaderboard");
        return;
      }

      const payload = (await response.json()) as VoteLeaderboardResponse;
      setRows(buildHydratedRows(contestants, payload.results ?? []));
      setError(null);
    } catch {
      setError("Failed to refresh leaderboard");
    }
  }, [contestants]);

  useEffect(() => {
    const initialFetch = setTimeout(() => {
      void refreshVolatileResults();
    }, 0);

    const interval = setInterval(() => {
      void refreshVolatileResults();
    }, 5000);

    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [refreshVolatileResults]);

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
