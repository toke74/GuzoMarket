import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/auth-shell";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { normalizeReturnTo } from "@/server/auth/redirects";

export const metadata: Metadata = {
  title: "Sign Up | GuzoMarket",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const returnTo = normalizeReturnTo(params.returnTo);

  return (
    <AuthShell
      title="Create your account"
      description="Join the DMV marketplace with a secure email and password account."
    >
      <SignUpForm returnTo={returnTo} />
    </AuthShell>
  );
}
