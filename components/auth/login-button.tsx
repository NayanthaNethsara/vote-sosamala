"use client";

import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/hooks/use-login-modal";

interface LoginButtonProps {
  label?: string;
  nextPath?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function LoginButton({
  label = "Login to vote",
  nextPath,
  className,
  variant = "default",
  size = "sm",
  disabled = false,
}: LoginButtonProps) {
  const { openModal } = useLoginModal();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      onClick={() => openModal(nextPath)}
    >
      {label}
    </Button>
  );
}
