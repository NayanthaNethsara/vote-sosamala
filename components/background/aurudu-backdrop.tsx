"use client";

import { memo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

function AuruduBackdropComponent() {
  const shouldReduceMotion = useReducedMotion();

  const spinTransition = {
    duration: 600,
    repeat: Infinity,
    ease: "linear" as const,
  };

  const clockwiseRotation = shouldReduceMotion ? undefined : { rotate: 360 };
  const antiClockwiseRotation = shouldReduceMotion
    ? undefined
    : { rotate: -360 };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,220,140,0.12),transparent_36%),radial-gradient(circle_at_86%_18%,rgba(255,200,110,0.08),transparent_32%),linear-gradient(180deg,rgba(255,224,163,0.04),transparent_42%)]" />

      <motion.div
        animate={clockwiseRotation}
        transition={spinTransition}
        className="absolute -left-32 -top-32 w-80 opacity-40 will-change-transform sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          loading="lazy"
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={antiClockwiseRotation}
        transition={spinTransition}
        className="absolute -right-32 -top-32 w-80 opacity-40 will-change-transform sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          loading="lazy"
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={antiClockwiseRotation}
        transition={spinTransition}
        className="absolute -bottom-32 -left-32 hidden w-80 opacity-35 will-change-transform sm:block sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          loading="lazy"
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={clockwiseRotation}
        transition={spinTransition}
        className="absolute -bottom-32 -right-32 hidden w-80 opacity-35 will-change-transform sm:block sm:w-110"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={500}
          height={500}
          loading="lazy"
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={clockwiseRotation}
        transition={spinTransition}
        className="absolute left-[5%] top-[40%] hidden w-64 opacity-15 will-change-transform lg:block lg:w-80"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={400}
          height={400}
          loading="lazy"
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={antiClockwiseRotation}
        transition={spinTransition}
        className="absolute right-[8%] top-[55%] hidden w-64 opacity-15 will-change-transform lg:block lg:w-80"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={400}
          height={400}
          loading="lazy"
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        animate={clockwiseRotation}
        transition={spinTransition}
        className="absolute left-1/2 top-1/2 w-90 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] will-change-transform sm:w-120"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={700}
          height={700}
          loading="eager"
          priority
          className="h-full w-full"
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,8,15,0.06)_0%,rgba(36,8,15,0.2)_100%)]" />
    </div>
  );
}

export const AuruduBackdrop = memo(AuruduBackdropComponent);
