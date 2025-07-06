"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Check, Loader2 } from "lucide-react";

interface VoteButtonProps {
  onVote: () => void;
  loading: boolean;
  voted: boolean;
  active: boolean;
  contestantName: string;
}

export function VoteButton({
  onVote,
  loading,
  voted,
  active,
  contestantName,
}: VoteButtonProps) {
  return (
    <div className="max-w-md  lg:mx-0">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onVote}
          disabled={loading || voted || !active}
          size="lg"
          className={`
            relative w-full py-4 text-lg font-semibold rounded-xl
            ${
              voted
                ? "bg-green-600 hover:bg-green-600 text-white"
                : !active
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-100"
            }
            transition-all duration-300 shadow-lg hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting vote...
              </motion.div>
            ) : voted ? (
              <motion.div
                key="voted"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3"
              >
                <Check className="w-5 h-5" />
                Vote Submitted!
              </motion.div>
            ) : !active ? (
              <motion.div
                key="inactive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3"
              >
                Voting Closed
              </motion.div>
            ) : (
              <motion.div
                key="vote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3"
              >
                <Heart className="w-5 h-5" />
                Vote for {contestantName}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button glow effect */}
          {!voted && !loading && active && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-white/20 blur-xl"
              animate={{
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}
        </Button>
      </motion.div>
    </div>
  );
}
