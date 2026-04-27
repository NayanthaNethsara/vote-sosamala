"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
} from "framer-motion";
import { IconChevronDown } from "@tabler/icons-react";

// Drag-to-follow model:
//  - progress is a motion value in [0..1] where 0 = splash fully visible
//    and 1 = splash fully off-screen (above the viewport).
//  - Wheel / touch updates progress directly so the splash tracks the
//    gesture with no easing (feels like dragging a panel).
//  - When the user stops moving for RELEASE_DELAY ms, we snap:
//      * if they moved >= SNAP_THRESHOLD (40%) from their start state,
//        we commit to the opposite state with a soft spring;
//      * otherwise we spring back to where they started.
const SNAP_THRESHOLD = 0.4;
const RELEASE_DELAY = 140;

export function SplashIntro() {
  const [isOpen, setIsOpen] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // `progress` is the raw target driven by gestures (0 = open, 1 = closed).
  // `smoothProgress` is the animated value the UI follows — gives a buttery
  // feel without breaking the "drag" sensation.
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 220,
    damping: 32,
    mass: 0.7,
    restDelta: 0.0005,
  });
  const yPercent = useTransform(smoothProgress, (p) => `${p * -100}%`);

  const draggingRef = useRef(false);
  const startStateRef = useRef<0 | 1>(0);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const lastTouchYRef = useRef(0);

  const snapTo = useCallback(
    (target: 0 | 1) => {
      if (animRef.current) animRef.current.stop();
      setIsOpen(target === 0);
      if (shouldReduceMotion) {
        progress.set(target);
        return;
      }
      animRef.current = animate(progress, target, {
        type: "spring",
        stiffness: 90,
        damping: 22,
        mass: 1,
        restDelta: 0.0005,
      });
    },
    [progress, shouldReduceMotion],
  );

  const beginDrag = useCallback(() => {
    if (draggingRef.current) return;
    draggingRef.current = true;
    startStateRef.current = progress.get() < 0.5 ? 0 : 1;
    if (animRef.current) animRef.current.stop();
  }, [progress]);

  const scheduleRelease = useCallback(() => {
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = setTimeout(() => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const current = progress.get();
      const start = startStateRef.current;
      const dist = Math.abs(current - start);
      if (dist >= SNAP_THRESHOLD) {
        snapTo(start === 0 ? 1 : 0);
      } else {
        snapTo(start);
      }
    }, RELEASE_DELAY);
  }, [progress, snapTo]);

  // Lock body scroll & flag when splash is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.dataset.splashOpen = "true";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      delete document.body.dataset.splashOpen;
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      delete document.body.dataset.splashOpen;
    };
  }, [isOpen]);

  // Gesture handlers — wheel, touch, keyboard.
  useEffect(() => {
    const updateBy = (deltaPx: number) => {
      const vh = window.innerHeight || 800;
      const v = progress.get();
      let next = v + deltaPx / vh;
      if (next < 0) next = 0;
      if (next > 1) next = 1;
      progress.set(next);
    };

    const canEngage = (deltaPx: number) => {
      const open = progress.get() < 0.5;
      if (open) return true;
      // closed: only engage if at top of page and gesture is "pulling down"
      if (window.scrollY > 0) return false;
      return deltaPx < 0;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!canEngage(e.deltaY)) return;
      beginDrag();
      updateBy(e.deltaY);
      scheduleRelease();
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchYRef.current = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const cy = e.touches[0]?.clientY ?? 0;
      const dy = lastTouchYRef.current - cy; // positive when finger moves up
      lastTouchYRef.current = cy;
      if (!canEngage(dy)) return;
      beginDrag();
      updateBy(dy);
      scheduleRelease();
    };

    const handleTouchEnd = () => {
      if (draggingRef.current) {
        if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
        draggingRef.current = false;
        const current = progress.get();
        const start = startStateRef.current;
        const dist = Math.abs(current - start);
        if (dist >= SNAP_THRESHOLD) {
          snapTo(start === 0 ? 1 : 0);
        } else {
          snapTo(start);
        }
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      const open = progress.get() < 0.5;
      if (
        open &&
        (e.key === "ArrowDown" ||
          e.key === "PageDown" ||
          e.key === "Enter" ||
          e.key === " " ||
          e.key === "Spacebar" ||
          e.key === "Escape")
      ) {
        e.preventDefault();
        snapTo(1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("keydown", handleKey);
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
      if (animRef.current) animRef.current.stop();
    };
  }, [progress, beginDrag, scheduleRelease, snapTo]);

  return (
    <motion.div
      role="dialog"
      aria-label="Welcome to Wasantha Muwadora"
      aria-hidden={!isOpen}
      style={{ y: yPercent }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(165deg,#1f060c_0%,#3d0e18_45%,#220910_100%)] text-amber-50"
    >
      {/* Soft radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(214,158,79,0.18)_0%,transparent_55%),radial-gradient(circle_at_50%_120%,rgba(140,30,50,0.5)_0%,transparent_60%)]"
      />

      {/* Big mandala behind text */}
      <motion.div
        aria-hidden
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[100vmin] max-w-160 -translate-x-1/2 -translate-y-1/2 opacity-40 will-change-transform"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={640}
          height={640}
          priority
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        aria-hidden
        animate={shouldReduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[42vmin] max-w-95 -translate-x-1/2 -translate-y-1/2 opacity-[0.18] will-change-transform"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={380}
          height={380}
          priority
          className="h-full w-full"
        />
      </motion.div>

      {/* Decorative corner mandalas */}
      <motion.div
        aria-hidden
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -left-16 -top-16 hidden w-44 opacity-25 sm:block lg:w-56"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={240}
          height={240}
          className="h-full w-full"
        />
      </motion.div>
      <motion.div
        aria-hidden
        animate={shouldReduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-16 -right-16 hidden w-44 opacity-25 sm:block lg:w-56"
      >
        <Image
          src="/mandala/mandala-light-gold.svg"
          alt=""
          width={240}
          height={240}
          className="h-full w-full"
        />
      </motion.div>

      {/* Center content (no glass panel) */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-black/20 px-4 py-1 text-[9px] font-semibold uppercase tracking-[0.4em] text-amber-100/85">
            <span className="h-1 w-1 rounded-full bg-amber-300" />
            <span className="mr-[-0.4em]">
              Sinhala &amp; Tamil New Year 2026
            </span>
            <span className="h-1 w-1 rounded-full bg-amber-300" />
          </span>

          {/*
            Inline-block + negative right margin equal to the tracking value
            cancels out the trailing letter-spacing gap so the text is
            optically centred rather than visually drifting left.
          */}
          <h1 className="mt-6 font-mono text-[3rem] font-semibold uppercase leading-none tracking-[0.16em] text-amber-100 drop-shadow-[0_0_28px_rgba(215,169,79,0.3)] sm:text-7xl lg:text-8xl">
            <span className="inline-block mr-[-0.16em]">Ayubowan</span>
          </h1>

          <p className="mt-4 font-mono text-xs uppercase tracking-[0.5em] text-amber-200/75 sm:text-sm">
            <span className="inline-block mr-[-0.5em]">Wasantha Muwadora</span>
          </p>

          <div
            aria-hidden
            className="my-5 h-px w-32 bg-[linear-gradient(to_right,transparent,rgba(229,179,99,0.6),transparent)]"
          />

          <p className="max-w-sm text-balance text-xs leading-relaxed text-amber-100/75 sm:text-sm">
            Welcome to the season of new beginnings — a celebration of
            tradition, grace and joy.
          </p>
        </motion.div>
      </div>

      {/* Scroll prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-amber-100/75"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.45em]">
          {isOpen ? "Scroll to open" : "Scroll up to return"}
        </span>

        <motion.span
          aria-hidden
          animate={
            shouldReduceMotion
              ? undefined
              : { y: [0, 6, 0], opacity: [0.6, 1, 0.6] }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/25 text-amber-100/80"
        >
          <IconChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
