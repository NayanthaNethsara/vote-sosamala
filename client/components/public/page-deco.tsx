"use client";

import { motion } from "motion/react";

export function GridDecoration() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate overflow-hidden contain-strict"
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(56%_72%_at_50%_0%,oklch(0.78_0.16_335/0.26),transparent)] contain-strict"
          animate={{ opacity: [0.86, 1, 0.86], y: [0, 6, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[8%] top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.14_315/0.2),transparent_70%)] blur-2xl"
          animate={{ opacity: [0.58, 0.78, 0.58], x: [0, -8, 0], y: [0, 6, 0] }}
          transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[10%] top-28 h-44 w-44 rounded-full bg-[radial-gradient(circle,oklch(0.72_0.13_320/0.15),transparent_72%)] blur-xl"
          animate={{ opacity: [0.5, 0.68, 0.5], x: [0, 7, 0], y: [0, -5, 0] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full overflow-hidden mask-[radial-gradient(100%_100%_at_top_center,white_56%,transparent_100%)]"
      >
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.92_0.02_330/0.02),transparent_40%)]"
          animate={{ opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 mx-auto w-full max-w-6xl">
          <div className="absolute inset-y-0 left-0 w-px bg-primary/22" />
          <div className="absolute inset-y-0 right-0 w-px bg-primary/22" />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary/14" />
        </div>

        <div className="absolute inset-y-0 left-4 w-px bg-foreground/10 md:left-8 lg:left-12" />
        <div className="absolute inset-y-0 right-4 w-px bg-foreground/10 md:right-8 lg:right-12" />
        <div className="absolute inset-y-0 left-8 w-px bg-foreground/6 md:left-12 lg:left-20" />
        <div className="absolute inset-y-0 right-8 w-px bg-foreground/6 md:right-12 lg:right-20" />

        <div className="absolute inset-x-0 top-32 h-px bg-primary/22" />
        <div className="absolute inset-x-0 top-64 h-px bg-foreground/12" />
        <div className="absolute inset-x-0 top-96 h-px bg-foreground/8" />
      </div>
    </>
  );
}
