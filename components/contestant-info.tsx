"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ContestantInfoProps {
  name: string;
  faculty?: string;
  bio?: string;
}

export function ContestantInfo({ name, faculty, bio }: ContestantInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="space-y-2 md:space-y-6 mb-6"
    >
      <div className="space-y-3 text-center lg:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
          {name}
        </h2>
        {faculty && (
          <Badge
            variant="secondary"
            className="bg-gray-800 text-gray-300 text-sm px-3 py-1"
          >
            {faculty}
          </Badge>
        )}
      </div>
      {bio && (
        <div className="max-w-2xl mx-auto lg:mx-0">
          <p className="text-gray-300 leading-relaxed text-center lg:text-left">
            {bio}
          </p>
        </div>
      )}
    </motion.div>
  );
}
