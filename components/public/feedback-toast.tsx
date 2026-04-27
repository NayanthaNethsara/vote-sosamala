"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function FeedbackToast({
  message,
  error,
}: {
  message?: string | null;
  error?: string | null;
}) {
  const hasToasted = useRef(false);

  useEffect(() => {
    if (hasToasted.current) return;

    if (error) {
      toast.error(error);
      hasToasted.current = true;
    } else if (message) {
      toast.success(message);
      hasToasted.current = true;
    }
  }, [error, message]);

  return null;
}
