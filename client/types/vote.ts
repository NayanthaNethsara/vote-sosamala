export interface VoteLeaderboardEntry {
  rank: number;
  contestantId: string;
  votes: number;
}

export interface VoteLeaderboardResponse {
  results: VoteLeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
  };
}
