import type { Metadata } from "next";

import { SearchDiscoveryError, SearchDiscoveryPage } from "@/components/marketplace/search-discovery-page";
import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

type CategoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Cars in the DMV | GuzoMarket",
  description: "Browse active car and vehicle listings across Washington, DC, Maryland, and Northern Virginia.",
  alternates: { canonical: "/cars" },
};

export default async function CarsPage({ searchParams }: CategoryPageProps) {
  const criteria = parseSearchCriteria(await searchParams, { category: "cars-vehicles" });
  const result = await loadSearchResult(criteria);

  if (!result.ok) {
    return <SearchDiscoveryError />;
  }

  return (
    <SearchDiscoveryPage
      result={result.data}
      title="Cars & Vehicles"
      description="Find active car and vehicle listings around the DMV."
      pathname="/cars"
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
