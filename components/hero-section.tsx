"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import Floating, { FloatingElement } from "@/components/ui/parallex-floting";
import { Spotlight } from "./ui/spotlight-new";

export function ButtonMain({ href, name }: { href: string; name: string }) {
  return (
    <Link href={href}>
      <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-1 text-lg font-semibold leading-8 text-white inline-block">
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </span>
        <div className="relative flex space-x-3 items-center z-10 rounded-full bg-zinc-950 py-2 px-8 ring-1 ring-white/10">
          <span>{name}</span>
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
      </button>
    </Link>
  );
}

const heroImages = [
  {
    url: "/landing-page/f-1.jpg",
    title: "Hero 1",
  },
  {
    url: "/landing-page/f-2.jpg",
    title: "Hero 1",
  },
  {
    url: "/landing-page/f-3.png",
    title: "Hero 1",
  },
  {
    url: "/landing-page/m-1.jpg",
    title: "Hero 1",
  },
  {
    url: "/landing-page/m-2.jpg",
    title: "Hero 1",
  },
];

function LandingHero() {
  return (
    <section className="select-none w-full h-screen overflow-hidden flex flex-col items-center justify-center relative">
      <Spotlight />
      <Floating sensitivity={-0.5} className="h-full w-full overflow-hidden">
        {/* Top Left */}
        <FloatingElement depth={0.5} className="top-[15%] left-[4%]">
          <motion.img
            src={heroImages[0].url}
            alt={heroImages[0].title}
            className="select-none w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        </FloatingElement>

        {/* Top Center-Left */}
        <FloatingElement depth={1} className="top-[6%] left-[12%]">
          <motion.img
            src={heroImages[1].url}
            alt={heroImages[1].title}
            className="select-none w-40 h-28 sm:w-48 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-12 shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />
        </FloatingElement>

        {/* Bottom Left */}
        <FloatingElement depth={4} className="bottom-[5%] left-[8%]">
          <motion.img
            src={heroImages[2].url}
            alt={heroImages[2].title}
            className="select-none w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 lg:w-64 lg:h-64 object-cover -rotate-[4deg] hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </FloatingElement>

        {/* Top Right */}
        <FloatingElement depth={2} className="top-[2%] right-[5%]">
          <motion.img
            src={heroImages[3].url}
            alt={heroImages[3].title}
            className="select-none w-40 h-36 sm:w-48 sm:h-44 md:w-60 md:h-52 lg:w-64 lg:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[6deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          />
        </FloatingElement>

        {/* Bottom Right */}
        <FloatingElement depth={1} className="bottom-[6%] right-[4%]">
          <motion.img
            src={heroImages[4].url}
            alt={heroImages[4].title}
            className="select-none w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[19deg] rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          />
        </FloatingElement>
      </Floating>

      <div className="select-none flex flex-col justify-center items-center w-[250px] sm:w-[300px] md:w-[500px] lg:w-[700px] z-50 pointer-events-auto">
        <motion.h1
          className="text-4xl md:text-7xl lg:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-green-400 via-yellow-400 to-pink-400 [text-shadow:0_0_rgba(0,0,0,0.1)]">
              <span>Cutie & Cuta</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-green-400 via-yellow-400 to-pink-400 py-4">
              <span>Cutie & Cuta</span>
            </div>
          </div>
        </motion.h1>

        <p className="text-neutral-300 max-w-2xl mx-auto my-2 text-base text-center relative z-10">
          Deep within the wild and whimsical jungle, it's time to crown the one
          true Cutie and the fearless Cuta! A fun-filled contest of charm,
          creativity, and untamed personality awaits — who will rise to the top
          of the animal kingdom?
        </p>

        <div className="flex flex-row justify-center space-x-4 items-center mt-10 sm:mt-16 md:mt-20 lg:mt-8">
          <ButtonMain href="/cutie" name="Cutie" />
          <ButtonMain href="/cuta" name="Cuta" />
        </div>
      </div>
    </section>
  );
}

export { LandingHero };
