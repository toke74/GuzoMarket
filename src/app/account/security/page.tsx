import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, LogOut, MailCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccountShell } from "@/features/account/account-shell";
import { logOutAction } from "@/features/auth/actions";
import { requireActiveUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Account Security | GuzoMarket",
  robots: { index: false, follow: false },
};

export default async function AccountSecurityPage() {
  const user = await requireActiveUser("/account/security");

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="py-6 lg:py-8">
        <AccountShell active="security">
          <section className="grid gap-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-6">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-navy">Security</h1>
              <p className="mt-1 text-sm leading-6 text-text-secondary">Signed in as {user.displayName}. Only currently supported account security actions are shown.</p>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-4">
                <dt className="flex items-center gap-2 font-semibold">
                  <MailCheck className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  Email
                </dt>
                <dd className="min-w-0 break-words text-text-secondary">{user.email}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-4">
                <dt className="font-semibold">Email verification</dt>
                <dd>
                  <Badge variant={user.emailVerifiedAt ? "success" : "warning"}>{user.emailVerifiedAt ? "Verified" : "Pending"}</Badge>
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/auth/forgot-password">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Password Reset
                </Link>
              </Button>
              <form action={logOutAction}>
                <Button type="submit" variant="outline">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log Out
                </Button>
              </form>
            </div>
            <div className="rounded-md border border-border bg-background p-4 text-sm leading-6 text-text-secondary">
              Account deletion is not enabled in the current backend service. MFA, passkeys, phone verification, and session management are intentionally deferred.
            </div>
          </section>
        </AccountShell>
      </Container>
    </div>
  );
}
