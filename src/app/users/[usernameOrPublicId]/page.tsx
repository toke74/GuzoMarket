import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPublicSellerProfile } from "@/server/marketplace/listing-detail";

type SellerProfilePageProps = {
  params: Promise<{ usernameOrPublicId: string }>;
};

export async function generateMetadata({ params }: SellerProfilePageProps): Promise<Metadata> {
  const { usernameOrPublicId } = await params;
  const profile = await getPublicSellerProfile(usernameOrPublicId);

  if (!profile) {
    return {
      title: "Seller unavailable | GuzoMarket",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${profile.displayName} | GuzoMarket seller`,
    description: `Public GuzoMarket seller profile in ${profile.locationLabel}.`,
    alternates: { canonical: profile.href },
  };
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { usernameOrPublicId } = await params;
  const profile = await getPublicSellerProfile(usernameOrPublicId);

  if (!profile) {
    return (
      <Container className="grid gap-5 py-10">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Seller" }]} />
        <EmptyState
          title="This seller profile is unavailable."
          description="The profile may be private or no longer active."
        />
      </Container>
    );
  }

  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-background">
      <Container className="grid gap-6 py-6 lg:py-8">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/search", label: "Search" }, { label: profile.displayName }]} />

        <section className="grid gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm md:grid-cols-[auto_1fr] md:p-6">
          <Avatar className="h-24 w-24">
            {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid gap-3">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-navy">{profile.displayName}</h1>
              <p className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-text-secondary">
                <MapPin className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                <span className="min-w-0 break-words">{profile.locationLabel}</span>
                <span aria-hidden="true">/</span>
                <span className="min-w-0 break-words">{profile.joinedLabel}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.verificationLabels.length ? (
                profile.verificationLabels.map((label) => (
                  <Badge key={label} variant="outline" className="gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">No public verification signals yet</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-text-secondary">
              {profile.responseRateLabel ? <span>{profile.responseRateLabel}</span> : null}
              {profile.responseTimeLabel ? <span>{profile.responseTimeLabel}</span> : null}
            </div>
            {profile.bio ? <p className="max-w-3xl text-sm leading-7 text-text-primary">{profile.bio}</p> : null}
          </div>
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-navy">Active Listings</h2>
            <Link href="/search" className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
              Browse all
            </Link>
          </div>
          {profile.activeListings.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profile.activeListings.map((listing) => (
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
          ) : (
            <EmptyState title="No active listings." description="This seller does not have public active listings right now." />
          )}
        </section>
      </Container>
    </div>
  );
}
