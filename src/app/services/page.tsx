import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services in the DMV | GuzoMarket",
  description: "Discover local DMV services as GuzoMarket service search comes online.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Services" }]} />
      <section className="grid gap-3">
        <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">Services</h1>
        <p className="max-w-3xl text-sm leading-6 text-text-secondary">
          Service discovery is reserved for the services implementation stage. Search active marketplace listings now.
        </p>
      </section>
      <EmptyState title="Service search is not active yet." description="The deterministic listing search is available now." />
      <div>
        <Button asChild>
          <Link href="/search">Search Listings</Link>
        </Button>
      </div>
    </div>
  );
}
