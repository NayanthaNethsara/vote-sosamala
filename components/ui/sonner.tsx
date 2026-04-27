"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <WarningIcon className="size-4" />,
        error: <XCircleIcon className="size-4" />,
        loading: <SpinnerIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "transparent",
          "--normal-text": "inherit",
          "--normal-border": "transparent",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#210b11]/80 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-amber-50 group-[.toaster]:border-amber-200/20 group-[.toaster]:shadow-[0_16px_40px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-2xl font-mono",
          description: "group-[.toast]:text-amber-100/70",
          actionButton:
            "group-[.toast]:bg-amber-400 group-[.toast]:text-amber-950 group-[.toast]:rounded-full group-[.toast]:px-4 group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-amber-100 group-[.toast]:rounded-full group-[.toast]:px-4",
          error:
            "group-[.toaster]:bg-[#3b0a14]/80 group-[.toaster]:border-red-500/30 group-[.toaster]:text-red-200 group-[.toaster]:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
          success:
            "group-[.toaster]:bg-[#210b11]/80 group-[.toaster]:border-amber-400/40 group-[.toaster]:text-amber-200 group-[.toaster]:shadow-[0_0_20px_rgba(251,191,36,0.15)]",
          warning:
            "group-[.toaster]:bg-[#381a0b]/80 group-[.toaster]:border-orange-500/30 group-[.toaster]:text-orange-200",
          info: "group-[.toaster]:bg-[#210b11]/80 group-[.toaster]:border-amber-200/20 group-[.toaster]:text-amber-50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
