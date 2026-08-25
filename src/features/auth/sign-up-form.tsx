"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction } from "@/features/auth/actions";
import { AuthField, FormMessage, SubmitButton } from "@/features/auth/form-fields";
import { initialAuthActionState } from "@/features/auth/validation";

export function SignUpForm({ returnTo }: { returnTo: string }) {
  const [state, action] = useActionState(signUpAction, initialAuthActionState);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      <AuthField
        id="displayName"
        name="displayName"
        label="Display name"
        autoComplete="name"
        required
        errors={state.fieldErrors?.displayName}
      />
      <AuthField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        errors={state.fieldErrors?.email}
      />
      <AuthField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.password}
      />
      <label className="flex gap-3 text-sm leading-6 text-text-secondary">
        <input
          name="terms"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded-sm border-border text-brand-primary"
          aria-describedby={state.fieldErrors?.terms ? "terms-error" : undefined}
        />
        <span>I agree to follow GuzoMarket marketplace rules and account security requirements.</span>
      </label>
      {state.fieldErrors?.terms ? (
        <p id="terms-error" className="text-sm text-error">
          {state.fieldErrors.terms[0]}
        </p>
      ) : null}
      <FormMessage status={state.status}>{state.message}</FormMessage>
      <SubmitButton>Create Account</SubmitButton>
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-primary" href={`/auth/log-in?returnTo=${encodeURIComponent(returnTo)}`}>
          Log In
        </Link>
      </p>
    </form>
  );
}
