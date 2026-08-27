import type { Metadata } from "next";

import { SearchDiscoveryError, SearchDiscoveryPage } from "@/components/marketplace/search-discovery-page";
import { categoryLandingSections, loadCategoryLandingResult, resolveCategoryForLanding } from "@/server/marketplace/category-landing";

type SubcategoryPageProps = {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { subcategory } = await params;
  const category = await resolveCategoryForLanding(categoryLandingSections.cars.rootSlug, subcategory);

  return {
    title: `${category.name} in the DMV | GuzoMarket`,
    description: category.description ?? `Browse active ${category.name.toLowerCase()} listings across the DMV.`,
    alternates: { canonical: `/cars/${subcategory}` },
  };
}

export default async function CarsSubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const [{ subcategory }, query] = await Promise.all([params, searchParams]);
  const result = await loadCategoryLandingResult({ section: "cars", subcategorySlug: subcategory, searchParams: query });

  if (!result.ok) {
    return <SearchDiscoveryError />;
  }

  return (
    <SearchDiscoveryPage
      result={result.data}
      title={result.category.name}
      description={result.category.description ?? "Browse active car and vehicle listings across the DMV."}
      pathname={`/cars/${subcategory}`}
      categoryMode
    />
  );
}
