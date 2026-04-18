"use client";

import { useCallback, useEffect, useState } from "react";

import type { VoteLeaderboardResponse } from "@/types/vote";

interface UseLeaderboardResultsOptions {
  limit?: number;
  enabled?: boolean;
  intervalMs?: number;
}

export function useLeaderboardResults({
  limit = 100,
  enabled = true,
  intervalMs = 5000,
}: UseLeaderboardResultsOptions = {}) {
  const [results, setResults] = useState<VoteLeaderboardResponse["results"]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const refreshResults = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      const response = await fetch(`/api/results?limit=${limit}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setError("Failed to refresh leaderboard");
        return;
      }

      const payload = (await response.json()) as VoteLeaderboardResponse;
      setResults(payload.results ?? []);
      setError(null);
    } catch {
      setError("Failed to refresh leaderboard");
    }
  }, [enabled, limit]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const initialFetch = setTimeout(() => {
      void refreshResults();
    }, 0);

    const interval = setInterval(() => {
      void refreshResults();
    }, intervalMs);

    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [enabled, intervalMs, refreshResults]);

  return {
    results,
    error,
    refreshResults,
  };
}
