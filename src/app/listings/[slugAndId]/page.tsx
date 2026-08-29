import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Flag, MapPin, MessageCircle, Pencil, Share2, ShieldCheck, Star } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBaseUrl } from "@/lib/config/base-url";
import { getCurrentUser } from "@/server/auth/session";
import { getPublicListingDetail, type ListingSummaryDTO } from "@/server/marketplace/listing-detail";

type ListingPageProps = {
  params: Promise<{ slugAndId: string }>;
};

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slugAndId } = await params;
  const listing = await getPublicListingDetail(slugAndId);

  if (!listing) {
    return {
      title: "Listing unavailable | GuzoMarket",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${listing.title} | GuzoMarket`,
    description: `${listing.priceLabel} in ${listing.locationLabel}. ${listing.description.slice(0, 140)}`,
    alternates: { canonical: listing.href },
    robots: listing.publicState === "active" ? undefined : { index: false, follow: true },
    openGraph: {
      title: listing.title,
      description: `${listing.priceLabel} in ${listing.locationLabel}`,
      images: listing.images[0] ? [{ url: listing.images[0].src, alt: listing.images[0].alt }] : undefined,
    },
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slugAndId } = await params;
  const currentUser = await getCurrentUser();
  const listing = await getPublicListingDetail(slugAndId, currentUser?.id);

  if (!listing) {
    return (
      <Container className="grid gap-5 py-10">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/search", label: "Search" }, { label: "Listing" }]} />
        <EmptyState
          title="This listing is unavailable."
          description="It may have ended, moved, or no longer be public. Browse current listings to find similar local options."
        />
        <div>
          <Button asChild>
            <Link href="/search">Browse Listings</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-background pb-24 md:pb-0" data-analytics-event="listing_viewed">
      <Container className="grid gap-6 py-6 lg:py-8">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/search", label: "Search" },
            { href: `/search?category=${listing.categorySlug}`, label: listing.parentCategoryLabel ?? listing.categoryLabel },
            { label: listing.title },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_28rem]">
          <main className="grid min-w-0 gap-6">
            <ImageGallery listing={listing} />
            <div className="grid min-w-0 gap-4 lg:hidden">
              <ListingSummary listing={listing} />
              <SellerCard listing={listing} />
              <SafetyNote />
            </div>
            <ListingBody listing={listing} />
            <ListingCardGrid title="Seller's Other Listings" listings={listing.sellerOtherListings} />
            <ListingCardGrid title="Similar Listings" listings={listing.similarListings} eventName="similar_listing_clicked" />
          </main>

          <aside className="hidden gap-4 lg:sticky lg:top-20 lg:grid xl:top-24">
            <ListingSummary listing={listing} />
            <SellerCard listing={listing} />
            <SafetyNote />
          </aside>
        </div>
      </Container>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface/96 p-3 shadow-xl backdrop-blur md:hidden">
        {listing.contactEnabled ? (
          <Button className="w-full" disabled data-analytics-event="message_started">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Message Seller
          </Button>
        ) : (
          <Button className="w-full" disabled>
            {listing.isOwner ? "You own this listing" : `${listing.statusLabel} listing`}
          </Button>
        )}
      </div>
      {listing.publicState === "active" ? <ListingStructuredData listing={listing} /> : null}
    </div>
  );
}

function ImageGallery({ listing }: { listing: ListingSummaryDTO }) {
  const [primary, ...rest] = listing.images;

  return (
    <section aria-label="Listing photos" className="grid min-w-0 gap-3" data-analytics-event="listing_gallery_interacted">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-surface-muted md:aspect-[16/10]">
        {primary ? (
          <Image src={primary.src} alt={primary.alt} fill priority className="object-cover" sizes="(min-width: 1024px) 62vw, 100vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-text-secondary">No image available</div>
        )}
        {listing.publicState !== "active" ? (
          <Badge className="absolute left-3 top-3" variant="outline">
            {listing.statusLabel}
          </Badge>
        ) : null}
      </div>
      {rest.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {rest.slice(0, 4).map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-muted">
              <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="10rem" />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ListingSummary({ listing }: { listing: ListingSummaryDTO }) {
  const shareHref = `mailto:?subject=${encodeURIComponent(listing.title)}&body=${encodeURIComponent(new URL(listing.href, getBaseUrl()).toString())}`;

  return (
    <section className="grid min-w-0 gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={listing.publicState === "active" ? "accent" : "outline"}>{listing.statusLabel}</Badge>
          <Badge variant="outline">{listing.categoryLabel}</Badge>
        </div>
        <p className="text-3xl font-extrabold text-brand-primary">{listing.priceLabel}</p>
        <h1 className="font-display text-3xl font-extrabold leading-tight text-navy">{listing.title}</h1>
        <p className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-text-secondary">
          <MapPin className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          <span className="min-w-0 break-words">{listing.locationLabel}</span>
          <span aria-hidden="true">/</span>
          <span className="min-w-0 break-words">{listing.postedLabel}</span>
        </p>
      </div>

      <div className="grid gap-2">
        {listing.contactEnabled ? (
          <Button disabled data-analytics-event="message_started">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Message Seller
          </Button>
        ) : (
          <Button disabled>{listing.isOwner ? "You own this listing" : `${listing.statusLabel} listing`}</Button>
        )}
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <Button variant="outline" disabled className="min-w-0 px-3">
            <Star className="h-4 w-4" aria-hidden="true" />
            Save
          </Button>
          <Button variant="outline" asChild className="min-w-0 px-3" data-analytics-event="listing_shared">
            <a href={shareHref}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </a>
          </Button>
        </div>
        {listing.isOwner ? (
          <Button variant="secondary" asChild>
            <Link href={listing.managementHref}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Manage Listing
            </Link>
          </Button>
        ) : null}
      </div>

      <Button variant="ghost" disabled className="justify-start px-0" data-analytics-event="report_started">
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report listing
      </Button>
    </section>
  );
}

function ListingBody({ listing }: { listing: ListingSummaryDTO }) {
  return (
    <div className="grid gap-5">
      <section className="grid min-w-0 gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-navy">Description</h2>
        <p className="whitespace-pre-line break-words text-sm leading-7 text-text-primary">{listing.description}</p>
      </section>
      <section className="grid min-w-0 gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-navy">Details</h2>
        {listing.attributes.length ? (
          <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
            {listing.attributes.map((attribute) => (
              <div key={attribute.key} className="min-w-0 rounded-md bg-background p-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-text-secondary">{attribute.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-text-primary">{attribute.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-text-secondary">No additional details were provided.</p>
        )}
      </section>
      <section className="grid min-w-0 gap-2 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-navy">Location</h2>
        <p className="text-sm leading-6 text-text-secondary">
          Approximate public location: <span className="font-semibold text-text-primary">{listing.locationLabel}</span>
        </p>
      </section>
    </div>
  );
}

function SellerCard({ listing }: { listing: ListingSummaryDTO }) {
  const initials = listing.seller.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="grid min-w-0 gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-14 w-14">
          {listing.seller.avatarUrl ? <AvatarImage src={listing.seller.avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <Link
            href={listing.seller.href}
            className="font-display text-xl font-bold text-navy hover:text-brand-primary"
            data-analytics-event="seller_profile_clicked"
          >
            {listing.seller.displayName}
          </Link>
          <p className="text-sm text-text-secondary">{listing.seller.locationLabel}</p>
          <p className="text-sm text-text-secondary">{listing.seller.joinedLabel}</p>
        </div>
      </div>
      <Button variant="outline" asChild className="min-w-0">
        <Link href={listing.seller.href} data-analytics-event="seller_profile_clicked">
          View public profile
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <VerificationList labels={listing.seller.verificationLabels} />
      <div className="grid gap-1 text-sm text-text-secondary">
        {listing.seller.responseRateLabel ? <p>{listing.seller.responseRateLabel}</p> : null}
        {listing.seller.responseTimeLabel ? <p>{listing.seller.responseTimeLabel}</p> : null}
      </div>
    </section>
  );
}

function VerificationList({ labels }: { labels: string[] }) {
  if (!labels.length) {
    return <p className="text-sm text-text-secondary">No public verification signals yet.</p>;
  }

  return (
    <ul className="grid gap-2">
      {labels.map((label) => (
        <li key={label} className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <ShieldCheck className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

function SafetyNote() {
  return (
    <section className="min-w-0 break-words rounded-lg border border-emerald-100 bg-brand-light p-4 text-sm leading-6 text-text-primary">
      Meet in a public place, avoid pressure tactics, and keep conversation records clear.
    </section>
  );
}

function ListingCardGrid({
  title,
  listings,
  eventName,
}: {
  title: string;
  listings: ListingSummaryDTO["similarListings"];
  eventName?: string;
}) {
  if (!listings.length) {
    return null;
  }

  return (
    <section className="grid min-w-0 gap-3" data-analytics-event={eventName}>
      <h2 className="font-display text-2xl font-bold text-navy">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            href={listing.href}
            title={listing.title}
            price={listing.priceLabel}
            locationLabel={listing.locationLabel}
            postedLabel={listing.postedLabel}
            imageSrc={listing.imageSrc ?? undefined}
            imageAlt={listing.imageAlt ?? undefined}
            featured={listing.featured}
          />
        ))}
      </div>
    </section>
  );
}

function ListingStructuredData({ listing }: { listing: ListingSummaryDTO }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images.map((image) => new URL(image.src, getBaseUrl()).toString()),
    category: listing.categoryLabel,
    offers: {
      "@type": "Offer",
      price: listing.priceLabel.replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: new URL(listing.href, getBaseUrl()).toString(),
      areaServed: listing.locationLabel,
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
