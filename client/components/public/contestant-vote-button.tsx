"use client";

import Link from "next/link";
import { useState } from "react";

import { castVoteAction } from "@/app/actions/votes";
import { useAuth } from "@/context/AuthContext";

interface ContestantVoteButtonProps {
  contestantId: string;
}

export function ContestantVoteButton({
  contestantId,
}: ContestantVoteButtonProps) {
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-medium text-zinc-100"
      >
        Checking account...
      </button>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/15 px-5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
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
      setMessage("Vote submitted. It will appear shortly.");
    } finally {
      setSubmitting(false);
    }
  }

  const buttonLabel =
    status === "success"
      ? "Vote Submitted"
      : submitting
        ? "Submitting..."
        : "Cast My Vote";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleVote}
        disabled={submitting || status === "success"}
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-75"
      >
        {buttonLabel}
      </button>
      {message ? (
        <p
          className={`mt-2 text-xs ${
            status === "error" ? "text-red-300" : "text-zinc-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
