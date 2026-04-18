"use client";

import Image from "next/image";
import Link from "next/link";
import { Medal, Fire } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface ContestantCardProps {
  name: string;
  title: string;
  subtitle: string;
  votesLabel: string;
  imageUrl: string;
  href?: string;
  eager?: boolean;
  className?: string;
}

export function ContestantCard({
  name,
  title,
  subtitle,
  votesLabel,
  imageUrl,
  href,
  eager = false,
  className,
}: ContestantCardProps) {
  const cardContent = (
    <>
      <div className="vote-panel relative overflow-hidden ring-1 ring-white/10">
        <div className="relative aspect-4/5 overflow-hidden rounded-[28px]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={eager ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/32 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,200,235,0.24)_0%,rgba(255,180,240,0.08)_45%,rgba(255,255,255,0)_100%)]" />

          <div className="vote-pill absolute left-4 top-4 px-2.5! py-1! font-semibold tracking-[0.18em]! text-foreground!">
            <Fire className="h-3.5 w-3.5 text-pink-300" />
            {votesLabel}
          </div>

          <div className="absolute bottom-4 left-4 right-4 space-y-2 text-foreground">
            <p className="vote-kicker text-foreground/70! tracking-[0.16em]!">
              {title}
            </p>
            <h3 className="vote-heading text-xl leading-tight sm:text-2xl">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-foreground/75 sm:text-sm">
              <Medal className="h-4 w-4" />
              <span>{subtitle}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <article className={cn("group relative", className)}>
      {href ? (
        <Link href={href} className="block" aria-label={`View ${name}`}>
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </article>
  );
}
