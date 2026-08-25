import Link from "next/link";
import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/auth-shell";
import { ResendVerificationForm } from "@/features/auth/resend-verification-form";
import { verifyEmailToken } from "@/server/auth/tokens";

export const metadata: Metadata = {
  title: "Verify Email | GuzoMarket",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ token?: string; email?: string; returnTo?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const email = typeof params.email === "string" ? params.email : "";
  const result = token ? await verifyEmailToken(token) : null;

  if (result?.ok) {
    return (
      <AuthShell title="Email verified" description="Your GuzoMarket account is ready to use.">
        <Link className="text-sm font-semibold text-brand-primary" href="/auth/log-in">
          Continue to Log In
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={token ? "Verification link expired" : "Check your email"}
      description={
        token
          ? "This verification link is invalid, expired, or already used."
          : "Open the verification email to activate marketplace account features."
      }
    >
      <ResendVerificationForm email={email} />
    </AuthShell>
  );
}
