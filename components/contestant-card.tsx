"use client";
import Image from "next/image";
import type { Contestant } from "@/types/contestant";
import Link from "next/link";

interface ContestantCardProps {
  contestant: Contestant;
  category: string;
}

export function ContestantCard({ contestant, category }: ContestantCardProps) {
  return (
    <Link
      key={contestant.id}
      href={`/${category}/${contestant.id}`}
      className="block w-full max-w-xs mx-auto"
    >
      <div className="group/card relative w-full overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-[1.02]">
        {/* Aspect ratio container */}
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={`${contestant.image}`}
            alt={contestant.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            priority
          />

          {/* Gradient overlay for better text readability - always present */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"></div>

          {/* Rank badge */}
          <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
            #{contestant.rank}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 w-full p-4">
            {/* Faculty Badge */}
            <div className="mb-2">
              <span className="inline-block rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-lg md:text-sm">
                {contestant.faculty}
              </span>
            </div>

            {/* Name with text shadow for better readability */}
            <h1 className="text-xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] md:text-2xl">
              {contestant.name}
            </h1>
          </div>
        </div>
      </div>
    </Link>
  );
}
