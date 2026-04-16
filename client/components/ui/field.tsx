import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field" className={cn("grid gap-2", className)} {...props} />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return <Label className={cn(className)} {...props} />;
}

export { Field, FieldLabel };
