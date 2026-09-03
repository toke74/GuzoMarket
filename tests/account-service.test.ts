import { beforeEach, describe, expect, it, vi } from "vitest";

import { CategoryDomainType, ListingStatus, LocationType, PriceType } from "@/server/db/generated/prisma/client";
import {
  getAccountListings,
  getAllowedLifecycleActions,
  transitionOwnedListing,
  updateAccountProfileFromFormData,
} from "@/server/account/service";

const { prismaMock, revalidatePathMock } = vi.hoisted(() => ({
  prismaMock: {
    profile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    listing: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("account profile and listing management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.profile.findFirst.mockResolvedValue(null);
    prismaMock.profile.update.mockResolvedValue(profileFixture());
    prismaMock.listing.count.mockResolvedValue(0);
    prismaMock.listing.findMany.mockResolvedValue([]);
    prismaMock.listing.updateMany.mockResolvedValue({ count: 1 });
  });

  it("updates only approved public profile fields", async () => {
    const formData = new FormData();
    formData.set("displayName", "  Amina Demo  ");
    formData.set("username", "Amina_Demo");
    formData.set("bio", "Public bio");
    formData.set("publicLocationText", "Washington, DC");
    formData.set("avatarUrl", "/avatars/amina.png");
    formData.set("isPublic", "on");
    formData.set("defaultRole", "ADMIN");
    formData.set("emailVerifiedAt", "2026-08-31T00:00:00.000Z");

    const result = await updateAccountProfileFromFormData("owner-user-id", formData);

    expect(result).toEqual({ status: "success", message: "Profile saved." });
    expect(prismaMock.profile.update).toHaveBeenCalledWith({
      where: { userId: "owner-user-id" },
      data: {
        displayName: "Amina Demo",
        username: "amina_demo",
        bio: "Public bio",
        avatarUrl: "/avatars/amina.png",
        publicLocationText: "Washington, DC",
        isPublic: true,
      },
    });
    expect(prismaMock.profile.update.mock.calls[0][0].data).not.toHaveProperty("defaultRole");
    expect(prismaMock.profile.update.mock.calls[0][0].data).not.toHaveProperty("emailVerifiedAt");
  });

  it("rejects invalid profile values before writing", async () => {
    const formData = new FormData();
    formData.set("displayName", "A");
    formData.set("username", "Bad Name!");
    formData.set("avatarUrl", "file:///secret.png");

    const result = await updateAccountProfileFromFormData("owner-user-id", formData);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.displayName).toBeDefined();
    expect(result.fieldErrors?.username).toBeDefined();
    expect(result.fieldErrors?.avatarUrl).toBeDefined();
    expect(prismaMock.profile.update).not.toHaveBeenCalled();
  });

  it("queries owner-scoped listing tabs using existing statuses", async () => {
    prismaMock.listing.count.mockResolvedValue(1);
    prismaMock.listing.findMany.mockResolvedValue([ownerListingFixture()]);

    const result = await getAccountListings("owner-user-id", "completed");

    expect(prismaMock.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerUserId: "owner-user-id",
          status: { in: [ListingStatus.SOLD, ListingStatus.RENTED, ListingStatus.FILLED] },
          deletedAt: null,
        },
      }),
    );
    expect(result.tabs).toHaveLength(6);
    expect(result.listings[0]).toMatchObject({
      title: "Demo sofa",
      status: ListingStatus.ACTIVE,
      actions: expect.arrayContaining(["view", "edit", "mark-sold", "archive"]),
    });
  });

  it("validates category-specific completion actions", () => {
    expect(getAllowedLifecycleActions(lifecycleFixture("buy-sell"))).toContain("mark-sold");
    expect(getAllowedLifecycleActions(lifecycleFixture("housing"))).toContain("mark-rented");
    expect(getAllowedLifecycleActions(lifecycleFixture("jobs", CategoryDomainType.JOB))).toContain("mark-filled");
  });

  it("rejects cross-user lifecycle mutations and invalid transitions", async () => {
    prismaMock.listing.findFirst.mockResolvedValueOnce(null);

    await expect(transitionOwnedListing("attacker-user-id", listingId, "archive")).rejects.toThrow("Listing not found.");
    expect(prismaMock.listing.updateMany).not.toHaveBeenCalled();

    prismaMock.listing.findFirst.mockResolvedValueOnce({
      id: listingId,
      slug: "demo-sofa",
      status: ListingStatus.SOLD,
      category: lifecycleFixture("buy-sell").category,
    });

    await expect(transitionOwnedListing("owner-user-id", listingId, "mark-sold")).rejects.toThrow("This listing action is not allowed.");
  });

  it("soft deletes archived records and preserves archive as a separate lifecycle state", async () => {
    const now = new Date("2026-08-31T12:00:00.000Z");
    prismaMock.listing.findFirst.mockResolvedValueOnce({
      id: listingId,
      slug: "demo-sofa",
      status: ListingStatus.ACTIVE,
      category: lifecycleFixture("buy-sell").category,
    });

    await transitionOwnedListing("owner-user-id", listingId, "archive", now);
    expect(prismaMock.listing.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: listingId, ownerUserId: "owner-user-id", status: ListingStatus.ACTIVE, deletedAt: null },
        data: { status: ListingStatus.ARCHIVED, archivedAt: now },
      }),
    );

    prismaMock.listing.findFirst.mockResolvedValueOnce({
      id: listingId,
      slug: "demo-sofa",
      status: ListingStatus.ARCHIVED,
      category: lifecycleFixture("buy-sell").category,
    });

    await transitionOwnedListing("owner-user-id", listingId, "delete", now);
    expect(prismaMock.listing.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { status: ListingStatus.REMOVED, deletedAt: now },
      }),
    );
  });
});

const listingId = "33333333-3333-4333-8333-333333333333";

function profileFixture() {
  return {
    displayName: "Amina Demo",
    username: "amina_demo",
    bio: "Public bio",
    avatarUrl: "/avatars/amina.png",
    publicLocationText: "Washington, DC",
    isPublic: true,
  };
}

function lifecycleFixture(parentSlug: string, domainType: CategoryDomainType = CategoryDomainType.LISTING) {
  return {
    status: ListingStatus.ACTIVE,
    category: {
      domainType,
      slug: parentSlug === "jobs" ? "food-hospitality" : "demo-category",
      parent: { slug: parentSlug },
    },
  };
}

function ownerListingFixture() {
  return {
    id: listingId,
    title: "Demo sofa",
    slug: "demo-sofa",
    priceAmount: "120.00",
    priceCurrency: "USD",
    priceType: PriceType.FIXED,
    status: ListingStatus.ACTIVE,
    updatedAt: new Date("2026-08-31T12:00:00.000Z"),
    publishedAt: new Date("2026-08-30T12:00:00.000Z"),
    category: {
      name: "Furniture",
      slug: "furniture",
      domainType: CategoryDomainType.LISTING,
      parent: { name: "Buy & Sell", slug: "buy-sell" },
    },
    publicLocation: {
      name: "Washington",
      type: LocationType.CITY,
      regionCode: "DC",
      parent: null,
    },
    images: [],
  };
}
