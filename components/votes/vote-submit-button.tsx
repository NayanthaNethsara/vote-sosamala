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
      className="min-w-52"
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
          Submitting vote...
        </>
      ) : (
        `Vote for ${contestantName}`
      )}
    </Button>
  );
}
