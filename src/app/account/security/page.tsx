import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logOutAction } from "@/features/auth/actions";
import { requireActiveUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Account Security | GuzoMarket",
  robots: { index: false, follow: false },
};

export default async function AccountSecurityPage() {
  const user = await requireActiveUser("/account/security");

  return (
    <Container className="py-10">
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <aside className="rounded-md border border-border bg-surface p-4">
          <p className="font-display text-lg font-semibold">Account</p>
          <p className="mt-2 text-sm text-text-secondary">Security</p>
        </aside>
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <p className="text-sm text-text-secondary">
              Signed in as {user.displayName}. Email verification and password recovery are active.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5">
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-3">
                <dt className="font-semibold">Email</dt>
                <dd className="text-text-secondary">{user.email}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-3">
                <dt className="font-semibold">Email verification</dt>
                <dd className="text-text-secondary">{user.emailVerifiedAt ? "Verified" : "Pending"}</dd>
              </div>
            </dl>
            <form action={logOutAction}>
              <Button type="submit" variant="outline">
                Log Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
