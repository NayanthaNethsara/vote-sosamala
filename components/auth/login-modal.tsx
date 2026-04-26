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
};

export function LoginModal({
  nextPath,
  triggerLabel = "Login to vote",
  triggerVariant = "default",
  triggerSize = "sm",
  className,
  onClick,
}: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolvedNextPath = useMemo(() => {
    if (nextPath) {
      return nextPath;
    }

    const search = searchParams.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [nextPath, pathname, searchParams]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="max-w-md border-amber-200/20 bg-[#210b11]/95">
        <DialogHeader>
          <DialogTitle className="text-xl">Sign in to vote</DialogTitle>
          <DialogDescription>
            Continue with Google to cast your vote securely.
          </DialogDescription>
        </DialogHeader>

        <form action={signInWithGoogle} className="mt-2">
          <input type="hidden" name="next" value={resolvedNextPath || "/"} />
          <button
            type="submit"
            id="google-sign-in-modal-button"
            className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-amber-200/20 bg-amber-50/6 px-4 py-3 text-sm font-medium text-amber-50 transition-all duration-200 hover:border-amber-200/35 hover:bg-amber-100/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#210b11]"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
