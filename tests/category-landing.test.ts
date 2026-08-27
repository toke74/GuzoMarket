import { beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryDomainType } from "@/server/db/generated/prisma/client";
import { loadCategoryLandingResult, resolveCategoryForLanding } from "@/server/marketplace/category-landing";

const { prismaMock, searchMock, notFoundMock } = vi.hoisted(() => ({
  prismaMock: {
    category: { findFirst: vi.fn() },
  },
  searchMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

vi.mock("@/server/marketplace/search", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/marketplace/search")>();
  return {
    ...actual,
    searchMarketplaceListings: searchMock,
  };
});

describe("category landing routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.category.findFirst.mockResolvedValue(rootCategory());
    searchMock.mockResolvedValue({ listings: [], resultCount: 0 });
  });

  it("resolves active subcategories from the real taxonomy", async () => {
    const category = await resolveCategoryForLanding("buy-sell", "electronics");

    expect(prismaMock.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "buy-sell",
          parentId: null,
          isActive: true,
          domainType: CategoryDomainType.LISTING,
        },
      }),
    );
    expect(category).toMatchObject({ slug: "electronics", name: "Electronics" });
  });

  it("supports approved route aliases without changing taxonomy source of truth", async () => {
    prismaMock.category.findFirst.mockResolvedValueOnce({
      ...rootCategory(),
      slug: "housing",
      children: [{ id: "cat-apartments", name: "Apartments for Rent", slug: "apartments-for-rent", description: null }],
    });

    const category = await resolveCategoryForLanding("housing", "apartments");

    expect(category).toMatchObject({ slug: "apartments-for-rent" });
  });

  it("rejects invalid or disabled subcategories with notFound", async () => {
    await expect(resolveCategoryForLanding("buy-sell", "disabled-category")).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("loads subcategory pages through the deterministic search service", async () => {
    await loadCategoryLandingResult({
      section: "buy-sell",
      subcategorySlug: "electronics",
      searchParams: { q: "iphone", attr_condition: "good", limit: "99" },
    });

    expect(searchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "iphone",
        category: "electronics",
        limit: 24,
        attributes: { condition: "good" },
      }),
    );
  });
});

function rootCategory() {
  return {
    id: "cat-buy-sell",
    name: "Buy & Sell",
    slug: "buy-sell",
    description: "Everyday local goods.",
    children: [
      { id: "cat-furniture", name: "Furniture", slug: "furniture", description: null },
      { id: "cat-electronics", name: "Electronics", slug: "electronics", description: null },
    ],
  };
}
