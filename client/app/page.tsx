import { HomeContent } from "@/components/public/home-content";
import "@/styles/home-content.css";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-background font-sans selection:bg-white/20">
      <main className="relative z-10 flex w-full min-h-[120vh] flex-col items-center justify-center rounded-b-3xl border-b border-white/10 bg-background text-white shadow-md">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03)_0%,transparent_60%)]" />

        <h1 className="mb-8 px-4 text-center text-4xl font-light tracking-[0.2em] text-neutral-400 uppercase md:text-5xl">
          Scroll Down To Reveal
        </h1>

        <div className="h-32 w-px bg-linear-to-b from-neutral-400 to-transparent" />
      </main>

      <HomeContent />
    </div>
  );
}
