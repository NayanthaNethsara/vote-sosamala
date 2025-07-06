"use client";

import Image from "next/image";
import type { Contestant } from "@/types/contestant";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, Crown } from "lucide-react";

interface ContestantCardProps {
  contestant: Contestant;
  category: string;
}

export function ContestantCard({ contestant, category }: ContestantCardProps) {
  const formatVoteCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Link
      href={`/${category}/${contestant.id}`}
      className="block w-full max-w-xs mx-auto cursor-none"
    >
      <motion.div
        whileHover={{
          scale: 1.03,
          y: -8,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        className="group relative w-full overflow-hidden rounded-xl shadow-2xl bg-gray-900/50 backdrop-blur-xl border border-gray-800/50"
      >
        {/* Aspect ratio container - 2:3 ratio to match voting page */}
        <div className="relative aspect-[2/3] w-full">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Image
              src={
                contestant.image_url || "/placeholder.svg?height=600&width=400"
              }
              alt={contestant.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-all duration-700"
              priority
            />
          </motion.div>

          {/* Enhanced gradient overlay for better text readability */}
          <div className="absolute -inset-5 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-gray-800/50 to-transparent"
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Rank badge */}
            {contestant.rank && (
              <Badge className="bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 text-black font-bold backdrop-blur-sm">
                <Crown className="w-3 h-3 mr-1" />#{contestant.rank}
              </Badge>
            )}

            {/* Vote count */}
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-300" />
              <span className="text-xs font-bold text-gray-300">
                {formatVoteCount(contestant.vote_count)}
              </span>
            </div>
          </div>

          {/* Status indicator */}
          {!contestant.active && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="destructive"
                className="bg-red-900/80 text-red-300 backdrop-blur-sm text-xs"
              >
                Inactive
              </Badge>
            </div>
          )}

          {/* Content - Enhanced with more details */}
          <div className="absolute bottom-0 w-full p-4 space-y-2">
            {/* Faculty Badge */}
            {contestant.faculty && (
              <div>
                <Badge
                  variant="secondary"
                  className="bg-gray-800/80 text-gray-300 text-xs px-2 py-1 backdrop-blur-sm"
                >
                  {contestant.faculty}
                </Badge>
              </div>
            )}

            {/* Name */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-white drop-shadow-lg leading-tight"
            >
              {contestant.name}
            </motion.h3>

            {/* Bio - Always visible, truncated after 2 lines */}
            {contestant.bio && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-gray-300 leading-relaxed line-clamp-2 drop-shadow-sm"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {contestant.bio}
              </motion.p>
            )}

            {/* Read more indicator on hover */}
            {contestant.bio && contestant.bio.length > 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="opacity-0 group-hover:opacity-100"
              >
                <span className="text-xs text-gray-400 italic">
                  Click to read more...
                </span>
              </motion.div>
            )}
          </div>

          {/* Floating particles effect on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: Math.random() * 200,
                  y: Math.random() * 300,
                  opacity: 0,
                }}
                animate={{
                  y: Math.random() * 300 - 50,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>

          {/* Glow effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/5 to-transparent pointer-events-none"
          />
        </div>
      </motion.div>
    </Link>
  );
}
