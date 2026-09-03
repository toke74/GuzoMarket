import { cache } from "react";

import { formatDate } from "@/lib/formatting/date";
import { prisma } from "@/server/db/client";
import {
  AttributeDataType,
  ListingStatus,
  ModerationState,
  PriceType,
  VerificationStatus,
  VerificationType,
  type Prisma,
} from "@/server/db/generated/prisma/client";
import { formatPublicLocationLabel } from "@/server/marketplace/locations";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const publicModerationStates: ModerationState[] = [ModerationState.AUTO_CLEARED, ModerationState.APPROVED];
const completedStatuses: ListingStatus[] = [
  ListingStatus.SOLD,
  ListingStatus.RENTED,
  ListingStatus.FILLED,
  ListingStatus.EXPIRED,
  ListingStatus.ARCHIVED,
];
const restrictedStatuses: ListingStatus[] = [ListingStatus.REJECTED, ListingStatus.REMOVED, ListingStatus.SUSPENDED];
const coreListingAttributeKeys = new Set(["condition"]);

export type ListingPublicState = "active" | "completed" | "unavailable";

export type ListingImageDTO = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ListingAttributeDTO = {
  key: string;
  label: string;
  value: string;
};

export type SellerSummaryDTO = {
  id: string;
  href: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  locationLabel: string;
  joinedLabel: string;
  responseRateLabel: string | null;
  responseTimeLabel: string | null;
  ratingLabel: string | null;
  verificationLabels: string[];
};

export type ListingSummaryDTO = {
  id: string;
  href: string;
  title: string;
  description: string;
  priceLabel: string;
  categoryLabel: string;
  categorySlug: string;
  parentCategoryLabel: string | null;
  locationLabel: string;
  postedLabel: string;
  statusLabel: string;
  publicState: ListingPublicState;
  contactEnabled: boolean;
  isOwner: boolean;
  managementHref: string;
  images: ListingImageDTO[];
  attributes: ListingAttributeDTO[];
  seller: SellerSummaryDTO;
  similarListings: ListingCardDTO[];
  sellerOtherListings: ListingCardDTO[];
};

export type ListingCardDTO = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  postedLabel: string;
  imageSrc: string | null;
  imageAlt: string | null;
  featured: boolean;
};

export type PublicSellerProfileDTO = SellerSummaryDTO & {
  activeListings: ListingCardDTO[];
};

export const getPublicListingDetail = cache(queryPublicListingDetail);
export const getPublicSellerProfile = cache(queryPublicSellerProfile);

export function parseListingStableId(slugAndId: string) {
  const id = slugAndId.slice(-36);
  return uuidPattern.test(id) ? id : null;
}

