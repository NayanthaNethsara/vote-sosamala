"use client";

import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/hooks/use-login-modal";

interface LoginButtonProps {
  label?: string;
  nextPath?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LoginButton({
  label = "Login to vote",
  nextPath,
  className,
  variant = "default",
  size = "sm",
}: LoginButtonProps) {
  const { openModal } = useLoginModal();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => openModal(nextPath)}
    >
      {label}
    </Button>
  );
}
