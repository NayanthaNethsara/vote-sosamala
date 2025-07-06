"use client";

import { formatVoteCount } from "@/lib/utils";

interface VoteStatsProps {
  voteCount: number;
  rank?: number;
}

export function VoteStats({ voteCount, rank }: VoteStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md lg:mx-0">
      <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
        <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
          {formatVoteCount(voteCount)}
        </div>
        <div className="text-xs text-gray-400">Total Votes</div>
      </div>
      <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-xl p-4 text-center border border-yellow-700/30">
        <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-1">
          #{rank ? rank : "N/A"}
        </div>
        <div className="text-xs text-yellow-400">Current Rank</div>
      </div>
    </div>
  );
}
