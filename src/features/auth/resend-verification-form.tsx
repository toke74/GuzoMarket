"use client";

import { useActionState } from "react";

import { resendVerificationAction } from "@/features/auth/actions";
import { AuthField, FormMessage, SubmitButton } from "@/features/auth/form-fields";
import { initialAuthActionState } from "@/features/auth/validation";

export function ResendVerificationForm({ email }: { email: string }) {
  const [state, action] = useActionState(resendVerificationAction, initialAuthActionState);

  return (
    <form action={action} className="grid gap-5">
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={email}
        errors={state.fieldErrors?.email}
      />
      <FormMessage status={state.status}>{state.message}</FormMessage>
      <SubmitButton>Resend Verification Email</SubmitButton>
    </form>
  );
}
