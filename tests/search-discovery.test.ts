import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AttributeDataType,
  CategoryDomainType,
  ListingStatus,
  LocationType,
  ModerationState,
  PriceType,
} from "@/server/db/generated/prisma/client";
import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    category: { findMany: vi.fn() },
    location: { findMany: vi.fn() },
    categoryAttributeDefinition: { findMany: vi.fn() },
    listing: { count: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("search discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.category.findMany.mockResolvedValue(categories);
    prismaMock.location.findMany.mockResolvedValue(locations);
    prismaMock.categoryAttributeDefinition.findMany.mockResolvedValue(filters);
    prismaMock.listing.count.mockResolvedValue(1);
    prismaMock.listing.findMany.mockResolvedValue([listingRow()]);
  });

  it("normalizes query state and caps page size", () => {
    const criteria = parseSearchCriteria({
      q: "  toyota   camry  ",
      location: "Silver Spring, MD",
      category: "cars-vehicles<script>",
      minPrice: "-1",
      maxPrice: "9500.129",
      sort: "not-a-sort",
      limit: "1000",
      cursor: "not-a-cursor",
      attr_make: "toyota",
      attr_bad$key: "unsafe",
    });

    expect(criteria).toMatchObject({
      q: "toyota camry",
      location: "Silver Spring, MD",
      category: "cars-vehiclesscript",
      minPrice: null,
      maxPrice: 9500.13,
      sort: "recommended",
      limit: 24,
      cursor: null,
      attributes: { make: "toyota", badkey: "unsafe" },
    });
  });

  it("searches active public listings by query, location, category, price, and valid category filters", async () => {
    const criteria = parseSearchCriteria({
      q: "Toyota",
      location: "silver-spring",
      category: "cars-vehicles",
      minPrice: "5000",
      maxPrice: "10000",
      attr_make: "toyota",
      attr_transmission: "manual",
      attr_unknown: "ignored",
    });

    const result = await searchMarketplaceListings(criteria);

    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, domainType: CategoryDomainType.LISTING },
      }),
    );
    expect(prismaMock.categoryAttributeDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: { in: ["cat-cars-root", "cat-cars"] }, isFilterable: true },
      }),
    );
    expect(prismaMock.listing.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        status: ListingStatus.ACTIVE,
        moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
        deletedAt: null,
        AND: expect.arrayContaining([
          { categoryId: { in: ["cat-cars-root", "cat-cars"] } },
          { publicLocationId: { in: ["loc-silver-spring", "loc-wheaton"] } },
          { priceAmount: { gte: 5000 } },
          { priceAmount: { lte: 10000 } },
          { attributeValues: { some: expect.objectContaining({ optionValue: "toyota" }) } },
          { attributeValues: { some: expect.objectContaining({ optionValue: "manual" }) } },
        ]),
      }),
    });
    expect(result.criteria.attributes).toEqual({ make: "toyota", transmission: "manual" });
    expect(result.listings[0]).toMatchObject({
      title: "Demo 2016 Toyota Camry SE",
      priceLabel: "$9,200",
      locationLabel: "Silver Spring, MD",
      categoryLabel: "Cars",
    });
    expect(result.listings[0]).not.toHaveProperty("latitude");
  });

  it("drops invalid category filter values before querying", async () => {
    const criteria = parseSearchCriteria({
      category: "cars",
      attr_make: "not-allowed",
      attr_year: "2016",
    });

    const result = await searchMarketplaceListings(criteria);

    expect(result.criteria.attributes).toEqual({ year: "2016" });
    expect(prismaMock.listing.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        AND: expect.arrayContaining([
          { attributeValues: { some: expect.objectContaining({ integerValue: 2016 }) } },
        ]),
      }),
    });
  });

  it("returns bounded cursor pagination metadata", async () => {
    prismaMock.listing.findMany.mockResolvedValueOnce([listingRow("listing-1"), listingRow("listing-2")]);

    const criteria = parseSearchCriteria({ limit: "1" });
    const result = await searchMarketplaceListings(criteria);

    expect(prismaMock.listing.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2 }));
    expect(result.listings).toHaveLength(1);
    expect(result.nextCursor).toBe("listing-1");
  });

  it("represents no-results searches without throwing", async () => {
    prismaMock.listing.count.mockResolvedValueOnce(0);
    prismaMock.listing.findMany.mockResolvedValueOnce([]);

    const result = await searchMarketplaceListings(parseSearchCriteria({ q: "zzzz-not-real" }));

    expect(result.resultCount).toBe(0);
    expect(result.listings).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });
});

const categories = [
  {
    id: "cat-cars-root",
    parentId: null,
    name: "Cars & Vehicles",
    slug: "cars-vehicles",
    description: "Cars, parts, and local vehicle listings.",
    domainType: CategoryDomainType.LISTING,
  },
  {
    id: "cat-cars",
    parentId: "cat-cars-root",
    name: "Cars",
    slug: "cars",
    description: null,
    domainType: CategoryDomainType.LISTING,
  },
];

const locations = [
  {
    id: "loc-silver-spring",
    parentId: null,
    slug: "silver-spring",
    name: "Silver Spring",
    type: LocationType.CITY,
    regionCode: "MD",
    parent: null,
  },
  {
    id: "loc-wheaton",
    parentId: "loc-silver-spring",
    slug: "wheaton",
    name: "Wheaton",
    type: LocationType.NEIGHBORHOOD,
    regionCode: "MD",
    parent: {
      name: "Silver Spring",
      type: LocationType.CITY,
      regionCode: "MD",
      parent: null,
    },
  },
];

const filters = [
  {
    key: "make",
    label: "Make",
    dataType: AttributeDataType.ENUM,
    unit: null,
    options: [{ value: "toyota", label: "Toyota" }],
  },
  {
    key: "year",
    label: "Year",
    dataType: AttributeDataType.INTEGER,
    unit: null,
    options: [],
  },
  {
    key: "transmission",
    label: "Transmission",
    dataType: AttributeDataType.ENUM,
    unit: null,
    options: [{ value: "manual", label: "Manual" }],
  },
];

function listingRow(id = "listing-1") {
  return {
    id,
    slug: "demo-2016-toyota-camry-se",
    title: "Demo 2016 Toyota Camry SE",
    priceAmount: "9200.00",
    priceCurrency: "USD",
    priceType: PriceType.NEGOTIABLE,
    isFeatured: true,
    publishedAt: new Date("2026-08-20T15:00:00.000Z"),
    createdAt: new Date("2026-08-20T14:00:00.000Z"),
    category: { name: "Cars" },
    publicLocation: locations[0],
    images: [{ publicUrl: "/fixtures/listings/demo-car.svg", altText: "Demo car" }],
  };
}
