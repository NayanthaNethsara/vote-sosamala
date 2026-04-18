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
      className="glass-button inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-medium"
    >
      {copied ? "Copied" : "Share"}
    </button>
  );
}
