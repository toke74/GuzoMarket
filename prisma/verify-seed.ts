import "dotenv/config";

import assert from "node:assert/strict";

import { PrismaPg } from "@prisma/adapter-pg";

import { ListingStatus, PrismaClient, ReportStatus } from "../src/server/db/generated/prisma/client";

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
    demoUsers,
    activeListings,
    draftListings,
    completedListings,
    listingImages,
    openReports,
    demoBusiness,
    demoEvent,
  ] = await Promise.all([
    prisma.marketplaceRegion.findUnique({ where: { slug: "dmv" } }),
    prisma.marketplaceRegionLocation.count({ where: { marketplaceRegion: { slug: "dmv" } } }),
    prisma.category.count({ where: { domainType: "LISTING", isActive: true } }),
    prisma.categoryAttributeDefinition.count({ where: { category: { slug: "cars" } } }),
    prisma.categoryAttributeDefinition.count({ where: { category: { slug: "rooms-shared-housing" } } }),
    prisma.categoryAttributeDefinition.count({ where: { category: { slug: { in: ["furniture", "electronics"] } } } }),
    prisma.user.count({ where: { emailNormalized: { endsWith: "@guzomarket.test" } } }),
    prisma.listing.count({ where: { status: { in: [ListingStatus.ACTIVE, ListingStatus.PENDING_REVIEW] }, slug: { startsWith: "demo-" } } }),
    prisma.listing.count({ where: { status: ListingStatus.DRAFT, slug: { startsWith: "demo-" } } }),
    prisma.listing.count({ where: { status: ListingStatus.SOLD, slug: { startsWith: "demo-" } } }),
    prisma.listingImage.count({ where: { publicUrl: { startsWith: "/fixtures/listings/" } } }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.business.findFirst({ where: { slug: "demo-buna-market-cafe" } }),
    prisma.event.findFirst({ where: { slug: "demo-dmv-small-business-meetup" } }),
  ]);

  assert.ok(dmvRegion, "DMV marketplace region is missing");
  assert.ok(dmvRegion.isLaunchMarket, "DMV marketplace region must be marked as launch market");
  assert.ok(dmvLocations >= 7, "Expected representative DMV marketplace locations");
  assert.ok(listingCategories >= 10, "Expected primary listing categories and subcategories");
  assert.ok(carAttributes >= 5, "Expected Cars category attributes");
  assert.ok(housingAttributes >= 5, "Expected Housing category attributes");
  assert.ok(buySellAttributes >= 6, "Expected Buy & Sell category attributes");
  assert.equal(demoUsers, 5, "Expected five synthetic demo users");
  assert.ok(activeListings >= 2, "Expected active/pending demo listings");
  assert.ok(draftListings >= 1, "Expected a draft demo listing");
  assert.ok(completedListings >= 1, "Expected a completed demo listing");
  assert.ok(listingImages >= 3, "Expected local fixture listing images");
  assert.ok(openReports >= 1, "Expected at least one open report fixture");
  assert.ok(demoBusiness, "Expected demo business fixture");
  assert.ok(demoEvent, "Expected demo event fixture");

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
