"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type VoteSubmitButtonProps = {
  contestantName: string;
};

export function VoteSubmitButton({ contestantName }: VoteSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      className="min-w-52 bg-[#7f1d2d] text-amber-50 hover:bg-[#97233a]"
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-50"
          />
          Submitting vote...
        </>
      ) : (
        `Vote for ${contestantName}`
      )}
    </Button>
  );
}
