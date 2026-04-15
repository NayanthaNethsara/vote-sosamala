import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "group/input-group flex h-8 w-full items-center border border-input bg-transparent focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "h-full w-full min-w-0 border-0 bg-transparent px-2.5 text-xs outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "inline-start" | "inline-end";
}) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "flex h-full items-center",
        align === "inline-end" ? "ml-auto" : "mr-auto",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  return (
    <Button
      type="button"
      className={cn("h-full border-0", className)}
      {...props}
    />
  );
}

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton };
