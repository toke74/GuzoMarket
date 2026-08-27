import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

import { Alert } from "@/components/feedback/alert";
import { EmptyState } from "@/components/layout/empty-state";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Pagination } from "@/components/navigation/pagination";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  buildSearchHref,
  searchSortOptions,
  type SearchCriteria,
  type SearchFilterDefinitionDTO,
  type SearchResultDTO,
} from "@/server/marketplace/search";

type SearchDiscoveryPageProps = {
  result: SearchResultDTO;
  title?: string;
  description?: string;
  pathname?: string;
  categoryMode?: boolean;
};

export function SearchDiscoveryPage({
  result,
  title = "Search GuzoMarket",
  description = "Browse active local listings across the DMV.",
  pathname = "/search",
  categoryMode = false,
}: SearchDiscoveryPageProps) {
  const { criteria } = result;
  const nextHref = result.nextCursor ? buildSearchHref(criteria, { cursor: result.nextCursor }, pathname) : undefined;

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              ...(categoryMode ? [{ href: "/search", label: "Search" }] : []),
              { label: result.activeCategory?.name ?? "Search" },
            ]}
          />
          <div className="grid gap-2">
            <h1 className="font-display text-3xl font-bold text-navy md:text-4xl">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
            <p className="text-sm font-semibold text-brand-primary">Showing {result.activeLocationLabel}</p>
          </div>
          <SearchForm criteria={criteria} pathname={pathname} />
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 pb-24 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-5">
            <CategoryPanel result={result} pathname={pathname} />
            <FilterForm criteria={criteria} filters={result.filterDefinitions} pathname={pathname} />
          </div>
        </aside>

        <main className="grid min-w-0 gap-5">
          {categoryMode && result.activeCategory ? (
            <SubcategoryShortcuts result={result} pathname={pathname} />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {result.resultCount.toLocaleString()} {result.resultCount === 1 ? "result" : "results"}
              </p>
              <p className="text-xs text-text-secondary" data-analytics-event="search_performed">
                Deterministic results sorted by {searchSortOptions.find((option) => option.value === criteria.sort)?.label}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MobileFilterSheet result={result} pathname={pathname} />
              <SortForm criteria={criteria} pathname={pathname} />
            </div>
          </div>

          <SelectedFilterChips result={result} />

          {result.listings.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.listings.map((listing) => (
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
            <div className="grid gap-4" data-analytics-event="search_no_results">
              <EmptyState
                title="No results found."
                description="Try widening your location, changing filters, or searching for something else."
              />
              <div>
                <Button asChild>
                  <Link href={pathname}>Clear Filters</Link>
                </Button>
              </div>
            </div>
          )}

          <Pagination nextHref={nextHref} label="Search results pagination" />

          {categoryMode && result.activeCategory ? <SeoSupportingContent categoryName={result.activeCategory.name} /> : null}
        </main>
      </div>
    </div>
  );
}

export function SearchDiscoveryError() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Search" }]} />
      <Alert variant="error" title="Search is temporarily unavailable.">
        Refresh the page or try again in a moment.
      </Alert>
    </div>
  );
}

function SearchForm({ criteria, pathname }: { criteria: SearchCriteria; pathname: string }) {
  return (
    <form action={pathname} className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-[1fr_16rem_auto]">
      <input type="hidden" name="category" value={criteria.category} />
      <label className="relative block">
        <span className="sr-only">Search GuzoMarket</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
        <Input name="q" defaultValue={criteria.q} placeholder="What are you looking for?" className="pl-10" />
      </label>
      <label className="block">
        <span className="sr-only">Location</span>
        <Input name="location" defaultValue={criteria.location} placeholder="Washington, DC" />
      </label>
      <Button type="submit">Search</Button>
    </form>
  );
}

