import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { AccountShell } from "@/features/account/account-shell";
import { MyListings } from "@/features/account/my-listings";
import { getAccountListings, normalizeAccountListingTab } from "@/server/account/service";
import { requireActiveUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "My Listings | GuzoMarket",
  robots: { index: false, follow: false },
};

type AccountListingsPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function AccountListingsPage({ searchParams }: AccountListingsPageProps) {
  const params = await searchParams;
  const user = await requireActiveUser("/account/listings");
  const selectedTab = normalizeAccountListingTab(params.tab);
  const data = await getAccountListings(user.id, selectedTab);

  return (
    <div className="bg-background pb-24 sm:pb-10">
      <Container className="py-6 lg:py-8">
        <AccountShell active="listings">
          <MyListings data={data} />
        </AccountShell>
      </Container>
    </div>
  );
}
