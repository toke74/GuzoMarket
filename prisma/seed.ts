import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  AttributeDataType,
  AuditActorType,
  BusinessMemberRole,
  BusinessStatus,
  CategoryDomainType,
  CommunityPostStatus,
  CommunityPostType,
  ContactPreference,
  ConversationContextType,
  EmploymentType,
  EventStatus,
  JobApplicationMethod,
  JobStatus,
  JobWorkMode,
  ListingStatus,
  LocationPrecision,
  LocationType,
  MessageType,
  ModerationActionType,
  ModerationState,
  ModerationTargetType,
  NotificationType,
  PriceType,
  Prisma,
  PrismaClient,
  ReportPriority,
  ReportReason,
  ReportStatus,
  ReportSubjectType,
  RoleName,
  SalaryPeriod,
  UserStatus,
  VerificationStatus,
} from "../src/server/db/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed GuzoMarket development data.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const demoEmails = [
  "amina.demo@guzomarket.test",
  "samir.demo@guzomarket.test",
  "maya.demo@guzomarket.test",
  "david.moderator@guzomarket.test",
  "nora.admin@guzomarket.test",
] as const;

const listingSlugs = [
  "demo-2016-toyota-camry-se",
  "demo-silver-spring-room-near-metro",
  "demo-solid-wood-dining-table-sold",
  "demo-mirrorless-camera-kit",
  "demo-adams-morgan-office-chair",
  "demo-rockville-iphone-12-pro",
  "demo-alexandria-bookshelf",
  "demo-wheaton-room-available",
  "demo-dc-macbook-pro",
] as const;

const businessSlugs = [
  "demo-buna-market-cafe",
  "demo-selam-cleaning-services",
  "demo-ethio-market-grocery",
  "demo-habesha-auto-care",
  "demo-zemen-construction",
] as const;
const jobSlugs = ["demo-weekend-barista"] as const;
const eventSlugs = [
  "demo-dmv-small-business-meetup",
  "demo-community-soccer-meetup",
  "demo-local-food-pop-up",
] as const;

type LocationSeed = {
  key: string;
  type: LocationType;
  name: string;
  slug: string;
  parentKey?: string;
  countryCode?: string;
  regionCode?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
};

type CategorySeed = {
  key: string;
  domainType: CategoryDomainType;
  name: string;
  slug: string;
  parentKey?: string;
  description?: string;
  iconKey?: string;
  sortOrder: number;
  isFeatured?: boolean;
};

async function main() {
  await clearDemoRecords();

  const roles = await seedRoles();
  const locations = await seedLocations();
  const region = await seedMarketplaceRegion(locations);
  const categories = await seedCategories();
  const attributes = await seedAttributes(categories);
  const users = await seedUsers(roles, locations);
  const listings = await seedListings(users, locations, categories, attributes);

  await seedEngagement(users, listings);
  const business = await seedBusiness(users, locations, categories);
  await seedJobs(users, locations, categories, business.id);
  const event = await seedEvents(users, locations, categories, business.id);
  await seedCommunity(users, locations);
  await seedModeration(users, listings);
  await seedAudit(users.adminNora.id, region.id, event.id);

  const summary = await collectSummary();
  console.log("Seeded GuzoMarket development fixtures:");
  console.table(summary);
}

