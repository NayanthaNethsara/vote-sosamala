"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, Loader2, Sparkles, Users } from "lucide-react";
import type { Contestant } from "@/types/contestant";
import { formatVoteCount } from "@/lib/utils";
import { signInWithGoogle } from "@/lib/auth/actions";
import { LoginDialog } from "./login-dialog";
import { useRouter } from "next/navigation";

interface VotePageProps {
  contestant: Contestant;
  user: string | null;
}

export function VotePage({ contestant, user }: VotePageProps) {
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentVoteCount, setCurrentVoteCount] = useState(
    contestant.vote_count
  );
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const router = useRouter();
  const currentPath = "/" + contestant.category + "/" + contestant.id;

  const handleVote = async () => {
    if (user == null) {
      setShowLoginDialog(true);
      return;
    }

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

  const handleGoogleLogin = async () => {
    const url = await signInWithGoogle(currentPath);
    if (url) router.push(url);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gray-800/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Additional background elements for large screens */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-600/10 rounded-full blur-2xl"
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gray-500/15 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.3, 0.1, 0.3],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Subtle grid pattern for large screens */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gray-400/20 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + i * 8}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
                {/* Image Container - Fixed 1:1 Aspect Ratio */}
                <motion.div
                  className="relative flex-shrink-0 mx-auto lg:mx-0"
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  <div className="relative w-64 sm:w-72 md:w-80 lg:w-80 xl:w-96 aspect-[1/1] overflow-hidden rounded-xl shadow-2xl">
                    <motion.div
                      animate={{ scale: isHovered ? 1.05 : 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full h-full"
                    >
                      <Image
                        src={
                          contestant.image_url ||
                          "/placeholder.svg?height=600&width=400"
                        }
                        alt={contestant.name}
                        fill
                        className="object-cover transition-all duration-700"
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                      />
                    </motion.div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent rounded-xl" />

                    {/* Vote Count Overlay */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="absolute top-4 right-4"
                    >
                      <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-300" />
                        <motion.span
                          key={currentVoteCount}
                          initial={{ scale: 1.2, color: "#10b981" }}
                          animate={{ scale: 1, color: "#d1d5db" }}
                          transition={{ duration: 0.3 }}
                          className="text-sm font-bold text-gray-300"
                        >
                          {formatVoteCount(currentVoteCount)}
                        </motion.span>
                      </div>
                    </motion.div>

                    {/* Simple Vote Button Overlay */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="absolute bottom-4 left-4 right-4 z-10"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleVote}
                          disabled={loading || voted || !contestant.active}
                          size="sm"
                          className={`
                            w-full backdrop-blur-sm border-0 font-medium pointer-events-auto
                            ${
                              voted
                                ? "bg-green-600/90 hover:bg-green-600/90 text-white"
                                : !contestant.active
                                ? "bg-gray-700/90 text-gray-400 cursor-not-allowed"
                                : "bg-white/90 text-black hover:bg-white/95"
                            }
                            transition-all duration-300 shadow-lg
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
                                className="flex items-center justify-center gap-2"
                              >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Voting...
                              </motion.div>
                            ) : voted ? (
                              <motion.div
                                key="voted"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Voted!
                              </motion.div>
                            ) : !contestant.active ? (
                              <motion.div
                                key="inactive"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2"
                              >
                                Closed
                              </motion.div>
                            ) : (
                              <motion.div
                                key="vote"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2"
                              >
                                <Heart className="w-4 h-4" />
                                Vote
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </motion.div>

                    {/* Floating particles effect */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-xl"
                        >
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              initial={{
                                x: Math.random() * 300,
                                y: Math.random() * 400,
                                opacity: 0,
                              }}
                              animate={{
                                y: Math.random() * 400 - 100,
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 flex flex-col  min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-6"
                  >
                    {/* Name and Faculty */}
                    <div className="space-y-3 text-center lg:text-left">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                        {contestant.name}
                      </h2>
                      {contestant.faculty && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-800 text-gray-300 text-sm px-3 py-1"
                        >
                          {contestant.faculty}
                        </Badge>
                      )}
                    </div>
                    {/* Bio */}
                    {contestant.bio && (
                      <div className="max-w-2xl mx-auto lg:mx-0">
                        <p className="text-gray-300 leading-relaxed text-center lg:text-left">
                          {contestant.bio}
                        </p>
                      </div>
                    )}

                    <div>
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                          <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                            {formatVoteCount(currentVoteCount)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Total Votes
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-xl p-4 text-center border border-yellow-700/30">
                          <div className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-1">
                            #{contestant.rank ? contestant.rank : "N/A"}
                          </div>
                          <div className="text-xs text-yellow-400">
                            Current Rank
                          </div>
                        </div>
                      </div>

                      {/* Vote Button */}
                      <div className="max-w-md mx-auto lg:mx-0">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleVote}
                            disabled={loading || voted || !contestant.active}
                            size="lg"
                            className={`
                            relative w-full py-4 text-lg font-semibold rounded-xl
                            ${
                              voted
                                ? "bg-green-600 hover:bg-green-600 text-white"
                                : !contestant.active
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
                              ) : !contestant.active ? (
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
                                  Vote for {contestant.name}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {/* Button glow effect */}
                            {!voted && !loading && contestant.active && (
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
                    </div>
                  </motion.div>

                  {/* Success animation */}
                  <AnimatePresence>
                    {voted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                          }}
                        >
                          <Sparkles className="w-16 h-16 text-green-400" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Footer space */}
          <div className="h-16" />
        </motion.div>
      </div>
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
}
