"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type VoteSubmitButtonProps = {
  contestantName: string;
  className?: string;
  disabled?: boolean;
  disabledLabel?: string;
};

export function VoteSubmitButton({
  contestantName,
  className,
  disabled = false,
  disabledLabel,
}: VoteSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={pending}
      className={cn(
        "min-w-52 border border-amber-700/50 bg-amber-900 text-amber-50 hover:bg-amber-800 backdrop-blur-xl transition-all",
        className,
      )}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-50"
          />
          Submitting vote...
        </>
      ) : disabled ? (
        (disabledLabel ?? "Voting is unavailable")
      ) : (
        `Vote for ${contestantName}`
      )}
    </Button>
  );
}
