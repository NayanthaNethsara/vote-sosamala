"use client";

import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface ProtectedImageProps extends ImageProps {
  containerClassName?: string;
  children?: React.ReactNode;
}

export function ProtectedImage({
  containerClassName,
  className,
  children,
  ...props
}: ProtectedImageProps) {
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", containerClassName)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        {...props}
        draggable={false}
        className={cn("select-none", className)}
      />
      {children}
    </div>
  );
}
