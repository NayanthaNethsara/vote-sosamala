"use client";

import Image from "next/image";
import { Medal, Fire } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface ContestantCardProps {
  name: string;
  title: string;
  subtitle: string;
  votesLabel: string;
  imageUrl: string;
  eager?: boolean;
  className?: string;
}

export function ContestantCard({
  name,
  title,
  subtitle,
  votesLabel,
  imageUrl,
  eager = false,
  className,
}: ContestantCardProps) {
  return (
    <article className={cn("group relative", className)}>
      <div className="relative overflow-hidden rounded-[28px] border border-white/25 bg-white/[0.08] shadow-[0_26px_80px_-34px_rgba(0,0,0,0.9)] ring-1 ring-white/15 backdrop-blur-2xl">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={eager ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.03)_45%,rgba(255,255,255,0)_100%)]" />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-100 backdrop-blur-xl">
            <Fire className="h-3.5 w-3.5 text-amber-500" />
            {votesLabel}
          </div>

          <div className="absolute bottom-4 left-4 right-4 space-y-2 text-zinc-50">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-200">
              {title}
            </p>
            <h3 className="text-2xl font-semibold leading-tight">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-zinc-200">
              <Medal className="h-4 w-4" />
              <span>{subtitle}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
