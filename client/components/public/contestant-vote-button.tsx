"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { castVoteAction, getVoteStatusAction } from "@/app/actions/votes";
import { useAuth } from "@/context/AuthContext";

interface ContestantVoteButtonProps {
  contestantId: string;
}

export function ContestantVoteButton({
  contestantId,
}: ContestantVoteButtonProps) {
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState<number | null>(null);

  const refreshVoteCount = useCallback(async () => {
    try {
      const response = await fetch(`/api/votes/${contestantId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { votes?: unknown };
      if (typeof payload.votes === "number" && Number.isFinite(payload.votes)) {
        setVoteCount(payload.votes);
      }
    } catch {
      // Keep existing count if polling fails; next interval will retry.
    }
  }, [contestantId]);

  useEffect(() => {
    void refreshVoteCount();

    const interval = setInterval(() => {
      void refreshVoteCount();
    }, 7000);

    return () => clearInterval(interval);
  }, [refreshVoteCount]);

  useEffect(() => {
    let active = true;

    async function checkVoteStatus() {
      if (!user) {
        if (active) {
          setHasVoted(false);
        }
        return;
      }

      setCheckingVoteStatus(true);
      try {
        const token = await user.getIdToken();
        const result = await getVoteStatusAction({ token });
        if (!active || !result.success) {
          return;
        }

        setHasVoted(result.data.hasVoted);
        if (result.data.hasVoted) {
          setStatus("success");
          setMessage("You have already voted.");
        }
      } finally {
        if (active) {
          setCheckingVoteStatus(false);
        }
      }
    }

    void checkVoteStatus();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="glass-button inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-medium"
      >
        Checking account...
      </button>
    );
  }

  if (checkingVoteStatus) {
    return (
      <button
        type="button"
        disabled
        className="glass-button inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-medium"
      >
        Checking vote status...
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-primary/40 bg-primary/20 px-5 text-sm font-medium text-foreground transition hover:bg-primary/30"
      >
        Sign in with Google to Vote
      </Link>
    );
  }

  async function handleVote() {
    if (!user) {
      setStatus("error");
      setMessage("Please sign in with Google to vote.");
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    setMessage(null);

    try {
      const token = await user.getIdToken();
      const result = await castVoteAction({
        token,
        contestantId,
      });

      if (!result.success) {
        setStatus("error");
        setMessage(result.error);
        return;
      }

      setStatus("success");
      setHasVoted(true);
      setMessage("Vote submitted. It will appear shortly.");
      void refreshVoteCount();

      setTimeout(() => {
        void refreshVoteCount();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  }

  const buttonLabel =
    hasVoted || status === "success"
      ? "Vote Submitted"
      : submitting
        ? "Submitting..."
        : "Cast My Vote";

  return (
    <div className="w-full">
      <div className="mb-3 flex items-end justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Total Votes
        </span>
        <span className="text-3xl font-bold leading-none text-foreground tabular-nums sm:text-4xl">
          {voteCount ?? "--"}
        </span>
      </div>
      <div className="mb-2 min-h-5">
        {message ? (
          <p
            className={`text-xs ${
              status === "error" ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {message}
          </p>
        ) : (
          <p className="invisible text-xs">Status</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleVote}
        disabled={submitting || hasVoted || status === "success"}
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-primary/40 bg-primary/22 px-5 text-sm font-semibold text-foreground transition hover:bg-primary/30 disabled:cursor-not-allowed disabled:opacity-75"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
