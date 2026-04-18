import { HomeContent } from "@/components/public/home-content";
import "@/styles/home-content.css";

export default function Home() {
  return (
    <div className="vote-shell relative w-full min-h-screen overflow-x-hidden rounded-none font-sans selection:bg-white/20">
      <main className="relative z-10 flex w-full min-h-[120vh] flex-col items-center justify-center rounded-none border-b border-white/14 bg-white/12 p-6 text-foreground shadow-[0_32px_120px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,oklch(0.78_0.16_335/0.12)_0%,transparent_60%)]" />

        <h1 className="vote-heading mb-8 px-4 text-center text-4xl tracking-[0.12em] text-muted-foreground md:text-5xl">
          Scroll Down To Reveal
        </h1>

        <div className="h-32 w-px bg-linear-to-b from-primary/70 to-transparent" />
      </main>

      <HomeContent />
    </div>
  );
}
