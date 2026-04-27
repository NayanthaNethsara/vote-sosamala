"use client";

import { memo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

function SpinningMandalaComponent() {
  const shouldReduceMotion = useReducedMotion();

  const spinTransition = {
    duration: 600,
    repeat: Infinity,
    ease: "linear" as const,
  };

  const clockwiseRotation = shouldReduceMotion ? undefined : { rotate: 360 };
  const antiClockwiseRotation = shouldReduceMotion ? undefined : { rotate: -360 };

  return (
    <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden rounded-[inherit]">
      <motion.div
        animate={clockwiseRotation}
        transition={spinTransition}
        className="absolute -right-20 -top-20 w-80 blur-[0.5px] will-change-transform"
      >
        <Image
          src="/mandala/mandala-gold.svg"
          alt=""
          width={300}
          height={300}
          loading="lazy"
          className="h-full w-full opacity-20"
        />
      </motion.div>
      <motion.div
        animate={antiClockwiseRotation}
        transition={spinTransition}
        className="absolute -bottom-20 -left-20 w-80 blur-[0.5px] will-change-transform"
      >
        <Image
          src="/mandala/mandala-gold.svg"
          alt=""
          width={300}
          height={300}
          loading="lazy"
          className="h-full w-full opacity-10"
        />
      </motion.div>
    </div>
  );
}

export const SpinningMandala = memo(SpinningMandalaComponent);
