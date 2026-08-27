import { describe, expect, it, vi } from "vitest";

import {
  BusinessStatus,
  CommunityPostStatus,
  CommunityPostType,
  EventStatus,
  ListingStatus,
  LocationType,
  ModerationState,
  PriceType,
  VerificationStatus,
} from "@/server/db/generated/prisma/client";
import {
  queryCommunityNearYou,
  queryFeaturedBusinesses,
  queryPopularNearYouListings,
} from "@/server/marketplace/homepage";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    listing: {
      findMany: vi.fn(),
    },
    business: {
      findMany: vi.fn(),
    },
    event: {
      findMany: vi.fn(),
    },
    communityPost: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("homepage marketplace data", () => {
  it("returns active public listing DTOs without private location fields or save state", async () => {
    prismaMock.listing.findMany.mockResolvedValueOnce([
      {
        id: "11111111-1111-4111-8111-111111111111",
        slug: "demo-camera",
        title: "Demo camera",
        priceAmount: "640.00",
        priceCurrency: "USD",
        priceType: PriceType.NEGOTIABLE,
        isFeatured: true,
        publishedAt: new Date("2026-08-24T15:00:00.000Z"),
        createdAt: new Date("2026-08-24T14:00:00.000Z"),
        publicLocation: location("Washington", "DC"),
        images: [{ publicUrl: "/fixtures/listings/demo-camera.svg", altText: "Demo camera image" }],
      },
    ]);

    const listings = await queryPopularNearYouListings();

    expect(prismaMock.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ListingStatus.ACTIVE,
          moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
          deletedAt: null,
        }),
      }),
    );
    expect(listings[0]).toEqual(
      expect.objectContaining({
        title: "Demo camera",
        priceLabel: "$640",
        locationLabel: "Washington, DC",
        isFeatured: true,
      }),
    );
    expect(listings[0]).not.toHaveProperty("latitude");
    expect(listings[0]).not.toHaveProperty("longitude");
    expect(listings[0]).not.toHaveProperty("isSaved");
  });

  it("does not invent business ratings when rating data is absent", async () => {
    prismaMock.business.findMany.mockResolvedValueOnce([
      {
        id: "22222222-2222-4222-8222-222222222222",
        slug: "demo-cafe",
        name: "Demo Cafe",
        logoUrl: "/fixtures/listings/demo-business.svg",
        coverImageUrl: null,
        verificationStatus: VerificationStatus.PENDING,
        ratingAverage: null,
        ratingCount: 0,
        category: { name: "Restaurants & Cafes" },
        publicLocation: location("Silver Spring", "MD"),
      },
    ]);

    const businesses = await queryFeaturedBusinesses();

    expect(prismaMock.business.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: BusinessStatus.ACTIVE, deletedAt: null },
      }),
    );
    expect(businesses[0].ratingLabel).toBeNull();
    expect(businesses[0].isBusinessVerified).toBe(false);
    expect(businesses[0].locationLabel).toBe("Silver Spring, MD");
  });

  it("combines active events and community posts for Community Near You", async () => {
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        id: "33333333-3333-4333-8333-333333333333",
        slug: "demo-meetup",
        title: "Demo meetup",
        startAt: new Date("2026-09-12T14:00:00.000Z"),
        venueName: "Demo Cafe",
        publicLocation: location("Washington", "DC"),
        images: [],
      },
    ]);
    prismaMock.communityPost.findMany.mockResolvedValueOnce([
      {
        id: "44444444-4444-4444-8444-444444444444",
        type: CommunityPostType.RECOMMENDATION,
        title: "Favorite grocery spots?",
        body: "Synthetic community fixture.",
        createdAt: new Date("2026-08-25T14:00:00.000Z"),
        publicLocation: location("Arlington", "VA"),
      },
    ]);

    const community = await queryCommunityNearYou();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EventStatus.ACTIVE,
          moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
          deletedAt: null,
        }),
      }),
    );
    expect(prismaMock.communityPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: CommunityPostStatus.ACTIVE,
          moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
          deletedAt: null,
        }),
      }),
    );
    expect(community.map((item) => item.title)).toEqual(["Demo meetup", "Favorite grocery spots?"]);
    expect(community[1].eyebrow).toBe("Recommendation");
  });
});

function location(name: string, regionCode: string) {
  return {
    name,
    type: LocationType.CITY,
    regionCode,
    parent: null,
  };
}
