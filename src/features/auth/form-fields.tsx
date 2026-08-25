"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  errors?: string[];
};

export function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required,
  defaultValue,
  errors,
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={errors && errors.length > 0}
        aria-describedby={errors && errors.length > 0 ? errorId : undefined}
      />
      {errors && errors.length > 0 ? (
        <p id={errorId} className="text-sm text-error">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ status, children }: { status?: string; children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-sm border px-3 py-2 text-sm",
        status === "success"
          ? "border-success/30 bg-success/10 text-text-primary"
          : "border-error/30 bg-error/10 text-error",
      )}
      aria-live="polite"
    >
      {children}
    </p>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Working..." : children}
    </Button>
  );
}
