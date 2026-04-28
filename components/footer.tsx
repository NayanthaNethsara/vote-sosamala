import Link from "next/link";
import { LifeBuoy, ShieldCheck } from "lucide-react";

import { siteConfig } from "@/config/site-config";

export function Footer() {
  return (
    <section className="relative w-full overflow-hidden">
      <footer className="relative mt-0 w-full overflow-hidden rounded-none border-x-0 border-b-0 border-t border-amber-200/10 bg-amber-50/5 px-5 py-4 backdrop-blur-xl sm:px-7 sm:py-5">
        <div className="relative z-20 flex items-center justify-between gap-6">
          <div className="flex flex-1 flex-row items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-amber-100/40 sm:gap-6 sm:text-[11px]">
            <p className="hidden sm:block">
              © {new Date().getFullYear()} {siteConfig.name}
            </p>
            <p className="sm:hidden">© {new Date().getFullYear()}</p>
            <div className="h-3 w-px bg-amber-200/10" />
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href={siteConfig.links.rules}
                className="transition-colors hover:text-amber-200"
                title="Rules & Guidelines"
              >
                <span className="hidden sm:inline">Rules</span>
                <LifeBuoy className="h-4 w-4 sm:hidden" />
              </Link>
              <Link
                href="/support"
                prefetch={false}
                className="transition-colors hover:text-amber-200"
                title="Privacy Policy"
              >
                <span className="hidden sm:inline">Privacy Policy</span>
                <ShieldCheck className="h-4 w-4 sm:hidden" />
              </Link>
              <Link
                href="/support"
                prefetch={false}
                className="transition-colors hover:text-amber-200"
                title="Support"
              >
                <span className="hidden sm:inline">Support</span>
                <LifeBuoy className="h-4 w-4 sm:hidden" />
              </Link>
            </div>
          </div>

          {/* Fading horizontal line */}
          <div className="hidden h-px flex-1 bg-linear-to-r from-amber-200/10 via-transparent to-transparent sm:block" />

          <Link
            href="https://nayantha.me"
            target="_blank"
            className="whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-amber-100/40 transition-colors hover:text-amber-200 sm:text-[11px]"
          >
            by <span className="font-bold">nayantha.me</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-linear-to-r from-transparent via-amber-200/5 to-transparent" />
        <div className="absolute bottom-0 left-0 h-24 w-full bg-linear-to-t from-black/40 via-transparent to-transparent" />
      </footer>
    </section>
  );
}
