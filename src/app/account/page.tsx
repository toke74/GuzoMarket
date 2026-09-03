import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Bookmark, Lock, MessageSquare, Settings, Shield, Store, UserRound } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { AccountShell } from "@/features/account/account-shell";
import { getAccountProfile } from "@/server/account/service";
import { requireActiveUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Account | GuzoMarket",
  robots: { index: false, follow: false },
};

const overviewLinks = [
  { href: "/account/profile", label: "Profile", description: "Edit public seller fields.", icon: UserRound, available: true },
  { href: "/account/listings", label: "My Listings", description: "Manage drafts and listing lifecycle.", icon: Store, available: true },
  { href: "/saved/listings", label: "Saved", description: "Saved listings arrive in Stage 12.", icon: Bookmark, available: false },
  { href: "/messages", label: "Messages", description: "Messaging is deferred.", icon: MessageSquare, available: false },
  { href: "/notifications", label: "Notifications", description: "Notification center is deferred.", icon: Bell, available: false },
  { href: "/account/security", label: "Security", description: "Email status and auth entry points.", icon: Shield, available: true },
  { href: "/account/privacy", label: "Privacy", description: "Profile and public location controls.", icon: Lock, available: true },
  { href: "/account/settings", label: "Settings", description: "General settings are deferred.", icon: Settings, available: false },
] as const;

export default async function AccountPage() {
  const user = await requireActiveUser("/account");
  const profile = await getAccountProfile(user.id);

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="py-6 lg:py-8">
        <AccountShell active="overview">
          <section className="grid gap-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-extrabold text-navy">Account</h1>
                <p className="mt-1 text-sm leading-6 text-text-secondary">Signed in as {profile.displayName}.</p>
              </div>
              <Badge variant={profile.isPublic ? "success" : "outline"}>
                Profile {profile.isPublic ? "public" : "private"}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {overviewLinks.map((item) => {
                const Icon = item.icon;
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <Icon className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                      {item.available ? <ArrowRight className="h-4 w-4 text-text-secondary" aria-hidden="true" /> : <Badge variant="outline">Deferred</Badge>}
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-navy">{item.label}</h2>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
                    </div>
                  </>
                );
                return item.available ? (
                  <Link key={item.label} href={item.href} className="grid min-h-36 gap-4 rounded-md border border-border bg-background p-4 hover:border-border-strong hover:bg-surface-muted">
                    {body}
                  </Link>
                ) : (
                  <div key={item.label} aria-disabled="true" className="grid min-h-36 gap-4 rounded-md border border-border bg-background p-4 opacity-75">
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        </AccountShell>
      </Container>
    </div>
  );
}
