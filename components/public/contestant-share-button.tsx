"use client";

import { useState } from "react";
import { ShareNetwork, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContestantShareButtonProps = {
  name: string;
  path: string;
  className?: string;
};

export function ContestantShareButton({
  name,
  path,
  className,
}: ContestantShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Construct the absolute URL
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    const title = `Vote for ${name} - Sosamala`;
    const text = `Check out ${name}'s profile and vote for them!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (error) {
        // Fallback to clipboard if share gets aborted or fails
        console.error("Error sharing:", error);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleShare}
      className={cn(
        "border border-amber-200/25 bg-amber-100/10 text-amber-50 hover:bg-amber-100/20",
        className,
      )}
    >
      {copied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <ShareNetwork className="mr-2 h-4 w-4" />
      )}
      {copied ? "Copied Link" : "Share"}
    </Button>
  );
}
