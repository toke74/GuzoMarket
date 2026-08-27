import type { Metadata } from "next";

import { SearchDiscoveryError, SearchDiscoveryPage } from "@/components/marketplace/search-discovery-page";
import { categoryLandingSections, loadCategoryLandingResult, resolveCategoryForLanding } from "@/server/marketplace/category-landing";

type SubcategoryPageProps = {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { subcategory } = await params;
  const category = await resolveCategoryForLanding(categoryLandingSections.housing.rootSlug, subcategory);

  return {
    title: `${category.name} in the DMV | GuzoMarket`,
    description: category.description ?? `Browse active ${category.name.toLowerCase()} listings across the DMV.`,
    alternates: { canonical: `/housing/${subcategory}` },
  };
}

export default async function HousingSubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const [{ subcategory }, query] = await Promise.all([params, searchParams]);
  const result = await loadCategoryLandingResult({ section: "housing", subcategorySlug: subcategory, searchParams: query });

  if (!result.ok) {
    return <SearchDiscoveryError />;
  }

  return (
    <SearchDiscoveryPage
      result={result.data}
      title={result.category.name}
      description={result.category.description ?? "Browse active housing listings across the DMV."}
      pathname={`/housing/${subcategory}`}
      categoryMode
    />
  );
}