async function clearDemoRecords() {
  const demoUsers = await prisma.user.findMany({
    where: { emailNormalized: { in: [...demoEmails] } },
    select: { id: true },
  });
  const demoUserIds = demoUsers.map((user) => user.id);

  await prisma.authToken.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.authSession.deleteMany({ where: { userId: { in: demoUserIds } } });

  const demoListings = await prisma.listing.findMany({
    where: { slug: { in: [...listingSlugs] } },
    select: { id: true },
  });
  const demoListingIds = demoListings.map((listing) => listing.id);

  const demoBusinesses = await prisma.business.findMany({
    where: { slug: { in: [...businessSlugs] } },
    select: { id: true },
  });
  const demoBusinessIds = demoBusinesses.map((business) => business.id);

  const demoEvents = await prisma.event.findMany({
    where: { slug: { in: [...eventSlugs] } },
    select: { id: true },
  });
  const demoEventIds = demoEvents.map((event) => event.id);

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorUserId: { in: demoUserIds } },
        { action: { startsWith: "demo_seed." } },
      ],
    },
  });
  await prisma.moderationAction.deleteMany({
    where: {
      OR: [
        { moderatorUserId: { in: demoUserIds } },
        { targetId: { in: [...demoListingIds, ...demoBusinessIds, ...demoEventIds] } },
      ],
    },
  });
  await prisma.report.deleteMany({
    where: {
      OR: [
        { reporterUserId: { in: demoUserIds } },
        { assignedModeratorId: { in: demoUserIds } },
        { listingId: { in: demoListingIds } },
        { businessId: { in: demoBusinessIds } },
        { eventId: { in: demoEventIds } },
      ],
    },
  });
  await prisma.notification.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.notificationPreference.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderUserId: { in: demoUserIds } },
        { conversation: { listingId: { in: demoListingIds } } },
      ],
    },
  });
  await prisma.conversationParticipant.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.conversation.deleteMany({ where: { listingId: { in: demoListingIds } } });
  await prisma.favorite.deleteMany({
    where: {
      OR: [{ userId: { in: demoUserIds } }, { listingId: { in: demoListingIds } }],
    },
  });
  await prisma.listing.deleteMany({ where: { slug: { in: [...listingSlugs] } } });
  await prisma.job.deleteMany({ where: { slug: { in: [...jobSlugs] } } });
  await prisma.event.deleteMany({ where: { slug: { in: [...eventSlugs] } } });
  await prisma.businessMember.deleteMany({ where: { businessId: { in: demoBusinessIds } } });
  await prisma.businessImage.deleteMany({ where: { businessId: { in: demoBusinessIds } } });
  await prisma.verification.deleteMany({ where: { businessId: { in: demoBusinessIds } } });
  await prisma.business.deleteMany({ where: { slug: { in: [...businessSlugs] } } });
  await prisma.communityPost.deleteMany({ where: { authorUserId: { in: demoUserIds } } });
  await prisma.verification.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.userRole.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.profile.deleteMany({ where: { userId: { in: demoUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
}

async function seedRoles() {
  const roles = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return Object.fromEntries(roles.map((role) => [role.name, role])) as Record<RoleName, (typeof roles)[number]>;
}

async function seedLocations() {
  const seeds: LocationSeed[] = [
    { key: "us", type: LocationType.COUNTRY, name: "United States", slug: "united-states", countryCode: "US" },
    { key: "dc", type: LocationType.STATE_REGION, name: "Washington, DC", slug: "washington-dc", parentKey: "us", countryCode: "US", regionCode: "DC", latitude: "38.907200", longitude: "-77.036900", timezone: "America/New_York" },
    { key: "md", type: LocationType.STATE_REGION, name: "Maryland", slug: "maryland", parentKey: "us", countryCode: "US", regionCode: "MD", latitude: "39.045800", longitude: "-76.641300", timezone: "America/New_York" },
    { key: "va", type: LocationType.STATE_REGION, name: "Virginia", slug: "virginia", parentKey: "us", countryCode: "US", regionCode: "VA", latitude: "37.431600", longitude: "-78.656900", timezone: "America/New_York" },
    { key: "montgomery", type: LocationType.COUNTY_DISTRICT, name: "Montgomery County", slug: "montgomery-county", parentKey: "md", countryCode: "US", regionCode: "MD" },
    { key: "pg", type: LocationType.COUNTY_DISTRICT, name: "Prince George's County", slug: "prince-georges-county", parentKey: "md", countryCode: "US", regionCode: "MD" },
    { key: "arlington-county", type: LocationType.COUNTY_DISTRICT, name: "Arlington County", slug: "arlington-county", parentKey: "va", countryCode: "US", regionCode: "VA" },
    { key: "fairfax-county", type: LocationType.COUNTY_DISTRICT, name: "Fairfax County", slug: "fairfax-county", parentKey: "va", countryCode: "US", regionCode: "VA" },
    { key: "dc-city", type: LocationType.CITY, name: "Washington", slug: "washington", parentKey: "dc", countryCode: "US", regionCode: "DC", latitude: "38.907200", longitude: "-77.036900", timezone: "America/New_York" },
    { key: "silver-spring", type: LocationType.CITY, name: "Silver Spring", slug: "silver-spring", parentKey: "montgomery", countryCode: "US", regionCode: "MD", latitude: "38.990700", longitude: "-77.026100", timezone: "America/New_York" },
    { key: "rockville", type: LocationType.CITY, name: "Rockville", slug: "rockville", parentKey: "montgomery", countryCode: "US", regionCode: "MD", latitude: "39.084000", longitude: "-77.152800", timezone: "America/New_York" },
    { key: "hyattsville", type: LocationType.CITY, name: "Hyattsville", slug: "hyattsville", parentKey: "pg", countryCode: "US", regionCode: "MD", latitude: "38.955900", longitude: "-76.945500", timezone: "America/New_York" },
    { key: "arlington", type: LocationType.CITY, name: "Arlington", slug: "arlington", parentKey: "arlington-county", countryCode: "US", regionCode: "VA", latitude: "38.881600", longitude: "-77.091000", timezone: "America/New_York" },
    { key: "alexandria", type: LocationType.CITY, name: "Alexandria", slug: "alexandria", parentKey: "fairfax-county", countryCode: "US", regionCode: "VA", latitude: "38.804800", longitude: "-77.046900", timezone: "America/New_York" },
    { key: "fairfax", type: LocationType.CITY, name: "Fairfax", slug: "fairfax", parentKey: "fairfax-county", countryCode: "US", regionCode: "VA", latitude: "38.846200", longitude: "-77.306400", timezone: "America/New_York" },
    { key: "adams-morgan", type: LocationType.NEIGHBORHOOD, name: "Adams Morgan", slug: "adams-morgan", parentKey: "dc-city", countryCode: "US", regionCode: "DC" },
    { key: "shaw", type: LocationType.NEIGHBORHOOD, name: "Shaw", slug: "shaw", parentKey: "dc-city", countryCode: "US", regionCode: "DC" },
    { key: "navy-yard", type: LocationType.NEIGHBORHOOD, name: "Navy Yard", slug: "navy-yard", parentKey: "dc-city", countryCode: "US", regionCode: "DC" },
    { key: "wheaton", type: LocationType.NEIGHBORHOOD, name: "Wheaton", slug: "wheaton", parentKey: "silver-spring", countryCode: "US", regionCode: "MD" },
    { key: "bethesda", type: LocationType.NEIGHBORHOOD, name: "Bethesda", slug: "bethesda", parentKey: "rockville", countryCode: "US", regionCode: "MD" },
    { key: "clarendon", type: LocationType.NEIGHBORHOOD, name: "Clarendon", slug: "clarendon", parentKey: "arlington", countryCode: "US", regionCode: "VA" },
    { key: "ballston", type: LocationType.NEIGHBORHOOD, name: "Ballston", slug: "ballston", parentKey: "arlington", countryCode: "US", regionCode: "VA" },
    { key: "old-town", type: LocationType.NEIGHBORHOOD, name: "Old Town", slug: "old-town", parentKey: "alexandria", countryCode: "US", regionCode: "VA" },
  ];

  const locations: Record<string, { id: string }> = {};

  for (const seed of seeds) {
    const parentId = seed.parentKey ? locations[seed.parentKey]?.id : null;
    const existing = await prisma.location.findFirst({
      where: { slug: seed.slug, type: seed.type, parentId },
    });
    const data = {
      type: seed.type,
      name: seed.name,
      slug: seed.slug,
      parentId,
      countryCode: seed.countryCode,
      regionCode: seed.regionCode,
      latitude: seed.latitude,
      longitude: seed.longitude,
      timezone: seed.timezone,
      isActive: true,
    };

    locations[seed.key] = existing
      ? await prisma.location.update({ where: { id: existing.id }, data })
      : await prisma.location.create({ data });
  }

  return locations;
}

async function seedMarketplaceRegion(locations: Record<string, { id: string }>) {
  const region = await prisma.marketplaceRegion.upsert({
    where: { slug: "dmv" },
    update: {
      name: "Washington, DC / Maryland / Northern Virginia",
      countryCode: "US",
      defaultLatitude: "38.907200",
      defaultLongitude: "-77.036900",
      defaultRadiusMiles: 50,
      isLaunchMarket: true,
      isActive: true,
    },
    create: {
      name: "Washington, DC / Maryland / Northern Virginia",
      slug: "dmv",
      countryCode: "US",
      defaultLatitude: "38.907200",
      defaultLongitude: "-77.036900",
      defaultRadiusMiles: 50,
      isLaunchMarket: true,
      isActive: true,
    },
  });

  for (const [priority, key] of ["dc-city", "silver-spring", "rockville", "hyattsville", "arlington", "alexandria", "fairfax"].entries()) {
    const existing = await prisma.marketplaceRegionLocation.findFirst({
      where: { marketplaceRegionId: region.id, locationId: locations[key].id },
    });
    if (existing) {
      await prisma.marketplaceRegionLocation.update({ where: { id: existing.id }, data: { priority } });
    } else {
      await prisma.marketplaceRegionLocation.create({
        data: { marketplaceRegionId: region.id, locationId: locations[key].id, priority },
      });
    }
  }

  return region;
}

async function seedCategories() {
  const seeds: CategorySeed[] = [
    { key: "carsRoot", domainType: CategoryDomainType.LISTING, name: "Cars & Vehicles", slug: "cars-vehicles", description: "Cars, parts, and local vehicle listings.", iconKey: "car", sortOrder: 10, isFeatured: true },
    { key: "cars", parentKey: "carsRoot", domainType: CategoryDomainType.LISTING, name: "Cars", slug: "cars", iconKey: "car-front", sortOrder: 10, isFeatured: true },
    { key: "autoParts", parentKey: "carsRoot", domainType: CategoryDomainType.LISTING, name: "Auto Parts", slug: "auto-parts", iconKey: "wrench", sortOrder: 20 },
    { key: "housingRoot", domainType: CategoryDomainType.LISTING, name: "Housing", slug: "housing", description: "Rooms, rentals, and local housing opportunities.", iconKey: "home", sortOrder: 20, isFeatured: true },
    { key: "apartments", parentKey: "housingRoot", domainType: CategoryDomainType.LISTING, name: "Apartments for Rent", slug: "apartments-for-rent", iconKey: "building", sortOrder: 10, isFeatured: true },
    { key: "rooms", parentKey: "housingRoot", domainType: CategoryDomainType.LISTING, name: "Rooms & Shared Housing", slug: "rooms-shared-housing", iconKey: "door-open", sortOrder: 20, isFeatured: true },
    { key: "buySellRoot", domainType: CategoryDomainType.LISTING, name: "Buy & Sell", slug: "buy-sell", description: "Everyday local goods from DMV neighbors.", iconKey: "shopping-bag", sortOrder: 30, isFeatured: true },
    { key: "furniture", parentKey: "buySellRoot", domainType: CategoryDomainType.LISTING, name: "Furniture", slug: "furniture", iconKey: "armchair", sortOrder: 10, isFeatured: true },
    { key: "electronics", parentKey: "buySellRoot", domainType: CategoryDomainType.LISTING, name: "Electronics", slug: "electronics", iconKey: "monitor", sortOrder: 20, isFeatured: true },
    { key: "babyKids", parentKey: "buySellRoot", domainType: CategoryDomainType.LISTING, name: "Baby & Kids", slug: "baby-kids", iconKey: "baby", sortOrder: 30 },
    { key: "servicesRoot", domainType: CategoryDomainType.SERVICE, name: "Services", slug: "services", iconKey: "briefcase-business", sortOrder: 40, isFeatured: true },
    { key: "jobsRoot", domainType: CategoryDomainType.JOB, name: "Jobs", slug: "jobs", iconKey: "briefcase", sortOrder: 50 },
    { key: "hospitalityJobs", parentKey: "jobsRoot", domainType: CategoryDomainType.JOB, name: "Food & Hospitality", slug: "food-hospitality", iconKey: "utensils", sortOrder: 10 },
    { key: "businessesRoot", domainType: CategoryDomainType.BUSINESS, name: "Businesses", slug: "businesses", iconKey: "store", sortOrder: 60 },
    { key: "restaurants", parentKey: "businessesRoot", domainType: CategoryDomainType.BUSINESS, name: "Restaurants & Cafes", slug: "restaurants-cafes", iconKey: "coffee", sortOrder: 10 },
    { key: "eventsRoot", domainType: CategoryDomainType.EVENT, name: "Events", slug: "events", iconKey: "calendar-days", sortOrder: 70 },
    { key: "networkingEvents", parentKey: "eventsRoot", domainType: CategoryDomainType.EVENT, name: "Networking", slug: "networking", iconKey: "users", sortOrder: 10 },
    { key: "communityRoot", domainType: CategoryDomainType.COMMUNITY, name: "Community", slug: "community", iconKey: "messages-square", sortOrder: 80 },
  ];

  const categories: Record<string, { id: string }> = {};

  for (const seed of seeds) {
    const parentId = seed.parentKey ? categories[seed.parentKey]?.id : null;
    const existing = await prisma.category.findFirst({ where: { slug: seed.slug, parentId } });
    const data = {
      parentId,
      domainType: seed.domainType,
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      iconKey: seed.iconKey,
      sortOrder: seed.sortOrder,
      isActive: true,
      isFeatured: Boolean(seed.isFeatured),
    };
    categories[seed.key] = existing
      ? await prisma.category.update({ where: { id: existing.id }, data })
      : await prisma.category.create({ data });
  }

  return categories;
}

async function seedAttributes(categories: Record<string, { id: string }>) {
  const attributes: Record<string, { id: string }> = {};

  async function upsertAttribute(
    key: string,
    categoryKey: string,
    data: {
      label: string;
      dataType: AttributeDataType;
      isRequired?: boolean;
      isFilterable?: boolean;
      isSearchable?: boolean;
      unit?: string;
      sortOrder: number;
      validationJson?: Prisma.InputJsonValue;
      options?: Array<{ value: string; label: string; sortOrder: number }>;
    },
  ) {
    const categoryId = categories[categoryKey].id;
    const existing = await prisma.categoryAttributeDefinition.findUnique({
      where: { categoryId_key: { categoryId, key } },
    });
    const writeData = {
      categoryId,
      key,
      label: data.label,
      dataType: data.dataType,
      isRequired: Boolean(data.isRequired),
      isFilterable: Boolean(data.isFilterable),
      isSearchable: Boolean(data.isSearchable),
      unit: data.unit,
      sortOrder: data.sortOrder,
      validationJson: data.validationJson,
    };
    const definition = existing
      ? await prisma.categoryAttributeDefinition.update({ where: { id: existing.id }, data: writeData })
      : await prisma.categoryAttributeDefinition.create({ data: writeData });

    if (data.options) {
      for (const option of data.options) {
        await prisma.categoryAttributeOption.upsert({
          where: {
            attributeDefinitionId_value: {
              attributeDefinitionId: definition.id,
              value: option.value,
            },
          },
          update: { label: option.label, sortOrder: option.sortOrder, isActive: true },
          create: {
            attributeDefinitionId: definition.id,
            value: option.value,
            label: option.label,
            sortOrder: option.sortOrder,
            isActive: true,
          },
        });
      }
    }

    attributes[`${categoryKey}.${key}`] = definition;
  }

  await upsertAttribute("make", "cars", {
    label: "Make",
    dataType: AttributeDataType.ENUM,
    isRequired: true,
    isFilterable: true,
    isSearchable: true,
    sortOrder: 10,
    options: [
      { value: "toyota", label: "Toyota", sortOrder: 10 },
      { value: "honda", label: "Honda", sortOrder: 20 },
      { value: "ford", label: "Ford", sortOrder: 30 },
      { value: "subaru", label: "Subaru", sortOrder: 40 },
    ],
  });
  await upsertAttribute("model", "cars", { label: "Model", dataType: AttributeDataType.TEXT, isRequired: true, isSearchable: true, sortOrder: 20 });
  await upsertAttribute("year", "cars", { label: "Year", dataType: AttributeDataType.INTEGER, isRequired: true, isFilterable: true, sortOrder: 30, validationJson: { min: 1980, max: 2027 } });
  await upsertAttribute("mileage", "cars", { label: "Mileage", dataType: AttributeDataType.INTEGER, isFilterable: true, unit: "mi", sortOrder: 40, validationJson: { min: 0 } });
  await upsertAttribute("transmission", "cars", {
    label: "Transmission",
    dataType: AttributeDataType.ENUM,
    isFilterable: true,
    sortOrder: 50,
    options: [
      { value: "automatic", label: "Automatic", sortOrder: 10 },
      { value: "manual", label: "Manual", sortOrder: 20 },
    ],
  });

  await upsertAttribute("housing_type", "rooms", {
    label: "Housing type",
    dataType: AttributeDataType.ENUM,
    isRequired: true,
    isFilterable: true,
    sortOrder: 10,
    options: [
      { value: "private_room", label: "Private room", sortOrder: 10 },
      { value: "shared_room", label: "Shared room", sortOrder: 20 },
      { value: "studio", label: "Studio", sortOrder: 30 },
    ],
  });
  await upsertAttribute("bedrooms", "rooms", { label: "Bedrooms", dataType: AttributeDataType.INTEGER, isFilterable: true, sortOrder: 20, validationJson: { min: 0, max: 10 } });
  await upsertAttribute("bathrooms", "rooms", { label: "Bathrooms", dataType: AttributeDataType.DECIMAL, isFilterable: true, sortOrder: 30, validationJson: { min: 0, max: 10 } });
  await upsertAttribute("furnished", "rooms", { label: "Furnished", dataType: AttributeDataType.BOOLEAN, isFilterable: true, sortOrder: 40 });
  await upsertAttribute("lease_term", "rooms", {
    label: "Lease term",
    dataType: AttributeDataType.ENUM,
    isFilterable: true,
    sortOrder: 50,
    options: [
      { value: "month_to_month", label: "Month-to-month", sortOrder: 10 },
      { value: "six_months", label: "6 months", sortOrder: 20 },
      { value: "one_year", label: "1 year", sortOrder: 30 },
    ],
  });

  for (const categoryKey of ["furniture", "electronics"] as const) {
    await upsertAttribute("condition", categoryKey, {
      label: "Condition",
      dataType: AttributeDataType.ENUM,
      isRequired: true,
      isFilterable: true,
      sortOrder: 10,
      options: [
        { value: "new", label: "New", sortOrder: 10 },
        { value: "like_new", label: "Like new", sortOrder: 20 },
        { value: "good", label: "Good", sortOrder: 30 },
        { value: "fair", label: "Fair", sortOrder: 40 },
      ],
    });
    await upsertAttribute("brand", categoryKey, { label: "Brand", dataType: AttributeDataType.TEXT, isSearchable: true, sortOrder: 20 });
    await upsertAttribute("delivery_available", categoryKey, { label: "Delivery available", dataType: AttributeDataType.BOOLEAN, isFilterable: true, sortOrder: 30 });
  }

  return attributes;
}

async function seedUsers(
  roles: Record<RoleName, { id: string }>,
  locations: Record<string, { id: string }>,
) {
  const userSeeds = [
    { key: "sellerAmina", email: demoEmails[0], displayName: "Amina D.", username: "demo-amina", status: UserStatus.ACTIVE, role: RoleName.REGISTERED_USER, locationKey: "silver-spring", publicLocationText: "Silver Spring, MD", bio: "Demo neighbor account for local marketplace development fixtures." },
    { key: "buyerSamir", email: demoEmails[1], displayName: "Samir K.", username: "demo-samir", status: UserStatus.ACTIVE, role: RoleName.REGISTERED_USER, locationKey: "arlington", publicLocationText: "Arlington, VA", bio: "Synthetic buyer profile used for saved listing and messaging fixtures." },
    { key: "sellerMaya", email: demoEmails[2], displayName: "Maya R.", username: "demo-maya", status: UserStatus.PENDING_VERIFICATION, role: RoleName.BUSINESS_ACCOUNT, locationKey: "dc-city", publicLocationText: "Washington, DC", bio: "Synthetic business owner profile for local development only." },
    { key: "moderatorDavid", email: demoEmails[3], displayName: "David M.", username: "demo-moderator", status: UserStatus.ACTIVE, role: RoleName.MODERATOR, locationKey: "dc-city", publicLocationText: "Washington, DC", bio: "Synthetic moderator account for future admin workflow development." },
    { key: "adminNora", email: demoEmails[4], displayName: "Nora A.", username: "demo-admin", status: UserStatus.ACTIVE, role: RoleName.ADMIN, locationKey: "rockville", publicLocationText: "Rockville, MD", bio: "Synthetic admin account for future administrative fixtures." },
  ] as const;

  const users: Record<string, { id: string }> = {};

  for (const seed of userSeeds) {
    const user = await prisma.user.upsert({
      where: { emailNormalized: seed.email },
      update: {
        email: seed.email,
        status: seed.status,
        defaultRole: seed.role,
        emailVerifiedAt: seed.status === UserStatus.ACTIVE ? new Date("2026-08-01T12:00:00.000Z") : null,
        lastActiveAt: new Date("2026-08-20T12:00:00.000Z"),
      },
      create: {
        email: seed.email,
        emailNormalized: seed.email,
        passwordHash: "demo-fixture-password-hash-not-valid-for-login",
        status: seed.status,
        defaultRole: seed.role,
        emailVerifiedAt: seed.status === UserStatus.ACTIVE ? new Date("2026-08-01T12:00:00.000Z") : null,
        lastActiveAt: new Date("2026-08-20T12:00:00.000Z"),
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        displayName: seed.displayName,
        username: seed.username,
        bio: seed.bio,
        cityLocationId: locations[seed.locationKey].id,
        publicLocationText: seed.publicLocationText,
        sellerRatingAverage: null,
        sellerRatingCount: 0,
        isPublic: true,
      },
      create: {
        userId: user.id,
        displayName: seed.displayName,
        username: seed.username,
        bio: seed.bio,
        cityLocationId: locations[seed.locationKey].id,
        publicLocationText: seed.publicLocationText,
        sellerRatingAverage: null,
        sellerRatingCount: 0,
        isPublic: true,
      },
    });

    const role = roles[seed.role];
    const existingUserRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id, revokedAt: null },
    });
    if (!existingUserRole) {
      await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    }

    users[seed.key] = user;
  }

  return users;
}

