import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm transition-colors focus-visible:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