export async function queryPublicListingDetail(slugAndId: string, currentUserId?: string | null): Promise<ListingSummaryDTO | null> {
  const id = parseListingStableId(slugAndId);
  if (!id) {
    return null;
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      ownerUserId: true,
      categoryId: true,
      title: true,
      slug: true,
      description: true,
      priceAmount: true,
      priceCurrency: true,
      priceType: true,
      condition: true,
      status: true,
      moderationState: true,
      availabilityText: true,
      isFeatured: true,
      publishedAt: true,
      createdAt: true,
      deletedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: { select: { name: true, slug: true } },
        },
      },
      publicLocation: publicLocationSelect,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, publicUrl: true, width: true, height: true, altText: true },
      },
      attributeValues: {
        select: {
          textValue: true,
          integerValue: true,
          decimalValue: true,
          booleanValue: true,
          dateValue: true,
          optionValue: true,
          multiOptionJson: true,
          attributeDefinition: {
            select: {
              key: true,
              label: true,
              dataType: true,
              unit: true,
              sortOrder: true,
              options: { select: { value: true, label: true } },
            },
          },
        },
      },
      owner: {
        select: {
          id: true,
          createdAt: true,
          emailVerifiedAt: true,
          profile: profileSelect,
          verifications: {
            where: { status: VerificationStatus.VERIFIED },
            select: { type: true },
          },
        },
      },
    },
  });

  if (!listing || isRestrictedListing(listing)) {
    return null;
  }

  const publicState: ListingPublicState = listing.status === ListingStatus.ACTIVE ? "active" : "completed";
  const sellerProfile = listing.owner.profile?.isPublic ? listing.owner.profile : null;
  const seller = toSellerSummary({
    userId: listing.owner.id,
    userCreatedAt: listing.owner.createdAt,
    emailVerifiedAt: listing.owner.emailVerifiedAt,
    profile: sellerProfile,
    verifications: listing.owner.verifications,
  });

  const [similarListings, sellerOtherListings] = await Promise.all([
    queryListingCards({
      where: {
        ...activePublicListingWhere,
        categoryId: listing.categoryId,
        id: { not: listing.id },
      },
      take: 4,
    }),
    queryListingCards({
      where: {
        ...activePublicListingWhere,
        ownerUserId: listing.ownerUserId,
        id: { not: listing.id },
      },
      take: 4,
    }),
  ]);

  return {
    id: listing.id,
    href: `/listings/${listing.slug}-${listing.id}`,
    title: listing.title,
    description: listing.description,
    priceLabel: formatListingPrice(listing.priceAmount, listing.priceCurrency, listing.priceType),
    categoryLabel: listing.category.name,
    categorySlug: listing.category.slug,
    parentCategoryLabel: listing.category.parent?.name ?? null,
    locationLabel: listing.publicLocation ? formatPublicLocationLabel(listing.publicLocation) : "DMV",
    postedLabel: `Listed ${formatDate(listing.publishedAt ?? listing.createdAt)}`,
    statusLabel: getListingStatusLabel(listing.status),
    publicState,
    contactEnabled: publicState === "active" && currentUserId !== listing.ownerUserId,
    isOwner: currentUserId === listing.ownerUserId,
    managementHref: `/account/listings/${listing.id}/edit`,
    images: listing.images.map((image) => ({
      id: image.id,
      src: image.publicUrl,
      alt: image.altText ?? listing.title,
      width: image.width,
      height: image.height,
    })),
    attributes: buildListingAttributes(listing),
    seller,
    similarListings,
    sellerOtherListings,
  };
}