async function seedListings(
  users: Record<string, { id: string }>,
  locations: Record<string, { id: string }>,
  categories: Record<string, { id: string }>,
  attributes: Record<string, { id: string }>,
) {
  return {
    car: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerAmina.id,
        categoryId: categories.cars.id,
        title: "Demo 2016 Toyota Camry SE",
        slug: "demo-2016-toyota-camry-se",
        description: "Synthetic demo listing: clean commuter sedan, DMV title status intentionally omitted until posting flows exist.",
        priceAmount: "9200.00",
        priceType: PriceType.NEGOTIABLE,
        condition: "good",
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations["silver-spring"].id,
        locationPrecision: LocationPrecision.CITY,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        isFeatured: true,
        featuredSource: "demo_seed",
        publishedAt: new Date("2026-08-20T15:00:00.000Z"),
        expiresAt: new Date("2026-09-19T15:00:00.000Z"),
        images: { create: [image("demo-car", "/fixtures/listings/demo-car.svg", "Demo placeholder image for a sedan listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["cars.make"].id, optionValue: "toyota" },
            { attributeDefinitionId: attributes["cars.model"].id, textValue: "Camry SE" },
            { attributeDefinitionId: attributes["cars.year"].id, integerValue: 2016 },
            { attributeDefinitionId: attributes["cars.mileage"].id, integerValue: 84500 },
            { attributeDefinitionId: attributes["cars.transmission"].id, optionValue: "automatic" },
          ],
        },
      },
    }),
    room: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerMaya.id,
        categoryId: categories.rooms.id,
        title: "Demo Silver Spring room near Metro",
        slug: "demo-silver-spring-room-near-metro",
        description: "Synthetic draft listing for development. Public location is approximate and does not include a street address.",
        priceAmount: "950.00",
        priceType: PriceType.PER_MONTH,
        status: ListingStatus.DRAFT,
        moderationState: ModerationState.NOT_REVIEWED,
        publicLocationId: locations.wheaton.id,
        locationPrecision: LocationPrecision.NEIGHBORHOOD,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["rooms.housing_type"].id, optionValue: "private_room" },
            { attributeDefinitionId: attributes["rooms.bedrooms"].id, integerValue: 1 },
            { attributeDefinitionId: attributes["rooms.bathrooms"].id, decimalValue: "1.0000" },
            { attributeDefinitionId: attributes["rooms.furnished"].id, booleanValue: true },
            { attributeDefinitionId: attributes["rooms.lease_term"].id, optionValue: "month_to_month" },
          ],
        },
      },
    }),
    table: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerAmina.id,
        categoryId: categories.furniture.id,
        title: "Demo solid wood dining table",
        slug: "demo-solid-wood-dining-table-sold",
        description: "Synthetic completed listing retained for lifecycle and saved-listing development.",
        priceAmount: "180.00",
        priceType: PriceType.FIXED,
        condition: "good",
        status: ListingStatus.SOLD,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations["adams-morgan"].id,
        locationPrecision: LocationPrecision.NEIGHBORHOOD,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        publishedAt: new Date("2026-07-15T15:00:00.000Z"),
        soldAt: new Date("2026-07-18T15:00:00.000Z"),
        images: { create: [image("demo-table", "/fixtures/listings/demo-table.svg", "Demo placeholder image for a dining table listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["furniture.condition"].id, optionValue: "good" },
            { attributeDefinitionId: attributes["furniture.brand"].id, textValue: "Demo Local Workshop" },
            { attributeDefinitionId: attributes["furniture.delivery_available"].id, booleanValue: false },
          ],
        },
      },
    }),
    camera: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerMaya.id,
        categoryId: categories.electronics.id,
        title: "Demo mirrorless camera kit",
        slug: "demo-mirrorless-camera-kit",
        description: "Synthetic electronics listing for search, card, and moderation fixture development.",
        priceAmount: "640.00",
        priceType: PriceType.NEGOTIABLE,
        condition: "like_new",
        status: ListingStatus.PENDING_REVIEW,
        moderationState: ModerationState.NEEDS_REVIEW,
        publicLocationId: locations.clarendon.id,
        locationPrecision: LocationPrecision.NEIGHBORHOOD,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        publishedAt: new Date("2026-08-24T15:00:00.000Z"),
        images: { create: [image("demo-camera", "/fixtures/listings/demo-camera.svg", "Demo placeholder image for a camera listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["electronics.condition"].id, optionValue: "like_new" },
            { attributeDefinitionId: attributes["electronics.brand"].id, textValue: "DemoCam" },
            { attributeDefinitionId: attributes["electronics.delivery_available"].id, booleanValue: true },
          ],
        },
      },
    }),
    officeChair: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerAmina.id,
        categoryId: categories.furniture.id,
        title: "Demo ergonomic office chair",
        slug: "demo-adams-morgan-office-chair",
        description: "Synthetic active fixture for homepage marketplace density.",
        priceAmount: "85.00",
        priceType: PriceType.FIXED,
        condition: "good",
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations["adams-morgan"].id,
        locationPrecision: LocationPrecision.NEIGHBORHOOD,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        publishedAt: new Date("2026-08-23T15:00:00.000Z"),
        expiresAt: new Date("2026-09-22T15:00:00.000Z"),
        images: { create: [image("demo-table", "/fixtures/listings/demo-table.svg", "Demo placeholder image for a furniture listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["furniture.condition"].id, optionValue: "good" },
            { attributeDefinitionId: attributes["furniture.brand"].id, textValue: "Demo Office" },
            { attributeDefinitionId: attributes["furniture.delivery_available"].id, booleanValue: true },
          ],
        },
      },
    }),
    iphone: await prisma.listing.create({
      data: {
        ownerUserId: users.buyerSamir.id,
        categoryId: categories.electronics.id,
        title: "Demo iPhone 12 Pro 128GB",
        slug: "demo-rockville-iphone-12-pro",
        description: "Synthetic active electronics fixture for homepage browsing.",
        priceAmount: "420.00",
        priceType: PriceType.NEGOTIABLE,
        condition: "good",
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations.rockville.id,
        locationPrecision: LocationPrecision.CITY,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        publishedAt: new Date("2026-08-22T15:00:00.000Z"),
        expiresAt: new Date("2026-09-21T15:00:00.000Z"),
        images: { create: [image("demo-camera", "/fixtures/listings/demo-camera.svg", "Demo placeholder image for an electronics listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["electronics.condition"].id, optionValue: "good" },
            { attributeDefinitionId: attributes["electronics.brand"].id, textValue: "DemoPhone" },
            { attributeDefinitionId: attributes["electronics.delivery_available"].id, booleanValue: false },
          ],
        },
      },
    }),
    bookshelf: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerAmina.id,
        categoryId: categories.furniture.id,
        title: "Demo tall walnut bookshelf",
        slug: "demo-alexandria-bookshelf",
        description: "Synthetic active home-goods fixture for responsive homepage cards.",
        priceAmount: "140.00",
        priceType: PriceType.FIXED,
        condition: "like_new",
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations.alexandria.id,
        locationPrecision: LocationPrecision.CITY,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        publishedAt: new Date("2026-08-21T15:00:00.000Z"),
        expiresAt: new Date("2026-09-20T15:00:00.000Z"),
        images: { create: [image("demo-table", "/fixtures/listings/demo-table.svg", "Demo placeholder image for a bookshelf listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["furniture.condition"].id, optionValue: "like_new" },
            { attributeDefinitionId: attributes["furniture.brand"].id, textValue: "Demo Home" },
            { attributeDefinitionId: attributes["furniture.delivery_available"].id, booleanValue: false },
          ],
        },
      },
    }),
    activeRoom: await prisma.listing.create({
      data: {
        ownerUserId: users.sellerMaya.id,
        categoryId: categories.rooms.id,
        title: "Demo furnished room in Wheaton",
        slug: "demo-wheaton-room-available",
        description: "Synthetic active housing fixture with approximate public location only.",
        priceAmount: "1050.00",
        priceType: PriceType.PER_MONTH,
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations.wheaton.id,
        locationPrecision: LocationPrecision.NEIGHBORHOOD,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        isFeatured: true,
        featuredSource: "demo_seed",
        publishedAt: new Date("2026-08-19T15:00:00.000Z"),
        expiresAt: new Date("2026-09-18T15:00:00.000Z"),
        images: { create: [image("demo-event", "/fixtures/listings/demo-event.svg", "Demo placeholder image for a room listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["rooms.housing_type"].id, optionValue: "private_room" },
            { attributeDefinitionId: attributes["rooms.bedrooms"].id, integerValue: 1 },
            { attributeDefinitionId: attributes["rooms.bathrooms"].id, decimalValue: "1.0000" },
            { attributeDefinitionId: attributes["rooms.furnished"].id, booleanValue: true },
            { attributeDefinitionId: attributes["rooms.lease_term"].id, optionValue: "month_to_month" },
          ],
        },
      },
    }),
    macbook: await prisma.listing.create({
      data: {
        ownerUserId: users.buyerSamir.id,
        categoryId: categories.electronics.id,
        title: "Demo MacBook Pro 13 inch",
        slug: "demo-dc-macbook-pro",
        description: "Synthetic active electronics fixture for homepage card density.",
        priceAmount: "650.00",
        priceType: PriceType.FIXED,
        condition: "good",
        status: ListingStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
        publicLocationId: locations["dc-city"].id,
        locationPrecision: LocationPrecision.CITY,
        contactPreference: ContactPreference.IN_APP_MESSAGE,
        publishedAt: new Date("2026-08-18T15:00:00.000Z"),
        expiresAt: new Date("2026-09-17T15:00:00.000Z"),
        images: { create: [image("demo-camera", "/fixtures/listings/demo-camera.svg", "Demo placeholder image for a laptop listing", 0)] },
        attributeValues: {
          create: [
            { attributeDefinitionId: attributes["electronics.condition"].id, optionValue: "good" },
            { attributeDefinitionId: attributes["electronics.brand"].id, textValue: "DemoBook" },
            { attributeDefinitionId: attributes["electronics.delivery_available"].id, booleanValue: true },
          ],
        },
      },
    }),
  };
}

