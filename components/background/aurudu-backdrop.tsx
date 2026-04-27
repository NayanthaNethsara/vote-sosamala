"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AuruduBackdrop() {
  const spinTransition = {
    duration: 600,
    repeat: Infinity,
    ease: "linear" as const,
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,220,140,0.12),transparent_36%),radial-gradient(circle_at_86%_18%,rgba(255,200,110,0.08),transparent_32%),linear-gradient(180deg,rgba(255,224,163,0.04),transparent_42%)]" />

      {/* Symmetrical Corner Mandalas */}

      {/* Top Left */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={spinTransition}
        className="absolute -left-32 -top-32 w-80 opacity-50 blur-[1px] sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          className="h-full w-full"
          priority
        />
      </motion.div>

      {/* Top Right */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={spinTransition}
        className="absolute -right-32 -top-32 w-80 opacity-50 blur-[1px] sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          className="h-full w-full"
          priority
        />
      </motion.div>

      {/* Bottom Left */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={spinTransition}
        className="absolute -bottom-32 -left-32 w-80 opacity-50 blur-[1px] sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          className="h-full w-full"
        />
      </motion.div>

      {/* Bottom Right */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={spinTransition}
        className="absolute -bottom-32 -right-32 w-80 opacity-50 blur-[1px] sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          className="h-full w-full"
        />
      </motion.div>

      {/* Floating Decorative Mandalas */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={spinTransition}
        className="absolute left-[5%] top-[40%] w-64 opacity-20 blur-[1px] sm:w-80"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={400}
          height={400}
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={spinTransition}
        className="absolute right-[8%] top-[55%] w-64 opacity-20 blur-[1px] sm:w-80"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={400}
          height={400}
          className="h-full w-full"
        />
      </motion.div>

      {/* Center Background Mandala */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={spinTransition}
        className="absolute left-1/2 top-1/2 w-100 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] blur-[3px] sm:w-150"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={800}
          height={800}
          loading="eager"
          className="h-full w-full"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,8,15,0.06)_0%,rgba(36,8,15,0.2)_100%)]" />
    </div>
  );
}
