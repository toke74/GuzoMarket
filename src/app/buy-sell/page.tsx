import type { Metadata } from "next";

import { SearchDiscoveryError, SearchDiscoveryPage } from "@/components/marketplace/search-discovery-page";
import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

type CategoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Buy & Sell in the DMV | GuzoMarket",
  description: "Browse local furniture, electronics, and everyday goods across the DMV.",
  alternates: { canonical: "/buy-sell" },
};

export default async function BuySellPage({ searchParams }: CategoryPageProps) {
  const criteria = parseSearchCriteria(await searchParams, { category: "buy-sell" });
  const result = await loadSearchResult(criteria);

  if (!result.ok) {
    return <SearchDiscoveryError />;
  }

  return (
    <SearchDiscoveryPage
      result={result.data}
      title="Buy & Sell"
      description="Find active local goods from DMV neighbors."
      pathname="/buy-sell"
      categoryMode
    />
  );
}

async function loadSearchResult(criteria: ReturnType<typeof parseSearchCriteria>) {
  try {
    return { ok: true as const, data: await searchMarketplaceListings(criteria) };
  } catch {
    return { ok: false as const };
  }
}
