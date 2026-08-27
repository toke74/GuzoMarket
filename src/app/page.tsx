import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  Briefcase,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  ChevronRight,
  Coffee,
  HomeIcon,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  UserPlus,
  Users,
} from "lucide-react";

import { Alert } from "@/components/feedback/alert";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/server/auth/session";
import { CategoryDomainType } from "@/server/db/generated/prisma/client";
import {
  getCommunityNearYou,
  getFeaturedBusinesses,
  getPopularNearYouListings,
  type HomepageBusinessDTO,
  type HomepageCommunityDTO,
  type HomepageListingDTO,
} from "@/server/marketplace/homepage";
import { getActiveCategories } from "@/server/marketplace/categories";

export const metadata: Metadata = {
  title: "GuzoMarket | Buy. Sell. Connect in the DMV",
  description:
    "Search local listings, businesses, events, and community posts across Washington, DC, Maryland, and Northern Virginia.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GuzoMarket | Buy. Sell. Connect.",
    description: "A local marketplace for Washington, DC, Maryland, and Northern Virginia.",
    images: [{ url: "/homepage-dmv-hero.png", width: 1792, height: 1024, alt: "Washington, DC at golden hour" }],
  },
};

const popularSearches = ["Apartment", "Toyota Camry", "iPhone", "Office Chair", "Part-time Jobs"];

const categoryRouteBySlug: Record<string, string> = {
  "buy-sell": "/search",
  "cars-vehicles": "/cars",
  cars: "/cars",
  housing: "/housing",
  services: "/services",
  jobs: "/jobs",
  businesses: "/businesses",
  events: "/events",
  community: "/community",
};

const categoryIconByKey = {
  briefcase: Briefcase,
  "briefcase-business": BriefcaseBusiness,
  "calendar-days": CalendarDays,
  car: Car,
  "car-front": Car,
  coffee: Coffee,
  home: HomeIcon,
  "message-circle": MessageCircle,
  "messages-square": MessageCircle,
  "shopping-bag": ShoppingBag,
  store: Store,
  users: Users,
};

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection />
      <Container className="-mt-10 grid gap-8 pb-24 md:-mt-8 md:gap-10 md:pb-16">
        <PopularSearches />
        <Suspense fallback={<WelcomeSkeleton />}>
          <ContextualWelcome />
        </Suspense>
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryShortcutsSection />
        </Suspense>
        <Suspense fallback={<CardGridSkeleton title="Popular Near You" />}>
          <PopularNearYouSection />
        </Suspense>
        <TrustPrivacySection />
        <Suspense fallback={<CardGridSkeleton title="Featured Businesses" />}>
          <FeaturedBusinessesSection />
        </Suspense>
        <Suspense fallback={<CommunitySkeleton />}>
          <CommunityNearYouSection />
        </Suspense>
        <AccountValuePromotion />
      </Container>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate min-h-[460px] overflow-hidden bg-surface md:min-h-[520px]">
      <Image
        src="/homepage-dmv-hero.png"
        alt="Washington, DC monuments reflected across the Tidal Basin at golden hour"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-white via-white/82 to-white/10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
      <Container className="relative z-10 grid min-h-[460px] content-center gap-6 py-12 md:min-h-[520px] md:gap-8 md:py-20">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold leading-[1.08] text-navy sm:text-5xl md:text-6xl md:leading-tight">
            Buy. Sell. Connect.
            <span className="block">All in one place.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-text-primary md:mt-5 md:text-lg md:leading-8">
            The trusted marketplace for the Ethiopian and African community across the DMV.
          </p>
        </div>
        <form
          action="/search"
          className="grid max-w-3xl gap-3 rounded-xl border border-border bg-surface p-3 shadow-lg md:grid-cols-[1fr_16rem_auto]"
          aria-label="Search GuzoMarket"
        >
          <label className="relative block">
            <span className="sr-only">Search GuzoMarket</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
            <input
              name="q"
              placeholder="What are you looking for?"
              className="h-12 w-full rounded-md border border-transparent bg-surface px-10 text-sm text-text-primary outline-none transition focus:border-brand-primary"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Location</span>
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-primary" aria-hidden="true" />
            <input
              name="location"
              defaultValue="Washington, DC"
              className="h-12 w-full rounded-md border border-transparent bg-surface px-10 text-sm font-medium text-text-primary outline-none transition focus:border-brand-primary"
            />
          </label>
          <Button type="submit" size="lg" className="h-12">
            Search
          </Button>
        </form>
      </Container>
    </section>
  );
}

