"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { signInWithGoogle } from "@/app/auth/actions";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LoginModalProps = {
  nextPath?: string;
  triggerLabel?: string;
  triggerVariant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function LoginModal({
  nextPath,
  triggerLabel = "Login to vote",
  triggerVariant = "default",
  triggerSize = "sm",
  className,
  onClick,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: LoginModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const shouldReduceMotion = useReducedMotion();

  const resolvedNextPath = useMemo(() => {
    if (nextPath) {
      return nextPath;
    }

    const search = searchParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [nextPath, pathname, searchParams]);

  const spinTransition = useMemo(
    () => ({
      duration: 360,
      repeat: Infinity,
      ease: "linear" as const,
    }),
    []
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={className}
            onClick={onClick}
          >
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md overflow-hidden border-amber-200/20 bg-[#210b11]/80 p-0 shadow-2xl backdrop-blur-2xl">
        {/* Background Mandala Decoration */}
        <div className="pointer-events-none absolute inset-0 z-0 select-none">
          <motion.div
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={spinTransition}
            className="absolute -right-20 -top-20 w-64 blur-[0.5px] will-change-transform"
          >
            <Image
              src="/mandala/mandala-gold.svg"
              alt=""
              width={300}
              height={300}
              loading="lazy"
              className="h-full w-full opacity-40"
            />
          </motion.div>
          <motion.div
            animate={shouldReduceMotion ? undefined : { rotate: -360 }}
            transition={spinTransition}
            className="absolute -bottom-20 -left-20 w-64 blur-[0.5px] will-change-transform"
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
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center">
          <DialogHeader className="mb-6 space-y-3">
            <DialogTitle className="text-3xl font-bold tracking-tight text-amber-50">
              Sign in to Vote
            </DialogTitle>
            <DialogDescription className="text-balance text-base text-amber-100/90">
              Spread the joy of the new year by supporting our talented Aurudu
              Kumara & Kumariya!
            </DialogDescription>
          </DialogHeader>

          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-amber-200/15 bg-white/5 p-4 text-sm text-amber-100/80">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <p className="text-left">
                Cast your vote securely using your Google account.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <p className="text-left">
                <strong>Important:</strong> You can only vote for{" "}
                <span className="text-amber-300">one contestant</span> in each
                category (Aurudu Kumara & Kumariya).
              </p>
            </div>
          </div>

          <form action={signInWithGoogle} className="w-full">
            <input type="hidden" name="next" value={resolvedNextPath || "/"} />
            <button
              type="submit"
              id="google-sign-in-modal-button"
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-amber-200/30 bg-white/10 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-amber-200/50 hover:bg-white/15 active:scale-[0.98]"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Continue with Google</span>
            </button>
          </form>

          <p className="mt-6 text-xs text-amber-100/50">
            Secure authentication powered by Supabase
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
