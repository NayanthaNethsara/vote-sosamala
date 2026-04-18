import type { Contestant } from "@/types/contestant";
import type { VoteLeaderboardResponse } from "@/types/vote";

export interface ContestantLeaderboardRow {
  contestant: Contestant;
  rank: number | null;
  votes: number;
}

export interface HydratedLeaderboardRow {
  contestantId: string;
  rank: number | null;
  votes: number;
  name: string;
  photoURL?: string;
  studentId?: string;
  academicYear: string;
  semester: string;
}

export function mapContestantsWithLeaderboard(
  contestants: Contestant[],
  leaderboardEntries: VoteLeaderboardResponse["results"],
): ContestantLeaderboardRow[] {
  const leaderboardById = new Map(
    leaderboardEntries.map((entry) => [entry.contestantId, entry]),
  );

  return contestants.map((contestant) => {
    const leaderboardEntry = leaderboardById.get(contestant.id);

    return {
      contestant,
      rank: leaderboardEntry?.rank ?? null,
      votes: leaderboardEntry?.votes ?? 0,
    };
  });
}

export function sortContestantLeaderboardRows(
  rows: ContestantLeaderboardRow[],
): ContestantLeaderboardRow[] {
  return [...rows].sort((left, right) => {
    if (left.rank === null && right.rank === null) {
      return left.contestant.name.localeCompare(right.contestant.name);
    }
    if (left.rank === null) {
      return 1;
    }
    if (right.rank === null) {
      return -1;
    }

    if (left.rank !== right.rank) {
      return left.rank - right.rank;
    }

    return right.votes - left.votes;
  });
}

export function buildHydratedLeaderboardRows(
  contestants: Contestant[],
  leaderboardEntries: VoteLeaderboardResponse["results"],
): HydratedLeaderboardRow[] {
  const byContestantId = new Map(
    contestants.map((contestant) => [contestant.id, contestant]),
  );

  const rowsFromLeaderboard: HydratedLeaderboardRow[] = leaderboardEntries.map(
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
    leaderboardEntries.map((entry) => entry.contestantId),
  );

  const missingContestants: HydratedLeaderboardRow[] = contestants
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

  return [...rowsFromLeaderboard, ...missingContestants].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }

    return a.name.localeCompare(b.name);
  });
}

export function formatVotesLabel(rank: number | null, votes: number): string {
  if (rank === null) {
    return `${votes} vote${votes === 1 ? "" : "s"}`;
  }

  return `#${rank} - ${votes} vote${votes === 1 ? "" : "s"}`;
}
