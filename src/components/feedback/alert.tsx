import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "error";

const alertStyles: Record<AlertVariant, string> = {
  info: "border-info/20 bg-info/5 text-info",
  success: "border-success/20 bg-success/5 text-success",
  warning: "border-warning/20 bg-warning/5 text-warning",
  error: "border-error/20 bg-error/5 text-error",
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

type AlertProps = ComponentPropsWithoutRef<"div"> & {
  variant?: AlertVariant;
  title: string;
  children?: ReactNode;
};

export function Alert({ variant = "info", title, children, className, ...props }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4", alertStyles[variant], className)}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="text-text-primary">
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-1 text-sm leading-6 text-text-secondary">{children}</div> : null}
      </div>
    </div>
  );
}
