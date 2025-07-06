"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { Contestant } from "@/types/contestant";
import { signInWithGoogle } from "@/lib/auth/actions";
import { LoginDialog } from "./login-dialog";
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "./animated-background";
import { ContestantImage } from "./contestant-image";
import { ContestantInfo } from "./contestant-info";
import { VoteStats } from "./vote-stats";
import { VoteButton } from "./vote-button";
import { SuccessAnimation } from "./success-animation";
import { useLoginDialog } from "@/context/LoginDialogContext";

interface VotePageProps {
  contestant: Contestant;
  user: string | null;
}

export function VotePage({ contestant, user }: VotePageProps) {
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [currentVoteCount, setCurrentVoteCount] = useState(
    contestant.vote_count
  );
  const router = useRouter();
  const { open } = useLoginDialog();

  const handleVote = async () => {
    if (user == null) {
      open();
      return;
    }

    // Security check: Prevent multiple votes and inactive voting
    if (voted || !contestant.active || user == null) {
      toast.error("Login before voting");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestant_id: contestant.id,
          category: contestant.category,
        }),
      });
      const result = await res.json();
      setLoading(false);

      // Security: Handle authentication errors
      if (res.status === 401) {
        router.push(`/login?next=/${contestant.category}/${contestant.id}`);
        return;
      }

      if (res.ok) {
        setVoted(true);
        setCurrentVoteCount((prev) => prev + 1);
        toast.success("Vote submitted!");
      } else if (res.status === 409) {
        toast.error("You already voted in this category.");
      } else {
        toast.error(result.error || "Vote failed.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Unexpected error. Try again.");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative">
      <AnimatedBackground />

      <div className="relative z-10 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
                <ContestantImage
                  imageUrl={contestant.image_url}
                  name={contestant.name}
                  voteCount={currentVoteCount}
                  voted={voted}
                  loading={loading}
                  active={contestant.active}
                  onVote={handleVote}
                />

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <ContestantInfo
                    name={contestant.name}
                    faculty={contestant.faculty}
                    bio={contestant.bio}
                  />

                  <div className="flex flex-col  gap-4 ">
                    <VoteStats
                      voteCount={currentVoteCount}
                      rank={contestant.rank}
                    />

                    <VoteButton
                      onVote={handleVote}
                      loading={loading}
                      voted={voted}
                      active={contestant.active}
                      contestantName={contestant.name}
                    />
                  </div>

                  <SuccessAnimation show={voted} />
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="h-16" />
        </motion.div>
      </div>
    </div>
  );
}