function image(storageKey: string, publicUrl: string, altText: string, sortOrder: number) {
  return {
    storageKey: `fixtures/listings/${storageKey}.svg`,
    publicUrl,
    width: 1200,
    height: 800,
    mimeType: "image/svg+xml",
    fileSizeBytes: 2048,
    sortOrder,
    altText,
    moderationState: ModerationState.AUTO_CLEARED,
  };
}

async function seedEngagement(users: Record<string, { id: string }>, listings: Record<string, { id: string }>) {
  await prisma.favorite.create({ data: { userId: users.buyerSamir.id, listingId: listings.car.id } });

  const conversation = await prisma.conversation.create({
    data: {
      contextType: ConversationContextType.LISTING,
      listingId: listings.car.id,
      lastMessageAt: new Date("2026-08-22T17:00:00.000Z"),
      participants: {
        create: [
          { userId: users.buyerSamir.id, lastReadAt: new Date("2026-08-22T17:05:00.000Z") },
          { userId: users.sellerAmina.id, lastReadAt: new Date("2026-08-22T16:45:00.000Z") },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: users.buyerSamir.id,
      body: "Demo message: Is the Camry still available this weekend?",
      messageType: MessageType.TEXT,
      sentAt: new Date("2026-08-22T17:00:00.000Z"),
      moderationState: ModerationState.AUTO_CLEARED,
    },
  });

  await prisma.notification.create({
    data: {
      userId: users.sellerAmina.id,
      type: NotificationType.NEW_MESSAGE,
      title: "Demo new message",
      body: "Samir sent a synthetic development-fixture message.",
      entityType: "Conversation",
      entityId: conversation.id,
    },
  });
}

async function seedBusiness(users: Record<string, { id: string }>, locations: Record<string, { id: string }>, categories: Record<string, { id: string }>) {
  async function createDemoBusiness(data: {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    publicLocationId: string;
    phonePublic?: string;
    emailPublic?: string;
    websiteUrl?: string;
  }) {
    return prisma.business.create({
      data: {
      ownerUserId: users.sellerMaya.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      status: BusinessStatus.ACTIVE,
      verificationStatus: VerificationStatus.PENDING,
      logoUrl: "/fixtures/listings/demo-business.svg",
      publicLocationId: data.publicLocationId,
      phonePublic: data.phonePublic,
      emailPublic: data.emailPublic,
      websiteUrl: data.websiteUrl,
      hoursJson: { monday: "8:00-16:00", saturday: "9:00-14:00" },
      members: {
        create: [{ userId: users.sellerMaya.id, role: BusinessMemberRole.OWNER, acceptedAt: new Date("2026-08-01T12:00:00.000Z") }],
      },
      images: {
        create: [{ storageKey: "fixtures/listings/demo-business.svg", publicUrl: "/fixtures/listings/demo-business.svg", sortOrder: 0, altText: `Demo placeholder image for ${data.name}` }],
      },
    },
    });
  }

  const cafe = await createDemoBusiness({
    name: "Demo Buna Market Cafe",
    slug: "demo-buna-market-cafe",
    description: "Synthetic DMV cafe profile for business directory development fixtures.",
    categoryId: categories.restaurants.id,
    publicLocationId: locations.shaw.id,
    phonePublic: "202-555-0199",
    emailPublic: "hello-demo@guzomarket.test",
    websiteUrl: "https://example.test/demo-buna-market-cafe",
  });

  await createDemoBusiness({
    name: "Demo Selam Cleaning Services",
    slug: "demo-selam-cleaning-services",
    description: "Synthetic local services fixture for homepage business density.",
    categoryId: categories.servicesRoot.id,
    publicLocationId: locations.rockville.id,
    websiteUrl: "https://example.test/demo-selam-cleaning-services",
  });

  await createDemoBusiness({
    name: "Demo Ethio Market Grocery",
    slug: "demo-ethio-market-grocery",
    description: "Synthetic grocery business fixture for development browsing.",
    categoryId: categories.restaurants.id,
    publicLocationId: locations.hyattsville.id,
    websiteUrl: "https://example.test/demo-ethio-market-grocery",
  });

  await createDemoBusiness({
    name: "Demo Habesha Auto Care",
    slug: "demo-habesha-auto-care",
    description: "Synthetic auto service business fixture for local discovery surfaces.",
    categoryId: categories.businessesRoot.id,
    publicLocationId: locations["silver-spring"].id,
    websiteUrl: "https://example.test/demo-habesha-auto-care",
  });

  await createDemoBusiness({
    name: "Demo Zemen Construction",
    slug: "demo-zemen-construction",
    description: "Synthetic contractor business fixture for responsive card testing.",
    categoryId: categories.businessesRoot.id,
    publicLocationId: locations.bethesda.id,
    websiteUrl: "https://example.test/demo-zemen-construction",
  });

  return cafe;
}

async function seedJobs(users: Record<string, { id: string }>, locations: Record<string, { id: string }>, categories: Record<string, { id: string }>, businessId: string) {
  await prisma.job.create({
    data: {
      ownerUserId: users.sellerMaya.id,
      businessId,
      categoryId: categories.hospitalityJobs.id,
      title: "Demo weekend barista",
      slug: "demo-weekend-barista",
      employerName: "Demo Buna Market Cafe",
      description: "Synthetic job fixture for later jobs-stage development.",
      publicLocationId: locations.shaw.id,
      workMode: JobWorkMode.ON_SITE,
      employmentType: EmploymentType.PART_TIME,
      salaryMin: "18.00",
      salaryMax: "22.00",
      salaryCurrency: "USD",
      salaryPeriod: SalaryPeriod.HOUR,
      experienceText: "Customer service experience preferred.",
      skillsJson: ["customer service", "espresso", "weekend availability"],
      applicationMethod: JobApplicationMethod.IN_APP_CONTACT,
      status: JobStatus.ACTIVE,
      moderationState: ModerationState.AUTO_CLEARED,
      publishedAt: new Date("2026-08-18T15:00:00.000Z"),
      expiresAt: new Date("2026-09-17T15:00:00.000Z"),
    },
  });
}

async function seedEvents(users: Record<string, { id: string }>, locations: Record<string, { id: string }>, categories: Record<string, { id: string }>, businessId: string) {
  async function createDemoEvent(data: {
    title: string;
    slug: string;
    description: string;
    startAt: Date;
    endAt: Date;
    publicLocationId: string;
    venueName: string;
    contactUrl: string;
  }) {
    return prisma.event.create({
      data: {
      ownerUserId: users.sellerMaya.id,
      businessId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      categoryId: categories.networkingEvents.id,
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: "America/New_York",
      publicLocationId: data.publicLocationId,
      venueName: data.venueName,
      contactUrl: data.contactUrl,
      status: EventStatus.ACTIVE,
      moderationState: ModerationState.AUTO_CLEARED,
      publishedAt: new Date("2026-08-21T15:00:00.000Z"),
      images: {
        create: [{ storageKey: "fixtures/listings/demo-event.svg", publicUrl: "/fixtures/listings/demo-event.svg", sortOrder: 0, altText: `Demo placeholder image for ${data.title}` }],
      },
    },
    });
  }

  const meetup = await createDemoEvent({
    title: "Demo DMV small business meetup",
    slug: "demo-dmv-small-business-meetup",
    description: "Synthetic event fixture for later event discovery development.",
    startAt: new Date("2026-09-12T14:00:00.000Z"),
    endAt: new Date("2026-09-12T16:00:00.000Z"),
    publicLocationId: locations.shaw.id,
    venueName: "Demo Buna Market Cafe",
    contactUrl: "https://example.test/demo-dmv-small-business-meetup",
  });

  await createDemoEvent({
    title: "Demo community soccer meetup",
    slug: "demo-community-soccer-meetup",
    description: "Synthetic local event fixture for homepage community density.",
    startAt: new Date("2026-09-14T13:00:00.000Z"),
    endAt: new Date("2026-09-14T15:00:00.000Z"),
    publicLocationId: locations["old-town"].id,
    venueName: "Demo Old Town field",
    contactUrl: "https://example.test/demo-community-soccer-meetup",
  });

  await createDemoEvent({
    title: "Demo local food pop-up",
    slug: "demo-local-food-pop-up",
    description: "Synthetic food event fixture for responsive homepage testing.",
    startAt: new Date("2026-09-19T18:00:00.000Z"),
    endAt: new Date("2026-09-19T21:00:00.000Z"),
    publicLocationId: locations.hyattsville.id,
    venueName: "Demo community kitchen",
    contactUrl: "https://example.test/demo-local-food-pop-up",
  });

  return meetup;
}

async function seedCommunity(users: Record<string, { id: string }>, locations: Record<string, { id: string }>) {
  await prisma.communityPost.createMany({
    data: [
      {
        authorUserId: users.buyerSamir.id,
        type: CommunityPostType.RECOMMENDATION,
        title: "Demo: favorite Ethiopian grocery spots?",
        body: "Synthetic community fixture for later local discussion development.",
        publicLocationId: locations.arlington.id,
        status: CommunityPostStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
      },
      {
        authorUserId: users.sellerAmina.id,
        type: CommunityPostType.QUESTION,
        title: "Demo: looking for moving-box recommendations",
        body: "Synthetic community question fixture for homepage density.",
        publicLocationId: locations["silver-spring"].id,
        status: CommunityPostStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
      },
      {
        authorUserId: users.sellerMaya.id,
        type: CommunityPostType.LOCAL_INFORMATION,
        title: "Demo: weekend market street closures",
        body: "Synthetic local information fixture for community browsing.",
        publicLocationId: locations["dc-city"].id,
        status: CommunityPostStatus.ACTIVE,
        moderationState: ModerationState.AUTO_CLEARED,
      },
    ],
  });
}

async function seedModeration(users: Record<string, { id: string }>, listings: Record<string, { id: string }>) {
  await prisma.report.create({
    data: {
      reporterUserId: users.buyerSamir.id,
      subjectType: ReportSubjectType.LISTING,
      listingId: listings.camera.id,
      reason: ReportReason.MISLEADING,
      description: "Demo report: listing details need moderator review.",
      status: ReportStatus.OPEN,
      priority: ReportPriority.NORMAL,
      assignedModeratorId: users.moderatorDavid.id,
    },
  });

  await prisma.moderationAction.create({
    data: {
      moderatorUserId: users.moderatorDavid.id,
      targetType: ModerationTargetType.LISTING,
      targetId: listings.camera.id,
      actionType: ModerationActionType.FLAG,
      reasonCode: "demo_needs_review",
      notes: "Synthetic moderation action for future admin queue development.",
      previousStateJson: { moderationState: "NOT_REVIEWED" },
      newStateJson: { moderationState: "NEEDS_REVIEW" },
    },
  });
}

async function seedAudit(adminUserId: string, regionId: string, eventId: string) {
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: adminUserId,
        actorType: AuditActorType.ADMIN,
        action: "demo_seed.marketplace_region_ready",
        entityType: "MarketplaceRegion",
        entityId: regionId,
        metadataJson: { seed: true, region: "dmv" },
      },
      {
        actorType: AuditActorType.SYSTEM,
        action: "demo_seed.event_fixture_created",
        entityType: "Event",
        entityId: eventId,
        metadataJson: { seed: true },
      },
    ],
  });
}

