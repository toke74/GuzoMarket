"use client";

import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction } from "@/features/auth/actions";
import { AuthField, FormMessage, SubmitButton } from "@/features/auth/form-fields";
import { initialAuthActionState } from "@/features/auth/validation";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialAuthActionState);

  return (
    <form action={action} className="grid gap-5">
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        errors={state.fieldErrors?.email}
      />
      <FormMessage status={state.status}>{state.message}</FormMessage>
      <SubmitButton>Send Reset Instructions</SubmitButton>
      <Link className="text-center text-sm font-semibold text-brand-primary" href="/auth/log-in">
        Back to Log In
      </Link>
    </form>
  );
}
