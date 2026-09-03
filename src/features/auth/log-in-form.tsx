"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { logInAction } from "@/features/auth/actions";
import { AuthField, FormMessage, SubmitButton } from "@/features/auth/form-fields";
import { initialAuthActionState } from "@/features/auth/validation";

export function LogInForm({ returnTo }: { returnTo: string }) {
  const [state, action] = useActionState(logInAction, initialAuthActionState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state]);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
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
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
      />
      <FormMessage status={state.status}>{state.message}</FormMessage>
      <SubmitButton>Log In</SubmitButton>
      <div className="flex flex-wrap justify-between gap-3 text-sm">
        <Link className="font-semibold text-brand-primary" href="/auth/forgot-password">
          Forgot Password
        </Link>
        <Link className="font-semibold text-brand-primary" href={`/auth/sign-up?returnTo=${encodeURIComponent(returnTo)}`}>
          Create Account
        </Link>
      </div>
    </form>
  );
}