async function collectSummary() {
  const [
    users,
    locations,
    categories,
    attributeDefinitions,
    listings,
    listingImages,
    reports,
    businesses,
    jobs,
    events,
    communityPosts,
  ] = await Promise.all([
    prisma.user.count({ where: { emailNormalized: { in: [...demoEmails] } } }),
    prisma.location.count(),
    prisma.category.count(),
    prisma.categoryAttributeDefinition.count(),
    prisma.listing.count({ where: { slug: { in: [...listingSlugs] } } }),
    prisma.listingImage.count({ where: { listing: { slug: { in: [...listingSlugs] } } } }),
    prisma.report.count(),
    prisma.business.count({ where: { slug: { in: [...businessSlugs] } } }),
    prisma.job.count({ where: { slug: { in: [...jobSlugs] } } }),
    prisma.event.count({ where: { slug: { in: [...eventSlugs] } } }),
    prisma.communityPost.count(),
  ]);

  return [
    { table: "User", records: users },
    { table: "Location", records: locations },
    { table: "Category", records: categories },
    { table: "CategoryAttributeDefinition", records: attributeDefinitions },
    { table: "Listing", records: listings },
    { table: "ListingImage", records: listingImages },
    { table: "Report", records: reports },
    { table: "Business", records: businesses },
    { table: "Job", records: jobs },
    { table: "Event", records: events },
    { table: "CommunityPost", records: communityPosts },
  ];
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed GuzoMarket development fixtures.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
