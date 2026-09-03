import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Lock, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccountShell } from "@/features/account/account-shell";
import { getAccountProfile } from "@/server/account/service";
import { requireActiveUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Privacy | GuzoMarket",
  robots: { index: false, follow: false },
};

export default async function AccountPrivacyPage() {
  const user = await requireActiveUser("/account/privacy");
  const profile = await getAccountProfile(user.id);

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="py-6 lg:py-8">
        <AccountShell active="privacy">
          <section className="grid gap-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-6">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-navy">Privacy</h1>
              <p className="mt-1 text-sm leading-6 text-text-secondary">Current profile and public location controls for your account.</p>
            </div>
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <Eye className="mt-1 h-4 w-4 text-brand-primary" aria-hidden="true" />
                  <div>
                    <h2 className="font-semibold text-text-primary">Public profile visibility</h2>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">Controlled from profile settings and respected by public seller DTOs.</p>
                  </div>
                </div>
                <Badge variant={profile.isPublic ? "success" : "outline"}>{profile.isPublic ? "Public" : "Private"}</Badge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-brand-primary" aria-hidden="true" />
                  <div>
                    <h2 className="font-semibold text-text-primary">Public location display</h2>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">Listings preserve approximate public location only. Exact addresses and coordinates are not collected in the listing flow.</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-text-secondary">{profile.publicLocationText || "DMV"}</span>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-1 h-4 w-4 text-brand-primary" aria-hidden="true" />
                  <div>
                    <h2 className="font-semibold text-text-primary">Blocked users</h2>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">The schema supports blocks, but blocking UI is not implemented in this stage.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/account/profile">Edit Privacy Fields</Link>
              </Button>
            </div>
          </section>
        </AccountShell>
      </Container>
    </div>
  );
}
