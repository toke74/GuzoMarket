import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn("text-sm font-semibold leading-none text-text-primary", className)}
      {...props}
    />
  );
}
