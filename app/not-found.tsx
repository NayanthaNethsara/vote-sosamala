import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#24080f_0%,#40101a_45%,#27080f_100%)] px-6 text-amber-50">
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light bg-[url('/landing-page/noise.svg')]" />
      <section className="relative mx-auto max-w-xl rounded-3xl border border-amber-200/20 bg-amber-50/6 p-8 text-center shadow-2xl shadow-black/25 backdrop-blur sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-amber-100/75 sm:text-base">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            asChild
            className="bg-[#7f1d2d] text-amber-50 hover:bg-[#97233a]"
          >
            <Link href="/">Go to home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
