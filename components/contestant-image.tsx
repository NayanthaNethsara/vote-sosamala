"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Heart, Check, Loader2, Users } from "lucide-react"
import { formatVoteCount } from "@/lib/utils"

interface ContestantImageProps {
  imageUrl: string
  name: string
  voteCount: number
  voted: boolean
  loading: boolean
  active: boolean
  onVote: () => void
}

export function ContestantImage({ imageUrl, name, voteCount, voted, loading, active, onVote }: ContestantImageProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
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
            src={imageUrl || "/placeholder.svg?height=600&width=400"}
            alt={name}
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
              key={voteCount}
              initial={{ scale: 1.2, color: "#10b981" }}
              animate={{ scale: 1, color: "#d1d5db" }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold text-gray-300"
            >
              {formatVoteCount(voteCount)}
            </motion.span>
          </div>
        </motion.div>

        {/* Vote Button Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-4 left-4 right-4 z-10"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onVote}
              disabled={loading || voted || !active}
              size="sm"
              className={`
                w-full backdrop-blur-sm border-0 font-medium pointer-events-auto
                ${
                  voted
                    ? "bg-green-600/90 hover:bg-green-600/90 text-white"
                    : !active
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
                ) : !active ? (
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
  )
}
