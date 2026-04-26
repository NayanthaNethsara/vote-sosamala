"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

export function LoginModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const search = searchParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Login to vote</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-white/15 bg-slate-950/95">
        <DialogHeader>
          <DialogTitle className="text-xl">Sign in to vote</DialogTitle>
          <DialogDescription>
            Continue with Google to cast your vote securely.
          </DialogDescription>
        </DialogHeader>

        <form action={signInWithGoogle} className="mt-2">
          <input type="hidden" name="next" value={nextPath || "/"} />
          <button
            type="submit"
            id="google-sign-in-modal-button"
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
