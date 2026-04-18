"use client";

import { useState } from "react";

interface ContestantShareButtonProps {
  name: string;
  slug: string;
  basePath: string;
}

export function ContestantShareButton({
  name,
  slug,
  basePath,
}: ContestantShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const normalizedBasePath = basePath.startsWith("/")
      ? basePath
      : `/${basePath}`;
    const shareUrl = `${window.location.origin}${normalizedBasePath}/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to clipboard copying.
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 text-sm font-medium text-zinc-100 transition hover:bg-white/14"
    >
      {copied ? "Copied" : "Share"}
    </button>
  );
}
