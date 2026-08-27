import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Jobs in the DMV | GuzoMarket",
  description: "Discover DMV job posts as GuzoMarket jobs search comes online.",
  alternates: { canonical: "/jobs" },
};

export default function JobsPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Jobs" }]} />
      <section className="grid gap-3">
        <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">Jobs</h1>
        <p className="max-w-3xl text-sm leading-6 text-text-secondary">
          Job discovery is reserved for the jobs implementation stage. Search active marketplace listings now.
        </p>
      </section>
      <EmptyState title="Job search is not active yet." description="The deterministic listing search is available now." />
      <div>
        <Button asChild>
          <Link href="/search">Search Listings</Link>
        </Button>
      </div>
    </div>
  );
}
