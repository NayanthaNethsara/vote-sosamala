"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import type { Contestant } from "@/types/contestant";
import { CapitalizeFirstLetter } from "@/lib/utils";
import LogoutButton from "./logout-button";
import { UserMenu } from "./user-menu";

interface VotingHeaderProps {
  contestant: Contestant;
  user: string | null;
}

export function VotingHeader({ contestant, user }: VotingHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900/30 border-b border-gray-700/30 backdrop-blur-xl  top-0 z-50 fixed w-full"
    >
      {/* Additional glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/10 via-gray-700/5 to-gray-800/10" />

      <div className="max-w-6xl mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <Link href={`/${contestant.category}`}>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800/50 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {CapitalizeFirstLetter(contestant.category)} List
            </Button>
          </Link>

          {/* Center Info */}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-gray-600/50 text-gray-300 bg-gray-800/30 backdrop-blur-sm"
            >
              {contestant.category.toUpperCase()}
            </Badge>
            {contestant.rank && (
              <Badge className="bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 text-black font-bold backdrop-blur-sm">
                <Crown className="w-3 h-3 mr-1" />#{contestant.rank}
              </Badge>
            )}
            {!contestant.active && (
              <Badge
                variant="destructive"
                className="bg-red-900/80 text-red-300 backdrop-blur-sm"
              >
                Inactive
              </Badge>
            )}
          </div>

          {/* Title */}
          <div className="flex items-center justify-end gap-3">
            <h1 className="text-lg font-bold text-white">Cast Your Vote</h1>
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
