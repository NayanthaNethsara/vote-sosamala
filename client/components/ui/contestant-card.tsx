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
      <div className="vote-panel relative overflow-hidden ring-1 ring-white/12">
        <div className="relative aspect-4/5 overflow-hidden rounded-[30px]">
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

          <div className="vote-pill absolute left-4 top-4 px-3! py-1.5! text-xs! font-semibold tracking-[0.16em]! text-foreground!">
            <Fire className="h-4 w-4 text-pink-300" />
            {votesLabel}
          </div>

          <div className="absolute bottom-5 left-5 right-5 space-y-2.5 text-foreground">
            <p className="vote-kicker text-xs! text-foreground/72! tracking-[0.14em]!">
              {title}
            </p>
            <h3 className="vote-heading text-[1.38rem] leading-tight sm:text-[1.55rem]">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-foreground/78">
              <Medal className="h-[1.05rem] w-[1.05rem]" />
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
