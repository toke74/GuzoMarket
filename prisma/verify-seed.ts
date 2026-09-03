import "dotenv/config";

import assert from "node:assert/strict";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  BusinessStatus,
  CommunityPostStatus,
  EventStatus,
  ListingStatus,
  PrismaClient,
  ReportStatus,
} from "../src/server/db/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to verify GuzoMarket seed data.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  const [
    dmvRegion,
    dmvLocations,
    listingCategories,
    carAttributes,
    housingAttributes,
    buySellAttributes,
    duplicateConditionAttributes,
    demoUsers,
    activeListings,
    draftListings,
    completedListings,
    listingImages,
    openReports,
    demoBusinesses,
    demoEvents,
    communityPosts,
  ] = await Promise.all([
    prisma.marketplaceRegion.findUnique({ where: { slug: "dmv" } }),
    prisma.marketplaceRegionLocation.count({ where: { marketplaceRegion: { slug: "dmv" } } }),
    prisma.category.count({ where: { domainType: "LISTING", isActive: true } }),
    prisma.categoryAttributeDefinition.count({ where: { category: { slug: "cars" } } }),
    prisma.categoryAttributeDefinition.count({ where: { category: { slug: "rooms-shared-housing" } } }),
    prisma.categoryAttributeDefinition.count({ where: { category: { slug: { in: ["furniture", "electronics"] } } } }),
    prisma.categoryAttributeDefinition.count({
      where: { key: "condition", category: { slug: { in: ["furniture", "electronics"] } } },
    }),
    prisma.user.count({ where: { emailNormalized: { endsWith: "@guzomarket.test" } } }),
    prisma.listing.count({ where: { status: ListingStatus.ACTIVE, slug: { startsWith: "demo-" } } }),
    prisma.listing.count({ where: { status: ListingStatus.DRAFT, slug: { startsWith: "demo-" } } }),
    prisma.listing.count({ where: { status: ListingStatus.SOLD, slug: { startsWith: "demo-" } } }),
    prisma.listingImage.count({ where: { publicUrl: { startsWith: "/fixtures/listings/" } } }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.business.count({ where: { status: BusinessStatus.ACTIVE, slug: { startsWith: "demo-" } } }),
    prisma.event.count({ where: { status: EventStatus.ACTIVE, slug: { startsWith: "demo-" } } }),
    prisma.communityPost.count({ where: { status: CommunityPostStatus.ACTIVE } }),
  ]);

  assert.ok(dmvRegion, "DMV marketplace region is missing");
  assert.ok(dmvRegion.isLaunchMarket, "DMV marketplace region must be marked as launch market");
  assert.ok(dmvLocations >= 7, "Expected representative DMV marketplace locations");
  assert.ok(listingCategories >= 10, "Expected primary listing categories and subcategories");
  assert.ok(carAttributes >= 5, "Expected Cars category attributes");
  assert.ok(housingAttributes >= 5, "Expected Housing category attributes");
  assert.ok(buySellAttributes >= 4, "Expected Buy & Sell category attributes");
  assert.equal(duplicateConditionAttributes, 0, "Furniture and Electronics condition must use the core listing field");
  assert.equal(demoUsers, 5, "Expected five synthetic demo users");
  assert.ok(activeListings >= 5, "Expected homepage-ready active demo listings");
  assert.ok(draftListings >= 1, "Expected a draft demo listing");
  assert.ok(completedListings >= 1, "Expected a completed demo listing");
  assert.ok(listingImages >= 3, "Expected local fixture listing images");
  assert.ok(openReports >= 1, "Expected at least one open report fixture");
  assert.ok(demoBusinesses >= 4, "Expected homepage-ready demo business fixtures");
  assert.ok(demoEvents >= 3, "Expected homepage-ready demo event fixtures");
  assert.ok(communityPosts >= 3, "Expected homepage-ready community post fixtures");

  console.log("Seed verification passed.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed verification failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
