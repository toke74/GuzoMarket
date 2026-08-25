import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/auth-shell";
import { LogInForm } from "@/features/auth/log-in-form";
import { normalizeReturnTo } from "@/server/auth/redirects";

export const metadata: Metadata = {
  title: "Log In | GuzoMarket",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LogInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const returnTo = normalizeReturnTo(params.returnTo);

  return (
    <AuthShell
      title="Log in"
      description="Use your GuzoMarket account to post, save, message, and manage listings."
    >
      <LogInForm returnTo={returnTo} />
    </AuthShell>
  );
}
