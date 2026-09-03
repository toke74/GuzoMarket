import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { AccountShell } from "@/features/account/account-shell";
import { ProfileForm } from "@/features/account/profile-form";
import { getAccountProfile } from "@/server/account/service";
import { requireActiveUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Profile | GuzoMarket",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const user = await requireActiveUser("/account/profile");
  const profile = await getAccountProfile(user.id);

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="py-6 lg:py-8">
        <AccountShell active="profile">
          <ProfileForm profile={profile} />
        </AccountShell>
      </Container>
    </div>
  );
}
