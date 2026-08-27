import type { Metadata } from "next";

import { SearchDiscoveryError, SearchDiscoveryPage } from "@/components/marketplace/search-discovery-page";
import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Search GuzoMarket",
  description: "Search active DMV marketplace listings by keyword, location, category, price, and filters.",
  alternates: {
    canonical: "/search",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const criteria = parseSearchCriteria(await searchParams);
  const result = await loadSearchResult(criteria);

  if (!result.ok) {
    return <SearchDiscoveryError />;
  }

  return <SearchDiscoveryPage result={result.data} />;
}

async function loadSearchResult(criteria: ReturnType<typeof parseSearchCriteria>) {
  try {
    return { ok: true as const, data: await searchMarketplaceListings(criteria) };
  } catch {
    return { ok: false as const };
  }
}
