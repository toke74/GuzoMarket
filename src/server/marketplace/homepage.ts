import { unstable_cache } from "next/cache";

import { formatDate } from "@/lib/formatting/date";
import { prisma } from "@/server/db/client";
import { BusinessStatus, CommunityPostStatus, EventStatus, ListingStatus, ModerationState, PriceType } from "@/server/db/generated/prisma/client";
import { formatPublicLocationLabel } from "@/server/marketplace/locations";

const HOMEPAGE_CACHE_SECONDS = 120;
const HOMEPAGE_CACHE_TAG = "marketplace:homepage";

export type HomepageListingDTO = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  publishedLabel: string;
  imageSrc: string | null;
  imageAlt: string | null;
  isFeatured: boolean;
};

export type HomepageBusinessDTO = {
  id: string;
  href: string;
  name: string;
  categoryLabel: string;
  locationLabel: string;
  imageSrc: string | null;
  imageAlt: string | null;
};

export type HomepageCommunityDTO = {
  id: string;
  href: string;
  eyebrow: string;
  title: string;
  detail: string;
  locationLabel: string;
  imageSrc: string | null;
  imageAlt: string | null;
};

export const getPopularNearYouListings = unstable_cache(
  queryPopularNearYouListings,
  ["homepage-popular-near-you"],
  {
    revalidate: HOMEPAGE_CACHE_SECONDS,
    tags: [HOMEPAGE_CACHE_TAG],
  },
);

export const getFeaturedBusinesses = unstable_cache(queryFeaturedBusinesses, ["homepage-featured-businesses"], {
  revalidate: HOMEPAGE_CACHE_SECONDS,
  tags: [HOMEPAGE_CACHE_TAG],
});

export const getCommunityNearYou = unstable_cache(queryCommunityNearYou, ["homepage-community-near-you"], {
  revalidate: HOMEPAGE_CACHE_SECONDS,
  tags: [HOMEPAGE_CACHE_TAG],
});

export async function queryPopularNearYouListings(): Promise<HomepageListingDTO[]> {
  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
      deletedAt: null,
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: 8,
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
      publicLocation: {
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
                },
              },
            },
          },
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          publicUrl: true,
          altText: true,
        },
      },
    },
  });

  return listings.map((listing) => ({
    id: listing.id,
    href: `/listings/${listing.slug}-${listing.id}`,
    title: listing.title,
    priceLabel: formatListingPrice(listing.priceAmount, listing.priceCurrency, listing.priceType),
    locationLabel: listing.publicLocation ? formatPublicLocationLabel(listing.publicLocation) : "Washington, DC",
    publishedLabel: `Listed ${formatDate(listing.publishedAt ?? listing.createdAt)}`,
    imageSrc: listing.images[0]?.publicUrl ?? null,
    imageAlt: listing.images[0]?.altText ?? null,
    isFeatured: listing.isFeatured,
  }));
}

export async function queryFeaturedBusinesses(): Promise<HomepageBusinessDTO[]> {
  const businesses = await prisma.business.findMany({
    where: {
      status: BusinessStatus.ACTIVE,
      deletedAt: null,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      coverImageUrl: true,
      category: { select: { name: true } },
      publicLocation: {
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
                },
              },
            },
          },
        },
      },
    },
  });

  return businesses.map((business) => ({
    id: business.id,
    href: `/businesses/${business.slug}-${business.id}`,
    name: business.name,
    categoryLabel: business.category.name,
    locationLabel: formatPublicLocationLabel(business.publicLocation),
    imageSrc: business.coverImageUrl ?? business.logoUrl,
    imageAlt: business.name,
  }));
}

export async function queryCommunityNearYou(): Promise<HomepageCommunityDTO[]> {
  const [events, posts] = await Promise.all([
    prisma.event.findMany({
      where: {
        status: EventStatus.ACTIVE,
        moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
        deletedAt: null,
      },
      orderBy: { startAt: "asc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        startAt: true,
        venueName: true,
        publicLocation: {
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
                  },
                },
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: {
            publicUrl: true,
            altText: true,
          },
        },
      },
    }),
    prisma.communityPost.findMany({
      where: {
        status: CommunityPostStatus.ACTIVE,
        moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        createdAt: true,
        publicLocation: {
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
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return [
    ...events.map((event) => ({
      id: event.id,
      href: `/events/${event.slug}-${event.id}`,
      eyebrow: "Event",
      title: event.title,
      detail: `${formatDate(event.startAt)}${event.venueName ? ` at ${event.venueName}` : ""}`,
      locationLabel: event.publicLocation ? formatPublicLocationLabel(event.publicLocation) : "Washington, DC",
      imageSrc: event.images[0]?.publicUrl ?? null,
      imageAlt: event.images[0]?.altText ?? null,
    })),
    ...posts.map((post) => ({
      id: post.id,
      href: "/community",
      eyebrow: formatCommunityType(post.type),
      title: post.title ?? post.body,
      detail: `Posted ${formatDate(post.createdAt)}`,
      locationLabel: post.publicLocation ? formatPublicLocationLabel(post.publicLocation) : "Washington, DC",
      imageSrc: null,
      imageAlt: null,
    })),
  ].slice(0, 4);
}

function formatListingPrice(amount: unknown, currency: string, priceType: PriceType) {
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

function formatCommunityType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
