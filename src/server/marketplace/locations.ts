import { unstable_cache } from "next/cache";

import { ApplicationError } from "@/lib/errors/application-error";
import { prisma } from "@/server/db/client";
import { LocationType } from "@/server/db/generated/prisma/client";

const DMV_REGION_SLUG = "dmv";
const LOCATION_CACHE_SECONDS = 300;
const LOCATION_CACHE_TAG = "marketplace:locations";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type PublicMarketplaceRegionDTO = {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  defaultRadiusMiles: number;
  isLaunchMarket: boolean;
};

export type PublicLocationDTO = {
  id: string;
  parentId: string | null;
  type: LocationType;
  name: string;
  slug: string;
  label: string;
  countryCode: string | null;
  regionCode: string | null;
  timezone: string | null;
};

type LocationLabelInput = {
  name: string;
  type: LocationType;
  regionCode: string | null;
  parent?: LocationLabelInput | null;
};

export const getLaunchMarketplaceRegion = unstable_cache(
  queryLaunchMarketplaceRegion,
  ["marketplace-launch-region"],
  {
    revalidate: LOCATION_CACHE_SECONDS,
    tags: [LOCATION_CACHE_TAG],
  },
);

export const getActiveMarketplaceLocations = unstable_cache(
  queryActiveMarketplaceLocations,
  ["marketplace-active-locations"],
  {
    revalidate: LOCATION_CACHE_SECONDS,
    tags: [LOCATION_CACHE_TAG],
  },
);

export async function validateActivePublicLocationId(locationId: string) {
  if (!uuidPattern.test(locationId)) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid location id." });
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, isActive: true },
    select: {
      id: true,
      type: true,
      parent: {
        select: {
          id: true,
          parent: {
            select: {
              id: true,
              parent: {
                select: {
                  id: true,
                  parent: {
                    select: {
                      id: true,
                      parent: { select: { id: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!location) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid location id." });
  }

  const ancestorIds = collectAncestorIds(location);
  const activeRegionLocation = await prisma.marketplaceRegionLocation.findFirst({
    where: {
      marketplaceRegion: { slug: DMV_REGION_SLUG, isActive: true },
      locationId: { in: [location.id, ...ancestorIds] },
      location: { isActive: true },
    },
    select: { id: true },
  });

  if (!activeRegionLocation) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid location id." });
  }

  return { id: location.id, type: location.type };
}

export async function queryLaunchMarketplaceRegion(): Promise<PublicMarketplaceRegionDTO> {
  const region = await prisma.marketplaceRegion.findFirst({
    where: { slug: DMV_REGION_SLUG, isActive: true, isLaunchMarket: true },
    select: {
      id: true,
      name: true,
      slug: true,
      countryCode: true,
      defaultRadiusMiles: true,
      isLaunchMarket: true,
    },
  });

  if (!region) {
    throw new ApplicationError("NOT_FOUND", { message: "Active launch marketplace region not found." });
  }

  return region;
}

export async function queryActiveMarketplaceLocations(): Promise<PublicLocationDTO[]> {
  const regionLocations = await prisma.marketplaceRegionLocation.findMany({
    where: {
      marketplaceRegion: { slug: DMV_REGION_SLUG, isActive: true },
      location: { isActive: true },
    },
    orderBy: [{ priority: "asc" }, { location: { name: "asc" } }],
    select: {
      location: {
        select: {
          id: true,
          parentId: true,
          type: true,
          name: true,
          slug: true,
          countryCode: true,
          regionCode: true,
          timezone: true,
          parent: {
            select: {
              name: true,
              type: true,
              regionCode: true,
              parent: {
                select: {
                  name: true,
                  type: true,
                  regionCode: true,
                  parent: { select: { name: true, type: true, regionCode: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return regionLocations.map(({ location }) => ({
    id: location.id,
    parentId: location.parentId,
    type: location.type,
    name: location.name,
    slug: location.slug,
    label: formatPublicLocationLabel(location),
    countryCode: location.countryCode,
    regionCode: location.regionCode,
    timezone: location.timezone,
  }));
}

export function formatPublicLocationLabel(location: LocationLabelInput): string {
  if (location.name.includes(",")) {
    return location.name;
  }

  if (location.type === LocationType.NEIGHBORHOOD) {
    const city = findAncestor(location, LocationType.CITY);
    const regionCode = location.regionCode ?? city?.regionCode ?? findRegionCode(location);
    return [location.name, city?.name, regionCode].filter(Boolean).join(", ");
  }

  const regionCode = location.regionCode ?? findRegionCode(location);
  return regionCode ? `${location.name}, ${regionCode}` : location.name;
}

function findAncestor(location: LocationLabelInput, type: LocationType): LocationLabelInput | null {
  let current = location.parent ?? null;

  while (current) {
    if (current.type === type) {
      return current;
    }
    current = current.parent ?? null;
  }

  return null;
}

function findRegionCode(location: LocationLabelInput): string | null {
  let current: LocationLabelInput | null = location;

  while (current) {
    if (current.regionCode) {
      return current.regionCode;
    }
    current = current.parent ?? null;
  }

  return null;
}

function collectAncestorIds(location: {
  parent?: { id: string; parent?: { id: string; parent?: { id: string; parent?: { id: string; parent?: { id: string } | null } | null } | null } | null } | null;
}) {
  const ids: string[] = [];
  let current = location.parent ?? null;

  while (current) {
    ids.push(current.id);
    current = current.parent ?? null;
  }

  return ids;
}
