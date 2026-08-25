import Link from "next/link";
import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/auth-shell";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | GuzoMarket",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <AuthShell
      title="Choose a new password"
      description="Reset links are single-use and expire automatically."
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="grid gap-5">
          <p className="rounded-sm border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            That reset link is invalid or expired.
          </p>
          <Link className="text-center text-sm font-semibold text-brand-primary" href="/auth/forgot-password">
            Request a new reset link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
