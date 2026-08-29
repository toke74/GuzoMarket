import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  AttributeDataType,
  ListingStatus,
  LocationType,
  ModerationState,
  PriceType,
  VerificationType,
} from "@/server/db/generated/prisma/client";
import { queryPublicListingDetail, queryPublicSellerProfile } from "@/server/marketplace/listing-detail";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    listing: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    profile: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: (fn: unknown) => fn };
});

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("listing detail and public seller profile data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.listing.findMany.mockResolvedValue([]);
  });

  it("returns an active listing detail DTO without private contact or exact location fields", async () => {
    prismaMock.listing.findUnique.mockResolvedValueOnce(listingFixture());

    const detail = await queryPublicListingDetail(
      "demo-camera-11111111-1111-4111-8111-111111111111",
      "buyer-user-id",
    );

    expect(prismaMock.listing.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          postalCode: true,
          latitude: true,
          longitude: true,
        }),
      }),
    );
    expect(detail).toEqual(
      expect.objectContaining({
        title: "Demo camera",
        priceLabel: "$640",
        locationLabel: "Washington, DC",
        publicState: "active",
        contactEnabled: true,
        isOwner: false,
      }),
    );
    expect(detail).not.toHaveProperty("email");
    expect(detail).not.toHaveProperty("latitude");
    expect(detail?.seller).not.toHaveProperty("email");
    expect(detail?.seller.verificationLabels).toEqual(["Email verified", "Phone verified"]);
    expect(detail?.attributes).toEqual(
      expect.arrayContaining([
        { key: "condition", label: "Condition", value: "Excellent" },
        { key: "brand", label: "Brand", value: "Sony" },
        { key: "year", label: "Year", value: "2016" },
      ]),
    );
  });

  it("marks the current owner and exposes only a management shortcut", async () => {
    prismaMock.listing.findUnique.mockResolvedValueOnce(listingFixture());

    const detail = await queryPublicListingDetail(
      "demo-camera-11111111-1111-4111-8111-111111111111",
      "seller-user-id",
    );

    expect(detail).toEqual(
      expect.objectContaining({
        isOwner: true,
        contactEnabled: false,
        managementHref: "/account/listings/11111111-1111-4111-8111-111111111111/edit",
      }),
    );
  });

  it("shows completed listing states from direct links without enabling contact", async () => {
    prismaMock.listing.findUnique.mockResolvedValueOnce(listingFixture({ status: ListingStatus.SOLD }));

    const detail = await queryPublicListingDetail("demo-camera-11111111-1111-4111-8111-111111111111");

    expect(detail).toEqual(
      expect.objectContaining({
        publicState: "completed",
        statusLabel: "Sold",
        contactEnabled: false,
      }),
    );
  });

  it("collapses removed or suspended listing states to unavailable", async () => {
    prismaMock.listing.findUnique.mockResolvedValueOnce(
      listingFixture({ status: ListingStatus.REMOVED, moderationState: ModerationState.REMOVED }),
    );

    const detail = await queryPublicListingDetail("demo-camera-11111111-1111-4111-8111-111111111111");

    expect(detail).toBeNull();
  });

  it("does not expose private seller profile fields from listing detail", async () => {
    prismaMock.listing.findUnique.mockResolvedValueOnce(
      listingFixture({
        owner: {
          ...ownerFixture(),
          profile: { ...profileFixture(), isPublic: false, bio: "Private profile bio", avatarUrl: "/private-avatar.png" },
        },
      }),
    );

    const detail = await queryPublicListingDetail("demo-camera-11111111-1111-4111-8111-111111111111");

    expect(detail?.seller.displayName).toBe("GuzoMarket seller");
    expect(detail?.seller.bio).toBeNull();
    expect(detail?.seller.avatarUrl).toBeNull();
    expect(detail?.seller.href).toBe("/users/seller-user-id");
  });

  it("honors public profile visibility and lists only active public listings", async () => {
    prismaMock.profile.findFirst.mockResolvedValueOnce({
      ...profileFixture(),
      user: {
        id: "seller-user-id",
        createdAt: new Date("2026-01-02T12:00:00.000Z"),
        emailVerifiedAt: new Date("2026-01-03T12:00:00.000Z"),
        verifications: [{ type: VerificationType.EMAIL }],
      },
    });
    prismaMock.listing.findMany.mockResolvedValueOnce([listingCardFixture()]);

    const profile = await queryPublicSellerProfile("demo-amina");

    expect(prismaMock.profile.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublic: true,
          user: { status: "ACTIVE" },
        }),
      }),
    );
    expect(prismaMock.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerUserId: "seller-user-id",
          status: ListingStatus.ACTIVE,
          moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
          deletedAt: null,
        }),
      }),
    );
    expect(profile?.activeListings).toHaveLength(1);
    expect(profile).not.toHaveProperty("email");
    expect(profile?.activeListings[0]).not.toHaveProperty("latitude");
  });

  it("returns null when a seller profile is private or inactive", async () => {
    prismaMock.profile.findFirst.mockResolvedValueOnce(null);

    await expect(queryPublicSellerProfile("private-seller")).resolves.toBeNull();
  });
});

function listingFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    ownerUserId: "seller-user-id",
    categoryId: "camera-category-id",
    title: "Demo camera",
    slug: "demo-camera",
    description: "Synthetic public listing description.",
    priceAmount: "640.00",
    priceCurrency: "USD",
    priceType: PriceType.NEGOTIABLE,
    condition: "excellent",
    status: ListingStatus.ACTIVE,
    moderationState: ModerationState.APPROVED,
    availabilityText: "Pickup this week",
    isFeatured: true,
    publishedAt: new Date("2026-08-24T15:00:00.000Z"),
    createdAt: new Date("2026-08-24T14:00:00.000Z"),
    deletedAt: null,
    category: { id: "camera-category-id", name: "Cameras", slug: "cameras", parent: { name: "Buy & Sell", slug: "buy-sell" } },
    publicLocation: locationFixture(),
    images: [
      {
        id: "image-id",
        publicUrl: "/fixtures/listings/demo-camera.svg",
        width: 800,
        height: 600,
        altText: "Demo camera image",
      },
    ],
    attributeValues: [
      {
        textValue: null,
        integerValue: null,
        decimalValue: null,
        booleanValue: null,
        dateValue: null,
        optionValue: "sony",
        multiOptionJson: null,
        attributeDefinition: {
          key: "brand",
          label: "Brand",
          dataType: AttributeDataType.ENUM,
          unit: null,
          sortOrder: 1,
          options: [{ value: "sony", label: "Sony" }],
        },
      },
      {
        textValue: null,
        integerValue: 2016,
        decimalValue: null,
        booleanValue: null,
        dateValue: null,
        optionValue: null,
        multiOptionJson: null,
        attributeDefinition: {
          key: "year",
          label: "Year",
          dataType: AttributeDataType.INTEGER,
          unit: null,
          sortOrder: 2,
          options: [],
        },
      },
    ],
    owner: ownerFixture(),
    ...overrides,
  };
}

function ownerFixture() {
  return {
    id: "seller-user-id",
    createdAt: new Date("2026-01-02T12:00:00.000Z"),
    emailVerifiedAt: new Date("2026-01-03T12:00:00.000Z"),
    profile: profileFixture(),
    verifications: [{ type: VerificationType.EMAIL }, { type: VerificationType.PHONE }],
  };
}

function profileFixture() {
  return {
    id: "profile-id",
    userId: "seller-user-id",
    displayName: "Amina D.",
    username: "demo-amina",
    bio: "Public seller bio.",
    avatarUrl: "/fixtures/listings/demo-business.svg",
    publicLocationText: "Washington, DC",
    joinedDisplayPreference: null,
    responseRatePercent: 92,
    medianResponseMinutes: 45,
    sellerRatingAverage: null,
    sellerRatingCount: 0,
    isPublic: true,
    cityLocation: null,
  };
}

function listingCardFixture() {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "demo-phone",
    title: "Demo phone",
    priceAmount: "320.00",
    priceCurrency: "USD",
    priceType: PriceType.FIXED,
    isFeatured: false,
    publishedAt: new Date("2026-08-25T15:00:00.000Z"),
    createdAt: new Date("2026-08-25T14:00:00.000Z"),
    publicLocation: locationFixture(),
    images: [{ publicUrl: "/fixtures/listings/demo-phone.svg", altText: "Demo phone image" }],
  };
}

function locationFixture() {
  return {
    name: "Washington",
    type: LocationType.CITY,
    regionCode: "DC",
    parent: null,
  };
}
