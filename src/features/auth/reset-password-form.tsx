"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction } from "@/features/auth/actions";
import { AuthField, FormMessage, SubmitButton } from "@/features/auth/form-fields";
import { initialAuthActionState } from "@/features/auth/validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialAuthActionState);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="token" value={token} />
      <AuthField
        id="password"
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.password}
      />
      <FormMessage status={state.status}>{state.message}</FormMessage>
      <SubmitButton>Reset Password</SubmitButton>
      {state.status === "success" ? (
        <Link className="text-center text-sm font-semibold text-brand-primary" href="/auth/log-in">
          Continue to Log In
        </Link>
      ) : null}
    </form>
  );
}
