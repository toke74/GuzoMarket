import Image from "next/image";
import Link from "next/link";
import { Edit3, Eye, FilePenLine } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type AccountListingsDTO } from "@/server/account/service";
import { ListingLifecycleControls } from "@/features/account/listing-lifecycle-controls";

const tabDescriptions: Record<AccountListingsDTO["selectedTab"], string> = {
  active: "Live listings visible to buyers.",
  pending: "Listings waiting on review or moderation follow-up.",
  drafts: "Unpublished listing drafts from the posting flow.",
  completed: "Sold, rented, or filled listings.",
  expired: "Listings that reached their expiration date.",
  archived: "Owner-archived or softly deleted records.",
};

export function MyListings({ data }: { data: AccountListingsDTO }) {
  return (
    <section className="grid gap-5 rounded-lg border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">My Listings</h1>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{tabDescriptions[data.selectedTab]}</p>
      </div>

      <div role="tablist" aria-label="Listing lifecycle tabs" className="flex gap-2 overflow-x-auto pb-1">
        {data.tabs.map((tab) => (
          <Link
            key={tab.key}
            role="tab"
            aria-selected={tab.key === data.selectedTab}
            href={`/account/listings?tab=${tab.key}`}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
              tab.key === data.selectedTab
                ? "border-brand-primary bg-brand-light text-brand-primary"
                : "border-border bg-background text-text-primary hover:bg-surface-muted"
            }`}
          >
            {tab.label}
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-secondary">{tab.count}</span>
          </Link>
        ))}
      </div>

      {data.listings.length ? (
        <div className="grid gap-3">
          {data.listings.map((listing) => (
            <article key={listing.id} className="grid gap-4 rounded-md border border-border bg-background p-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-muted">
                {listing.imageSrc ? (
                  <Image src={listing.imageSrc} alt={listing.imageAlt ?? ""} fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold text-text-secondary">
                    No image
                  </div>
                )}
              </div>
              <div className="grid min-w-0 gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words font-display text-xl font-bold text-navy">{listing.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-brand-primary">{listing.priceLabel}</p>
                  </div>
                  <Badge variant={listing.statusTone}>{listing.statusLabel}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-secondary">
                  <span>{listing.categoryGroupLabel} / {listing.categoryLabel}</span>
                  <span>{listing.locationLabel}</span>
                  <span>{listing.updatedLabel}</span>
                  {listing.publishedLabel ? <span>{listing.publishedLabel}</span> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.actions.includes("view") ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={listing.publicHref}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                  ) : null}
                  {listing.actions.includes("edit") ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={listing.editHref}>
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Link>
                    </Button>
                  ) : null}
                  {listing.actions.includes("continue-draft") ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={listing.draftHref}>
                        <FilePenLine className="h-4 w-4" aria-hidden="true" />
                        Continue Draft
                      </Link>
                    </Button>
                  ) : null}
                  <ListingLifecycleControls listingId={listing.id} listingTitle={listing.title} actions={listing.actions} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={`No ${data.selectedTab} listings.`} description="Listings matching this lifecycle state will appear here." />
      )}
    </section>
  );
}
