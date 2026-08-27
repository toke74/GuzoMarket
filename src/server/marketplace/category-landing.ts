import { notFound } from "next/navigation";

import { prisma } from "@/server/db/client";
import { CategoryDomainType } from "@/server/db/generated/prisma/client";
import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

export const categoryLandingSections = {
  "buy-sell": {
    title: "Buy & Sell",
    description: "Find active local goods from DMV neighbors.",
    rootSlug: "buy-sell",
  },
  housing: {
    title: "Housing",
    description: "Browse active rooms, rentals, and local housing opportunities.",
    rootSlug: "housing",
  },
  cars: {
    title: "Cars & Vehicles",
    description: "Find active car and vehicle listings around the DMV.",
    rootSlug: "cars-vehicles",
  },
} as const;

export type CategoryLandingSectionSlug = keyof typeof categoryLandingSections;

export async function loadCategoryLandingResult({
  section,
  subcategorySlug,
  searchParams,
}: {
  section: CategoryLandingSectionSlug;
  subcategorySlug?: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const config = categoryLandingSections[section];
  const category = await resolveCategoryForLanding(config.rootSlug, subcategorySlug);
  const criteria = parseSearchCriteria(searchParams, { category: category.slug });

  try {
    return { ok: true as const, data: await searchMarketplaceListings(criteria), category };
  } catch {
    return { ok: false as const };
  }
}

export async function resolveCategoryForLanding(rootSlug: string, subcategorySlug?: string) {
  const root = await prisma.category.findFirst({
    where: {
      slug: rootSlug,
      parentId: null,
      isActive: true,
      domainType: CategoryDomainType.LISTING,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      children: {
        where: { isActive: true, domainType: CategoryDomainType.LISTING },
        select: { id: true, name: true, slug: true, description: true },
      },
    },
  });

  if (!root) {
    notFound();
  }

  if (!subcategorySlug) {
    return root;
  }

  const normalized = normalizeRouteSlug(subcategorySlug);
  const child = root.children.find((category) => category.slug === normalized || routeAliases[normalized] === category.slug);

  if (!child) {
    notFound();
  }

  return child;
}

function normalizeRouteSlug(slug: string) {
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

const routeAliases: Record<string, string> = {
  apartments: "apartments-for-rent",
};