function SortForm({ criteria, pathname }: { criteria: SearchCriteria; pathname: string }) {
  return (
    <form action={pathname} className="w-44">
      {hiddenCriteriaFields(criteria, ["sort", "cursor"]).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label>
        <span className="sr-only">Sort results</span>
        <Select name="sort" defaultValue={criteria.sort} aria-label="Sort results">
          {searchSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
      <Button type="submit" variant="ghost" className="sr-only">
        Apply sort
      </Button>
    </form>
  );
}

function MobileFilterSheet({ result, pathname }: { result: SearchResultDTO; pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <CategoryPanel result={result} pathname={pathname} />
        <FilterForm criteria={result.criteria} filters={result.filterDefinitions} pathname={pathname} />
      </SheetContent>
    </Sheet>
  );
}

function CategoryPanel({ result, pathname }: { result: SearchResultDTO; pathname: string }) {
  return (
    <section aria-labelledby="category-filter-title" className="grid gap-3 rounded-lg border border-border bg-surface p-4">
      <h2 id="category-filter-title" className="flex items-center gap-2 font-semibold text-text-primary">
        <Filter className="h-4 w-4" aria-hidden="true" />
        Categories
      </h2>
      <div className="grid gap-1">
        <Link
          href={buildSearchHref(result.criteria, { category: "", attributes: {}, cursor: null }, pathname)}
          className="rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted"
        >
          All categories
        </Link>
        {result.categories.map((category) => (
          <div key={category.id} className="grid gap-1">
            <CategoryLink result={result} categorySlug={category.slug} label={category.name} pathname={pathname} />
            {category.children.map((child) => (
              <CategoryLink key={child.id} result={result} categorySlug={child.slug} label={child.name} pathname={pathname} child />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryLink({
  result,
  categorySlug,
  label,
  pathname,
  child = false,
}: {
  result: SearchResultDTO;
  categorySlug: string;
  label: string;
  pathname: string;
  child?: boolean;
}) {
  const active = result.activeCategory?.slug === categorySlug;
  const href = getCategoryNavigationHref(result, categorySlug, pathname);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted ${
        child ? "ml-4 text-text-secondary" : "text-text-primary"
      } ${active ? "bg-brand-light text-brand-primary" : ""}`}
    >
      {label}
    </Link>
  );
}

function SubcategoryShortcuts({ result, pathname }: { result: SearchResultDTO; pathname: string }) {
  const children = result.activeCategory?.children ?? [];
  if (!children.length) {
    return null;
  }

  return (
    <nav aria-label="Subcategories" className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
      <div className="grid auto-cols-[minmax(10rem,70vw)] grid-flow-col gap-3 overflow-x-auto pb-1 sm:auto-cols-fr sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-3">
        {children.map((category) => (
          <Link
            key={category.id}
            href={getCategoryNavigationHref(result, category.slug, pathname)}
            className="rounded-lg border border-border bg-surface p-4 text-sm font-semibold text-text-primary hover:border-brand-primary"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function getCategoryNavigationHref(result: SearchResultDTO, categorySlug: string, pathname: string) {
  const route = getCanonicalCategoryRoute(result, categorySlug);
  if (!route || pathname === "/search") {
    return buildSearchHref(result.criteria, { category: categorySlug, attributes: {}, cursor: null }, "/search");
  }

  return buildSearchHref(result.criteria, { category: categorySlug, attributes: {}, cursor: null }, route);
}

function getCanonicalCategoryRoute(result: SearchResultDTO, categorySlug: string) {
  for (const root of result.categories) {
    const baseRoute = rootRouteBySlug[root.slug];
    if (!baseRoute) {
      continue;
    }
    if (root.slug === categorySlug) {
      return baseRoute;
    }
    if (root.children.some((child) => child.slug === categorySlug)) {
      return `${baseRoute}/${categorySlug}`;
    }
  }

  return null;
}

const rootRouteBySlug: Record<string, string> = {
  "buy-sell": "/buy-sell",
  "cars-vehicles": "/cars",
  housing: "/housing",
};

function FilterForm({
  criteria,
  filters,
  pathname,
}: {
  criteria: SearchCriteria;
  filters: SearchFilterDefinitionDTO[];
  pathname: string;
}) {
  return (
    <form action={pathname} className="grid gap-4 rounded-lg border border-border bg-surface p-4">
      <h2 className="font-semibold text-text-primary">Filters</h2>
      {hiddenCriteriaFields(criteria, ["minPrice", "maxPrice", "cursor"]).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm font-medium text-text-primary">
          Min price
          <Input name="minPrice" inputMode="numeric" defaultValue={criteria.minPrice ?? ""} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-text-primary">
          Max price
          <Input name="maxPrice" inputMode="numeric" defaultValue={criteria.maxPrice ?? ""} />
        </label>
      </div>
      {filters.map((filter) => (
        <AttributeFilter key={filter.key} filter={filter} value={criteria.attributes[filter.key] ?? ""} />
      ))}
      <Button type="submit">Apply Filters</Button>
    </form>
  );
}

function AttributeFilter({ filter, value }: { filter: SearchFilterDefinitionDTO; value: string }) {
  if (filter.dataType === "BOOLEAN") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <input type="checkbox" name={`attr_${filter.key}`} value="true" defaultChecked={value === "true"} className="h-4 w-4" />
        {filter.label}
      </label>
    );
  }

  if (filter.options.length) {
    return (
      <label className="grid gap-1 text-sm font-medium text-text-primary">
        {filter.label}
        <Select name={`attr_${filter.key}`} defaultValue={value}>
          <option value="">Any</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
    );
  }

  return (
    <label className="grid gap-1 text-sm font-medium text-text-primary">
      {filter.label}
      <Input name={`attr_${filter.key}`} defaultValue={value} inputMode={filter.dataType === "INTEGER" ? "numeric" : "text"} />
    </label>
  );
}

function SelectedFilterChips({ result }: { result: SearchResultDTO }) {
  if (!result.selectedFilterChips.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Selected filters">
      {result.selectedFilterChips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-medium text-text-primary hover:border-brand-primary"
          data-analytics-event="search_filter_removed"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

function SeoSupportingContent({ categoryName }: { categoryName: string }) {
  return (
    <section className="border-t border-border pt-6 text-sm leading-6 text-text-secondary">
      <h2 className="font-display text-xl font-bold text-navy">{categoryName} in the DMV</h2>
      <p className="mt-2 max-w-3xl">
        Browse active {categoryName.toLowerCase()} listings from Washington, DC, Maryland, and Northern Virginia with
        shareable search filters and public location labels.
      </p>
    </section>
  );
}

function hiddenCriteriaFields(criteria: SearchCriteria, omit: string[]) {
  const entries: Array<[string, string]> = [];
  const push = (key: string, value: string | number | null) => {
    if (!omit.includes(key) && value !== null && value !== "") {
      entries.push([key, String(value)]);
    }
  };

  push("q", criteria.q);
  push("location", criteria.location);
  push("category", criteria.category);
  push("minPrice", criteria.minPrice);
  push("maxPrice", criteria.maxPrice);
  push("sort", criteria.sort === "recommended" ? "" : criteria.sort);
  push("limit", criteria.limit === 12 ? "" : criteria.limit);

  for (const [key, value] of Object.entries(criteria.attributes)) {
    if (!omit.includes(`attr_${key}`)) {
      push(`attr_${key}`, value);
    }
  }

  return entries;
}
