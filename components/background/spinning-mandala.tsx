"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function SpinningMandala() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden rounded-[inherit]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
        className="absolute -right-20 -top-20 w-80 blur-[0.5px]"
      >
        <Image
          src="/mandala/mandala-gold.svg"
          alt=""
          width={300}
          height={300}
          className="h-full w-full opacity-20"
        />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -left-20 w-80 blur-[0.5px]"
      >
        <Image
          src="/mandala/mandala-gold.svg"
          alt=""
          width={300}
          height={300}
          className="h-full w-full opacity-10"
        />
      </motion.div>
    </div>
  );
}