function PopularSearches() {
  return (
    <section aria-labelledby="popular-searches-title" className="relative z-20 flex flex-wrap items-center gap-3 text-sm">
      <h2 id="popular-searches-title" className="font-semibold text-text-primary">
        Popular searches:
      </h2>
      {popularSearches.map((term) => (
        <Link
          key={term}
          href={`/search?q=${encodeURIComponent(term)}&location=${encodeURIComponent("Washington, DC")}`}
          className="rounded-full bg-brand-light px-3 py-1.5 font-semibold text-brand-primary hover:bg-brand-primary hover:text-text-inverse"
        >
          {term}
        </Link>
      ))}
    </section>
  );
}

async function ContextualWelcome() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <section className="grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold text-brand-primary">Welcome back, {user.displayName}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-navy">Pick up where you left off.</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Check messages, review saved listings, manage your posts, or create a new listing for your local market.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/messages">Messages</Link>
          </Button>
          <Button asChild>
            <Link href="/post">Post Listing</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-sm font-semibold text-brand-primary">Welcome to GuzoMarket</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-navy">Join your local marketplace.</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Create an account to post listings, keep conversations in one place, and return to saved marketplace finds.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/auth/sign-up">Sign Up</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/log-in">Log In</Link>
        </Button>
      </div>
    </section>
  );
}

