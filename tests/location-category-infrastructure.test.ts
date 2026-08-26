import { describe, expect, it, vi } from "vitest";

import { CategoryDomainType, LocationType } from "@/server/db/generated/prisma/client";
import {
  buildCategoryHierarchy,
  getCategoryAttributeDefinitions,
  queryActiveCategories,
  validateActiveCategoryId,
} from "@/server/marketplace/categories";
import {
  formatPublicLocationLabel,
  queryActiveMarketplaceLocations,
  queryLaunchMarketplaceRegion,
  validateActivePublicLocationId,
} from "@/server/marketplace/locations";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    categoryAttributeDefinition: {
      findMany: vi.fn(),
    },
    marketplaceRegion: {
      findFirst: vi.fn(),
    },
    marketplaceRegionLocation: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    location: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

const rootCategoryId = "11111111-1111-4111-8111-111111111111";
const childCategoryId = "22222222-2222-4222-8222-222222222222";
const locationId = "33333333-3333-4333-8333-333333333333";

describe("location and category infrastructure", () => {
  it("retrieves only active public categories and builds hierarchy", async () => {
    prismaMock.category.findMany.mockResolvedValueOnce([
      categoryRow(rootCategoryId, null, "Buy & Sell", "buy-sell", 10),
      categoryRow(childCategoryId, rootCategoryId, "Furniture", "furniture", 10),
    ]);

    const categories = await queryActiveCategories(CategoryDomainType.LISTING);
    const hierarchy = buildCategoryHierarchy(categories);

    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, domainType: CategoryDomainType.LISTING },
      }),
    );
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0].name).toBe("Buy & Sell");
    expect(hierarchy[0].children).toHaveLength(1);
    expect(hierarchy[0].children[0].name).toBe("Furniture");
  });

  it("rejects invalid and disabled category IDs before returning attributes", async () => {
    await expect(validateActiveCategoryId("not-a-uuid")).rejects.toMatchObject({ code: "BAD_REQUEST" });

    prismaMock.category.findFirst.mockResolvedValueOnce(null);
    await expect(validateActiveCategoryId(rootCategoryId)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("retrieves active category attribute definitions with active options only", async () => {
    prismaMock.category.findFirst.mockResolvedValueOnce({
      id: childCategoryId,
      domainType: CategoryDomainType.LISTING,
    });
    prismaMock.categoryAttributeDefinition.findMany.mockResolvedValueOnce([
      {
        id: "44444444-4444-4444-8444-444444444444",
        categoryId: childCategoryId,
        key: "condition",
        label: "Condition",
        dataType: "ENUM",
        isRequired: true,
        isFilterable: true,
        isSearchable: false,
        unit: null,
        sortOrder: 10,
        validationJson: null,
        options: [{ id: "55555555-5555-4555-8555-555555555555", value: "good", label: "Good", sortOrder: 10 }],
      },
    ]);

    const attributes = await getCategoryAttributeDefinitions(childCategoryId);

    expect(prismaMock.categoryAttributeDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: childCategoryId },
        include: expect.objectContaining({
          options: expect.objectContaining({ where: { isActive: true } }),
        }),
      }),
    );
    expect(attributes).toEqual([
      expect.objectContaining({
        key: "condition",
        options: [expect.objectContaining({ value: "good" })],
      }),
    ]);
  });

  it("returns normalized DMV location labels without public coordinates", async () => {
    prismaMock.marketplaceRegion.findFirst.mockResolvedValueOnce({
      id: "66666666-6666-4666-8666-666666666666",
      name: "Washington, DC / Maryland / Northern Virginia",
      slug: "dmv",
      countryCode: "US",
      defaultRadiusMiles: 50,
      isLaunchMarket: true,
    });
    prismaMock.marketplaceRegionLocation.findMany.mockResolvedValueOnce([
      {
        location: {
          id: locationId,
          parentId: "77777777-7777-4777-8777-777777777777",
          type: LocationType.CITY,
          name: "Silver Spring",
          slug: "silver-spring",
          countryCode: "US",
          regionCode: "MD",
          timezone: "America/New_York",
          parent: null,
          latitude: "38.990700",
          longitude: "-77.026100",
        },
      },
    ]);

    const [region, locations] = await Promise.all([
      queryLaunchMarketplaceRegion(),
      queryActiveMarketplaceLocations(),
    ]);

    expect(region).not.toHaveProperty("defaultLatitude");
    expect(region).not.toHaveProperty("defaultLongitude");
    expect(locations[0].label).toBe("Silver Spring, MD");
    expect(locations[0]).not.toHaveProperty("latitude");
    expect(locations[0]).not.toHaveProperty("longitude");
  });

  it("normalizes Washington, DC, Arlington, VA, and neighborhood labels", () => {
    expect(formatPublicLocationLabel({ name: "Washington", type: LocationType.CITY, regionCode: "DC" })).toBe(
      "Washington, DC",
    );
    expect(formatPublicLocationLabel({ name: "Arlington", type: LocationType.CITY, regionCode: "VA" })).toBe(
      "Arlington, VA",
    );
    expect(
      formatPublicLocationLabel({
        name: "Clarendon",
        type: LocationType.NEIGHBORHOOD,
        regionCode: "VA",
        parent: { name: "Arlington", type: LocationType.CITY, regionCode: "VA" },
      }),
    ).toBe("Clarendon, Arlington, VA");
  });

  it("rejects invalid, disabled, and out-of-region location IDs", async () => {
    await expect(validateActivePublicLocationId("not-a-uuid")).rejects.toMatchObject({ code: "BAD_REQUEST" });

    prismaMock.location.findFirst.mockResolvedValueOnce(null);
    await expect(validateActivePublicLocationId(locationId)).rejects.toMatchObject({ code: "BAD_REQUEST" });

    prismaMock.location.findFirst.mockResolvedValueOnce({ id: locationId, type: LocationType.CITY, parent: null });
    prismaMock.marketplaceRegionLocation.findFirst.mockResolvedValueOnce(null);
    await expect(validateActivePublicLocationId(locationId)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

function categoryRow(id: string, parentId: string | null, name: string, slug: string, sortOrder: number) {
  return {
    id,
    parentId,
    domainType: CategoryDomainType.LISTING,
    name,
    slug,
    description: null,
    iconKey: null,
    sortOrder,
    isFeatured: false,
  };
}
