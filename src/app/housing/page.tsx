import type { Metadata } from "next";

import { SearchDiscoveryError, SearchDiscoveryPage } from "@/components/marketplace/search-discovery-page";
import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

type CategoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Housing in the DMV | GuzoMarket",
  description: "Browse rooms, rentals, and shared housing opportunities across the DMV.",
  alternates: { canonical: "/housing" },
};

export default async function HousingPage({ searchParams }: CategoryPageProps) {
  const criteria = parseSearchCriteria(await searchParams, { category: "housing" });
  const result = await loadSearchResult(criteria);

  if (!result.ok) {
    return <SearchDiscoveryError />;
  }

  return (
    <SearchDiscoveryPage
      result={result.data}
      title="Housing"
      description="Browse active rooms, rentals, and local housing opportunities."
      pathname="/housing"
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