export async function queryPublicSellerProfile(usernameOrPublicId: string): Promise<PublicSellerProfileDTO | null> {
  const lookup = usernameOrPublicId.trim().toLowerCase();
  if (!lookup) {
    return null;
  }

  const profile = await prisma.profile.findFirst({
    where: {
      isPublic: true,
      OR: [
        { username: lookup },
        ...(uuidPattern.test(lookup) ? [{ id: lookup }, { userId: lookup }] : []),
      ],
      user: { status: "ACTIVE" },
    },
    select: {
      ...profileSelect.select,
      user: {
        select: {
          id: true,
          createdAt: true,
          emailVerifiedAt: true,
          verifications: {
            where: { status: VerificationStatus.VERIFIED },
            select: { type: true },
          },
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  const [activeListings, summary] = await Promise.all([
    queryListingCards({
      where: { ...activePublicListingWhere, ownerUserId: profile.userId },
      take: 12,
    }),
    Promise.resolve(
      toSellerSummary({
        userId: profile.user.id,
        userCreatedAt: profile.user.createdAt,
        emailVerifiedAt: profile.user.emailVerifiedAt,
        profile,
        verifications: profile.user.verifications,
      }),
    ),
  ]);

  return { ...summary, activeListings };
}

export function formatListingPrice(amount: unknown, currency: string, priceType: PriceType) {
  if (priceType === PriceType.FREE) {
    return "Free";
  }
  if (priceType === PriceType.CONTACT || amount == null) {
    return "Contact for price";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));

  if (priceType === PriceType.PER_MONTH) {
    return `${formatted}/mo`;
  }
  if (priceType === PriceType.PER_HOUR) {
    return `${formatted}/hr`;
  }

  return formatted;
}

const activePublicListingWhere = {
  status: ListingStatus.ACTIVE,
  moderationState: { in: publicModerationStates },
  deletedAt: null,
} satisfies Prisma.ListingWhereInput;

const publicLocationSelect = {
  select: {
    name: true,
    type: true,
    regionCode: true,
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
} satisfies Prisma.LocationDefaultArgs;

const profileSelect = {
  select: {
    id: true,
    userId: true,
    displayName: true,
    username: true,
    bio: true,
    avatarUrl: true,
    publicLocationText: true,
    joinedDisplayPreference: true,
    responseRatePercent: true,
    medianResponseMinutes: true,
    sellerRatingAverage: true,
    sellerRatingCount: true,
    isPublic: true,
    cityLocation: publicLocationSelect,
  },
} satisfies Prisma.ProfileDefaultArgs;

async function queryListingCards({ where, take }: { where: Prisma.ListingWhereInput; take: number }): Promise<ListingCardDTO[]> {
  const listings = await prisma.listing.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    take,
    select: {
      id: true,
      slug: true,
      title: true,
      priceAmount: true,
      priceCurrency: true,
      priceType: true,
      isFeatured: true,
      publishedAt: true,
      createdAt: true,
      publicLocation: publicLocationSelect,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { publicUrl: true, altText: true },
      },
    },
  });

  return listings.map((listing) => ({
    id: listing.id,
    href: `/listings/${listing.slug}-${listing.id}`,
    title: listing.title,
    priceLabel: formatListingPrice(listing.priceAmount, listing.priceCurrency, listing.priceType),
    locationLabel: listing.publicLocation ? formatPublicLocationLabel(listing.publicLocation) : "DMV",
    postedLabel: `Listed ${formatDate(listing.publishedAt ?? listing.createdAt)}`,
    imageSrc: listing.images[0]?.publicUrl ?? null,
    imageAlt: listing.images[0]?.altText ?? null,
    featured: listing.isFeatured,
  }));
}

function isRestrictedListing(listing: {
  status: ListingStatus;
  moderationState: ModerationState;
  deletedAt: Date | null;
}) {
  if (listing.deletedAt || restrictedStatuses.includes(listing.status)) {
    return true;
  }

  if (listing.status !== ListingStatus.ACTIVE && !completedStatuses.includes(listing.status)) {
    return true;
  }

  return !publicModerationStates.includes(listing.moderationState);
}

function getListingStatusLabel(status: ListingStatus) {
  if (status === ListingStatus.ACTIVE) {
    return "Active";
  }
  if (status === ListingStatus.SOLD) {
    return "Sold";
  }
  if (status === ListingStatus.RENTED) {
    return "Rented";
  }
  if (status === ListingStatus.FILLED) {
    return "Filled";
  }
  if (status === ListingStatus.EXPIRED) {
    return "Expired";
  }
  if (status === ListingStatus.ARCHIVED) {
    return "Archived";
  }
  return "Unavailable";
}

function buildListingAttributes(listing: {
  condition: string | null;
  availabilityText: string | null;
  attributeValues: Array<{
    textValue: string | null;
    integerValue: number | null;
    decimalValue: unknown | null;
    booleanValue: boolean | null;
    dateValue: Date | null;
    optionValue: string | null;
    multiOptionJson: Prisma.JsonValue | null;
    attributeDefinition: {
      key: string;
      label: string;
      dataType: AttributeDataType;
      unit: string | null;
      sortOrder: number;
      options: Array<{ value: string; label: string }>;
    };
  }>;
}) {
  const attributes: ListingAttributeDTO[] = [];

  if (listing.condition) {
    attributes.push({ key: "condition", label: "Condition", value: formatDisplayText(listing.condition) });
  }
  if (listing.availabilityText) {
    attributes.push({ key: "availability", label: "Availability", value: listing.availabilityText });
  }

  const sortedValues = [...listing.attributeValues].sort(
    (a, b) => a.attributeDefinition.sortOrder - b.attributeDefinition.sortOrder || a.attributeDefinition.label.localeCompare(b.attributeDefinition.label),
  );

  for (const value of sortedValues) {
    if (coreListingAttributeKeys.has(value.attributeDefinition.key)) {
      continue;
    }
    const formatted = formatAttributeValue(value);
    if (formatted) {
      attributes.push({
        key: value.attributeDefinition.key,
        label: value.attributeDefinition.label,
        value: formatted,
      });
    }
  }

  return attributes;
}

function formatAttributeValue(value: {
  textValue: string | null;
  integerValue: number | null;
  decimalValue: unknown | null;
  booleanValue: boolean | null;
  dateValue: Date | null;
  optionValue: string | null;
  multiOptionJson: Prisma.JsonValue | null;
  attributeDefinition: {
    key: string;
    label: string;
    dataType: AttributeDataType;
    unit: string | null;
    options: Array<{ value: string; label: string }>;
  };
}) {
  const { attributeDefinition } = value;
  const withUnit = (raw: string) => [raw, attributeDefinition.unit].filter(Boolean).join(" ");

  if (attributeDefinition.dataType === AttributeDataType.BOOLEAN && value.booleanValue != null) {
    return value.booleanValue ? "Yes" : "No";
  }
  if (attributeDefinition.dataType === AttributeDataType.INTEGER && value.integerValue != null) {
    const formattedInteger = isYearAttribute(value.attributeDefinition)
      ? String(value.integerValue)
      : value.integerValue.toLocaleString("en-US");
    return withUnit(formattedInteger);
  }
  if (attributeDefinition.dataType === AttributeDataType.DECIMAL && value.decimalValue != null) {
    return withUnit(Number(value.decimalValue).toLocaleString("en-US"));
  }
  if (attributeDefinition.dataType === AttributeDataType.DATE && value.dateValue) {
    return formatDate(value.dateValue);
  }
  if (attributeDefinition.dataType === AttributeDataType.ENUM && value.optionValue) {
    return attributeDefinition.options.find((option) => option.value === value.optionValue)?.label ?? formatDisplayText(value.optionValue);
  }
  const multiOptionValues = Array.isArray(value.multiOptionJson)
    ? value.multiOptionJson.filter((item): item is string => typeof item === "string")
    : [];
  if (attributeDefinition.dataType === AttributeDataType.MULTI_ENUM && multiOptionValues.length) {
    return multiOptionValues
      .map((optionValue) => attributeDefinition.options.find((option) => option.value === optionValue)?.label ?? formatDisplayText(optionValue))
      .join(", ");
  }
  return value.textValue ? formatDisplayText(value.textValue) : value.textValue;
}

function isYearAttribute(attributeDefinition: { key?: string; label?: string; unit: string | null }) {
  const key = attributeDefinition.key?.toLowerCase() ?? "";
  const label = attributeDefinition.label?.toLowerCase() ?? "";
  return !attributeDefinition.unit && (key === "year" || key.endsWith("_year") || label === "year" || label.endsWith(" year"));
}

function formatDisplayText(value: string) {
  const normalized = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return normalized;
  }

  return normalized
    .split(" ")
    .map((word) => {
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

function toSellerSummary({
  userId,
  userCreatedAt,
  emailVerifiedAt,
  profile,
  verifications,
}: {
  userId: string;
  userCreatedAt: Date;
  emailVerifiedAt: Date | null;
  profile: Prisma.ProfileGetPayload<typeof profileSelect> | null;
  verifications: Array<{ type: VerificationType }>;
}): SellerSummaryDTO {
  const displayName = profile?.displayName ?? "GuzoMarket seller";
  const verifiedTypes = new Set(verifications.map((verification) => verification.type));
  const verificationLabels = [];

  if (emailVerifiedAt || verifiedTypes.has(VerificationType.EMAIL)) {
    verificationLabels.push("Email verified");
  }
  if (verifiedTypes.has(VerificationType.PHONE)) {
    verificationLabels.push("Phone verified");
  }
  if (verifiedTypes.has(VerificationType.IDENTITY)) {
    verificationLabels.push("Identity verified");
  }

  return {
    id: userId,
    href: `/users/${profile?.username ?? userId}`,
    displayName,
    username: profile?.username ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    bio: profile?.bio ?? null,
    locationLabel: profile?.publicLocationText ?? (profile?.cityLocation ? formatPublicLocationLabel(profile.cityLocation) : "DMV"),
    joinedLabel: `Joined ${formatDate(userCreatedAt)}`,
    responseRateLabel: typeof profile?.responseRatePercent === "number" ? `${profile.responseRatePercent}% response rate` : null,
    responseTimeLabel:
      typeof profile?.medianResponseMinutes === "number" ? formatMedianResponseTime(profile.medianResponseMinutes) : null,
    ratingLabel:
      profile?.sellerRatingAverage && profile.sellerRatingCount > 0
        ? `${Number(profile.sellerRatingAverage).toFixed(1)} seller rating (${profile.sellerRatingCount})`
        : null,
    verificationLabels,
  };
}

function formatMedianResponseTime(minutes: number) {
  if (minutes < 60) {
    return `Usually replies in ${minutes} min`;
  }
  const hours = Math.round(minutes / 60);
  return `Usually replies in ${hours} hr`;
}