async function CategoryShortcutsSection() {
  const result = await loadPrimaryCategories();

  if (!result.ok) {
    return <Alert title="We couldn't load categories.">Try refreshing the page to load marketplace shortcuts.</Alert>;
  }

  return (
    <section aria-labelledby="category-shortcuts-title" className="rounded-xl border border-border bg-surface p-4 shadow-md">
      <h2 id="category-shortcuts-title" className="sr-only">
        Category shortcuts
      </h2>
      <div className="-mx-4 overflow-hidden px-4 md:mx-0 md:overflow-visible md:px-0">
        <div className="grid w-full auto-cols-[7.75rem] grid-flow-col gap-2 overflow-x-auto pb-1 sm:auto-cols-[8.5rem] md:grid-flow-row md:grid-cols-4 md:overflow-visible md:pb-0 xl:grid-cols-8">
          {result.categories.map((category) => {
            const Icon = category.iconKey
              ? (categoryIconByKey[category.iconKey as keyof typeof categoryIconByKey] ?? Store)
              : Store;
            const href = categoryRouteBySlug[category.slug] ?? `/search?category=${encodeURIComponent(category.slug)}`;

            return (
              <Link
                key={category.id}
                href={href}
                className="grid min-h-24 place-items-center gap-2 rounded-lg p-3 text-center hover:bg-brand-light focus-visible:bg-brand-light"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-text-primary">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function PopularNearYouSection() {
  const result = await loadPopularListings();

  if (!result.ok) {
    return <Alert title="We couldn't load nearby listings.">Check your connection and try again.</Alert>;
  }

  return (
    <section aria-labelledby="popular-near-you-title" className="grid gap-4">
      <SectionTitle id="popular-near-you-title" title="Popular Near You" href="/search" />
      {result.listings.length ? (
        <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="grid w-full auto-cols-[minmax(16rem,82vw)] grid-flow-col gap-4 overflow-x-auto pb-1 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 xl:grid-cols-5">
            {result.listings.map((listing) => (
              <HomepageListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <EmptyState
            title="No listings near Washington, DC yet."
            description="Be one of the first to post in the local marketplace."
          />
          <div>
            <Button asChild>
              <Link href="/post">Post Listing</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function HomepageListingCard({ listing }: { listing: HomepageListingDTO }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link href={listing.href} className="block focus-visible:outline-offset-[-3px]">
        <div className="relative aspect-[4/3] bg-surface-muted">
          {listing.imageSrc ? (
            <Image
              src={listing.imageSrc}
              alt={listing.imageAlt ?? listing.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-secondary">No image</div>
          )}
          {listing.isFeatured ? <Badge variant="accent" className="absolute left-3 top-3">Featured</Badge> : null}
        </div>
        <div className="grid gap-2 p-4">
          <p className="text-lg font-bold text-brand-primary">{listing.priceLabel}</p>
          <h3 className="line-clamp-2 text-base font-semibold text-text-primary">{listing.title}</h3>
          <p className="flex items-center gap-1 text-sm text-text-secondary">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {listing.locationLabel}
          </p>
          <p className="text-sm text-text-secondary">{listing.publishedLabel}</p>
        </div>
      </Link>
    </article>
  );
}

function TrustPrivacySection() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Verified & Safe",
      copy: "Clear account signals, reporting paths, and active moderation.",
    },
    {
      icon: Tag,
      title: "Local Deals",
      copy: "Browse nearby listings from DMV neighbors and businesses.",
    },
    {
      icon: MessageCircle,
      title: "Easy Messaging",
      copy: "Keep conversations in GuzoMarket as messaging comes online.",
    },
    {
      icon: LockKeyhole,
      title: "Privacy First",
      copy: "Public pages use approximate location labels, not private coordinates.",
    },
  ];

  return (
    <section aria-labelledby="trust-privacy-title" className="rounded-xl bg-brand-light p-5">
      <h2 id="trust-privacy-title" className="sr-only">
        Trust and privacy
      </h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-brand-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{item.copy}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

async function FeaturedBusinessesSection() {
  const result = await loadFeaturedBusinesses();

  if (!result.ok) {
    return <Alert title="We couldn't load featured businesses.">This section will recover when business data is available.</Alert>;
  }

  return (
    <section aria-labelledby="featured-businesses-title" className="grid gap-4">
      <SectionTitle id="featured-businesses-title" title="Featured Businesses" href="/businesses" />
      {result.businesses.length ? (
        <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="grid w-full auto-cols-[minmax(16rem,82vw)] grid-flow-col gap-4 overflow-x-auto pb-1 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 xl:grid-cols-5">
            {result.businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="Business profiles are coming online."
          description="Featured businesses will appear here once active public records are available."
        />
      )}
    </section>
  );
}

function BusinessCard({ business }: { business: HomepageBusinessDTO }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link href={business.href} className="block focus-visible:outline-offset-[-3px]">
        <div className="relative flex aspect-[16/7] items-center justify-center bg-navy p-5 text-center">
          {business.imageSrc ? (
            <Image src={business.imageSrc} alt={business.imageAlt ?? business.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
          ) : (
            <Store className="h-10 w-10 text-text-inverse" aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-navy/35" />
          <p className="relative font-display text-xl font-bold text-text-inverse">{business.name}</p>
        </div>
        <div className="grid gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-text-primary">{business.name}</h3>
            {business.isBusinessVerified ? <Badge>Business Verified</Badge> : null}
          </div>
          {business.ratingLabel ? <p className="text-sm text-text-secondary">{business.ratingLabel}</p> : null}
          <p className="text-sm text-text-secondary">{business.locationLabel}</p>
          <Badge variant="outline" className="w-fit">{business.categoryLabel}</Badge>
        </div>
      </Link>
    </article>
  );
}

async function CommunityNearYouSection() {
  const result = await loadCommunityItems();

  if (!result.ok) {
    return <Alert title="We couldn't load community updates.">Try refreshing this page in a moment.</Alert>;
  }

  return (
    <section aria-labelledby="community-near-you-title" className="grid gap-4">
      <SectionTitle id="community-near-you-title" title="Community Near You" href="/community" />
      {result.items.length ? (
        <div className="-mx-4 overflow-hidden px-4 md:mx-0 md:overflow-visible md:px-0">
          <div className="grid w-full auto-cols-[minmax(16rem,82vw)] grid-flow-col gap-4 overflow-x-auto pb-1 md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
            {result.items.map((item) => (
              <CommunityCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No community updates near Washington, DC yet."
          description="Events and community posts will appear here as active public records are added."
        />
      )}
    </section>
  );
}

function CommunityCard({ item }: { item: HomepageCommunityDTO }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={item.href} className="grid gap-3">
        <div className="flex items-start gap-3">
          {item.imageSrc ? (
            <span className="relative h-14 w-14 overflow-hidden rounded-lg bg-surface-muted">
              <Image src={item.imageSrc} alt={item.imageAlt ?? item.title} fill className="object-cover" sizes="56px" />
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div>
            <p className="text-xs font-semibold text-brand-primary">{item.eyebrow}</p>
            <h3 className="mt-1 line-clamp-2 font-semibold text-text-primary">{item.title}</h3>
          </div>
        </div>
        <p className="text-sm text-text-secondary">{item.detail}</p>
        <p className="flex items-center gap-1 text-sm text-text-secondary">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {item.locationLabel}
        </p>
      </Link>
    </article>
  );
}

function AccountValuePromotion() {
  return (
    <section className="overflow-hidden rounded-xl bg-brand-primary text-text-inverse shadow-md">
      <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-accent">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Your local account
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold">Save finds, post faster, and keep marketplace conversations organized.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/86">
            GuzoMarket accounts are built for local buying, selling, business discovery, and community updates without native app claims.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button variant="secondary" asChild>
            <Link href="/auth/sign-up">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create Account
            </Link>
          </Button>
          <Button variant="outline" className="border-white/40 bg-white/10 text-text-inverse hover:bg-white/20" asChild>
            <Link href="/post">Post Listing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="font-display text-2xl font-bold text-navy">
        {title}
      </h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
        View all
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function WelcomeSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-3 h-7 w-72 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-md">
      <div className="-mx-4 overflow-hidden px-4 md:mx-0 md:overflow-visible md:px-0">
        <div className="grid w-full auto-cols-[7.75rem] grid-flow-col gap-2 overflow-x-auto pb-1 sm:auto-cols-[8.5rem] md:grid-flow-row md:grid-cols-4 md:overflow-visible md:pb-0 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardGridSkeleton({ title }: { title: string }) {
  return (
    <section className="grid gap-4" aria-label={`${title} loading`}>
      <SectionTitle id={`${title.toLowerCase().replaceAll(" ", "-")}-loading`} title={title} href="/search" />
      <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="grid w-full auto-cols-[minmax(16rem,82vw)] grid-flow-col gap-4 overflow-x-auto pb-1 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunitySkeleton() {
  return (
    <section className="grid gap-4" aria-label="Community Near You loading">
      <SectionTitle id="community-loading" title="Community Near You" href="/community" />
      <div className="-mx-4 overflow-hidden px-4 md:mx-0 md:overflow-visible md:px-0">
        <div className="grid w-full auto-cols-[minmax(16rem,82vw)] grid-flow-col gap-4 overflow-x-auto pb-1 md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

async function loadPrimaryCategories() {
  try {
    const categories = await getActiveCategories();
    const primaryCategories = categories
      .filter((category) => !category.parentId)
      .filter((category) =>
        [
          CategoryDomainType.LISTING,
          CategoryDomainType.JOB,
          CategoryDomainType.SERVICE,
          CategoryDomainType.BUSINESS,
          CategoryDomainType.EVENT,
          CategoryDomainType.COMMUNITY,
        ].includes(category.domainType),
      )
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder)
      .slice(0, 8);

    return { ok: true as const, categories: primaryCategories };
  } catch {
    return { ok: false as const };
  }
}

async function loadPopularListings() {
  try {
    return { ok: true as const, listings: await getPopularNearYouListings() };
  } catch {
    return { ok: false as const };
  }
}

async function loadFeaturedBusinesses() {
  try {
    return { ok: true as const, businesses: await getFeaturedBusinesses() };
  } catch {
    return { ok: false as const };
  }
}

async function loadCommunityItems() {
  try {
    return { ok: true as const, items: await getCommunityNearYou() };
  } catch {
    return { ok: false as const };
  }
}
