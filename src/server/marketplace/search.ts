import { formatDate } from "@/lib/formatting/date";
import { prisma } from "@/server/db/client";
import {
  AttributeDataType,
  CategoryDomainType,
  ListingStatus,
  ModerationState,
  PriceType,
  Prisma,
} from "@/server/db/generated/prisma/client";
import { formatPublicLocationLabel } from "@/server/marketplace/locations";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;
const MAX_QUERY_LENGTH = 80;
const MAX_FILTER_VALUE_LENGTH = 64;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export const searchSortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type SearchSort = (typeof searchSortOptions)[number]["value"];

export type SearchCriteria = {
  q: string;
  location: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: SearchSort;
  cursor: string | null;
  limit: number;
  attributes: Record<string, string>;
};

export type SearchFilterOptionDTO = {
  value: string;
  label: string;
};

export type SearchFilterDefinitionDTO = {
  key: string;
  label: string;
  dataType: AttributeDataType;
  unit: string | null;
  options: SearchFilterOptionDTO[];
};

export type SearchCategoryDTO = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  domainType: CategoryDomainType;
  children: SearchCategoryDTO[];
};

export type SearchListingDTO = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  postedLabel: string;
  imageSrc: string | null;
  imageAlt: string | null;
  featured: boolean;
  categoryLabel: string;
};

export type SelectedFilterChipDTO = {
  key: string;
  label: string;
  href: string;
};

export type SearchResultDTO = {
  criteria: SearchCriteria;
  listings: SearchListingDTO[];
  resultCount: number;
  nextCursor: string | null;
  categories: SearchCategoryDTO[];
  activeCategory: SearchCategoryDTO | null;
  activeLocationLabel: string;
  filterDefinitions: SearchFilterDefinitionDTO[];
  selectedFilterChips: SelectedFilterChipDTO[];
};

type RawSearchParams = Record<string, string | string[] | undefined>;

type CategoryRow = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  domainType: CategoryDomainType;
  children: CategoryRow[];
};

const publicListingWhere = {
  status: ListingStatus.ACTIVE,
  moderationState: { in: [ModerationState.AUTO_CLEARED, ModerationState.APPROVED] },
  deletedAt: null,
} satisfies Prisma.ListingWhereInput;

export function parseSearchCriteria(searchParams: RawSearchParams, overrides: Partial<SearchCriteria> = {}): SearchCriteria {
  const q = cleanText(firstParam(searchParams.q), MAX_QUERY_LENGTH);
  const location = cleanText(firstParam(searchParams.location), MAX_FILTER_VALUE_LENGTH);
  const category = cleanSlug(firstParam(searchParams.category));
  const minPrice = parseMoney(firstParam(searchParams.minPrice));
  const maxPrice = parseMoney(firstParam(searchParams.maxPrice));
  const sort = parseSort(firstParam(searchParams.sort));
  const cursor = cleanCursor(firstParam(searchParams.cursor));
  const limit = clampLimit(firstParam(searchParams.limit));
  const attributes = parseAttributeParams(searchParams);

  return {
    q,
    location,
    category,
    minPrice,
    maxPrice,
    sort,
    cursor,
    limit,
    attributes,
    ...overrides,
  };
}

export async function searchMarketplaceListings(criteria: SearchCriteria): Promise<SearchResultDTO> {
  const [categoryRows, locationRows] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, domainType: CategoryDomainType.LISTING },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        description: true,
        domainType: true,
      },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      select: {
        id: true,
        parentId: true,
        slug: true,
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
    }),
  ]);

  const categoryTree = buildSearchCategoryTree(categoryRows);
  const activeCategory = findCategory(categoryTree, criteria.category);
  const categoryIds = activeCategory ? collectCategoryIds(activeCategory) : [];
  const activeLocation = findLocation(locationRows, criteria.location);
  const locationIds = activeLocation ? collectLocationIds(locationRows, activeLocation.id) : [];
  const filterDefinitions = activeCategory ? await getFilterDefinitions(categoryIds) : [];
  const validAttributeFilters = keepValidAttributeFilters(criteria.attributes, filterDefinitions);
  const where = buildListingWhere(criteria, categoryIds, locationIds, validAttributeFilters, filterDefinitions);
  const orderBy = getListingOrder(criteria.sort);

  const [resultCount, rows] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy,
      ...(criteria.cursor ? { cursor: { id: criteria.cursor }, skip: 1 } : {}),
      take: criteria.limit + 1,
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
                    parent: { select: { name: true, type: true, regionCode: true } },
                  },
                },
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { publicUrl: true, altText: true },
        },
      },
    }),
  ]);

  const pageRows = rows.slice(0, criteria.limit);
  const nextCursor = rows.length > criteria.limit ? pageRows.at(-1)?.id ?? null : null;
  const normalizedCriteria = { ...criteria, attributes: validAttributeFilters };

  return {
    criteria: normalizedCriteria,
    listings: pageRows.map((listing) => ({
      id: listing.id,
      href: `/listings/${listing.slug}-${listing.id}`,
      title: listing.title,
      priceLabel: formatListingPrice(listing.priceAmount, listing.priceCurrency, listing.priceType),
      locationLabel: listing.publicLocation ? formatPublicLocationLabel(listing.publicLocation) : "DMV",
      postedLabel: `Listed ${formatDate(listing.publishedAt ?? listing.createdAt)}`,
      imageSrc: listing.images[0]?.publicUrl ?? null,
      imageAlt: listing.images[0]?.altText ?? null,
      featured: listing.isFeatured,
      categoryLabel: listing.category.name,
    })),
    resultCount,
    nextCursor,
    categories: categoryTree,
    activeCategory,
    activeLocationLabel: activeLocation ? formatPublicLocationLabel(activeLocation) : criteria.location || "All DMV",
    filterDefinitions,
    selectedFilterChips: buildSelectedFilterChips(normalizedCriteria, activeCategory, activeLocation, filterDefinitions),
  };
}

export function buildSearchHref(criteria: SearchCriteria, changes: Partial<SearchCriteria>, pathname = "/search") {
  const next = { ...criteria, ...changes };
  const params = new URLSearchParams();

  setParam(params, "q", next.q);
  setParam(params, "location", next.location);
  setParam(params, "category", next.category);
  setParam(params, "minPrice", next.minPrice?.toString() ?? "");
  setParam(params, "maxPrice", next.maxPrice?.toString() ?? "");
  if (next.sort !== "recommended") {
    setParam(params, "sort", next.sort);
  }
  setParam(params, "cursor", next.cursor ?? "");
  if (next.limit !== DEFAULT_LIMIT) {
    setParam(params, "limit", next.limit.toString());
  }
  for (const [key, value] of Object.entries(next.attributes)) {
    setParam(params, `attr_${key}`, value);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildListingWhere(
  criteria: SearchCriteria,
  categoryIds: string[],
  locationIds: string[],
  attributeFilters: Record<string, string>,
  definitions: SearchFilterDefinitionDTO[],
): Prisma.ListingWhereInput {
  const and: Prisma.ListingWhereInput[] = [];
  const q = criteria.q.trim();

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { condition: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
        {
          attributeValues: {
            some: {
              attributeDefinition: { isSearchable: true },
              OR: [
                { textValue: { contains: q, mode: "insensitive" } },
                { optionValue: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  if (categoryIds.length) {
    and.push({ categoryId: { in: categoryIds } });
  }

  if (locationIds.length) {
    and.push({ publicLocationId: { in: locationIds } });
  }

  if (criteria.minPrice != null) {
    and.push({ priceAmount: { gte: criteria.minPrice } });
  }

  if (criteria.maxPrice != null) {
    and.push({ priceAmount: { lte: criteria.maxPrice } });
  }

  for (const [key, value] of Object.entries(attributeFilters)) {
    const definition = definitions.find((item) => item.key === key);
    if (!definition) {
      continue;
    }
    and.push({ attributeValues: { some: buildAttributeWhere(definition, value) } });
  }

  return and.length ? { ...publicListingWhere, AND: and } : publicListingWhere;
}

function buildAttributeWhere(definition: SearchFilterDefinitionDTO, value: string): Prisma.ListingAttributeValueWhereInput {
  const base = { attributeDefinition: { key: definition.key, isFilterable: true } };

  if (definition.dataType === AttributeDataType.BOOLEAN) {
    return { ...base, booleanValue: value === "true" };
  }
  if (definition.dataType === AttributeDataType.INTEGER) {
    return { ...base, integerValue: Number(value) };
  }
  if (definition.dataType === AttributeDataType.DECIMAL) {
    return { ...base, decimalValue: Number(value) };
  }
  if (definition.dataType === AttributeDataType.ENUM) {
    return { ...base, optionValue: value };
  }

  return { ...base, textValue: { contains: value, mode: "insensitive" } };
}

function getListingOrder(sort: SearchSort): Prisma.ListingOrderByWithRelationInput[] {
  if (sort === "price_asc") {
    return [{ priceAmount: "asc" }, { publishedAt: "desc" }, { id: "desc" }];
  }
  if (sort === "price_desc") {
    return [{ priceAmount: "desc" }, { publishedAt: "desc" }, { id: "desc" }];
  }
  if (sort === "newest") {
    return [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }

  return [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }];
}

async function getFilterDefinitions(categoryIds: string[]): Promise<SearchFilterDefinitionDTO[]> {
  if (!categoryIds.length) {
    return [];
  }

  const definitions = await prisma.categoryAttributeDefinition.findMany({
    where: { categoryId: { in: categoryIds }, isFilterable: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      key: true,
      label: true,
      dataType: true,
      unit: true,
      options: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        select: { value: true, label: true },
      },
    },
  });

  const unique = new Map<string, SearchFilterDefinitionDTO>();
  for (const definition of definitions) {
    if (!unique.has(definition.key)) {
      unique.set(definition.key, definition);
    }
  }

  return [...unique.values()];
}

function keepValidAttributeFilters(
  attributes: Record<string, string>,
  definitions: SearchFilterDefinitionDTO[],
): Record<string, string> {
  const valid: Record<string, string> = {};

  for (const [key, value] of Object.entries(attributes)) {
    const definition = definitions.find((item) => item.key === key);
    if (!definition || !isValidAttributeValue(definition, value)) {
      continue;
    }
    valid[key] = value;
  }

  return valid;
}

function isValidAttributeValue(definition: SearchFilterDefinitionDTO, value: string) {
  if (!value || value.length > MAX_FILTER_VALUE_LENGTH) {
    return false;
  }
  if (definition.dataType === AttributeDataType.BOOLEAN) {
    return value === "true" || value === "false";
  }
  if (definition.dataType === AttributeDataType.INTEGER || definition.dataType === AttributeDataType.DECIMAL) {
    return Number.isFinite(Number(value));
  }
  if (definition.dataType === AttributeDataType.ENUM) {
    return definition.options.some((option) => option.value === value);
  }

  return true;
}

function buildSearchCategoryTree(categories: Omit<CategoryRow, "children">[]): SearchCategoryDTO[] {
  const nodes = new Map<string, SearchCategoryDTO>();
  const roots: SearchCategoryDTO[] = [];

  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) {
      continue;
    }
    if (category.parentId) {
      nodes.get(category.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function findCategory(categories: SearchCategoryDTO[], slugOrId: string): SearchCategoryDTO | null {
  for (const category of categories) {
    if (category.slug === slugOrId || category.id === slugOrId) {
      return category;
    }
    const child = findCategory(category.children, slugOrId);
    if (child) {
      return child;
    }
  }
  return null;
}

function collectCategoryIds(category: SearchCategoryDTO): string[] {
  return [category.id, ...category.children.flatMap(collectCategoryIds)];
}

function findLocation<T extends { id: string; slug: string; name: string }>(locations: T[], value: string): T | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return (
    locations.find(
      (location) =>
        location.id === value ||
        location.slug === normalized ||
        location.name.toLowerCase() === normalized ||
        formatPublicLocationLabel(location as never).toLowerCase() === normalized,
    ) ?? null
  );
}

function collectLocationIds<T extends { id: string; parentId: string | null }>(locations: T[], rootId: string) {
  const ids = new Set([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const location of locations) {
      if (location.parentId && ids.has(location.parentId) && !ids.has(location.id)) {
        ids.add(location.id);
        changed = true;
      }
    }
  }

  return [...ids];
}

function buildSelectedFilterChips(
  criteria: SearchCriteria,
  activeCategory: SearchCategoryDTO | null,
  activeLocation: { slug: string; name: string } | null,
  definitions: SearchFilterDefinitionDTO[],
) {
  const chips: SelectedFilterChipDTO[] = [];

  if (criteria.q) {
    chips.push({ key: "q", label: `Search: ${criteria.q}`, href: buildSearchHref(criteria, { q: "", cursor: null }) });
  }
  if (activeLocation) {
    chips.push({
      key: "location",
      label: `Location: ${activeLocation.name}`,
      href: buildSearchHref(criteria, { location: "", cursor: null }),
    });
  }
  if (activeCategory) {
    chips.push({
      key: "category",
      label: `Category: ${activeCategory.name}`,
      href: buildSearchHref(criteria, { category: "", attributes: {}, cursor: null }),
    });
  }
  if (criteria.minPrice != null) {
    chips.push({
      key: "minPrice",
      label: `Min: ${formatMoney(criteria.minPrice)}`,
      href: buildSearchHref(criteria, { minPrice: null, cursor: null }),
    });
  }
  if (criteria.maxPrice != null) {
    chips.push({
      key: "maxPrice",
      label: `Max: ${formatMoney(criteria.maxPrice)}`,
      href: buildSearchHref(criteria, { maxPrice: null, cursor: null }),
    });
  }
  for (const [key, value] of Object.entries(criteria.attributes)) {
    const definition = definitions.find((item) => item.key === key);
    const option = definition?.options.find((item) => item.value === value);
    const attributes = { ...criteria.attributes };
    delete attributes[key];
    chips.push({
      key: `attr_${key}`,
      label: `${definition?.label ?? key}: ${option?.label ?? value}`,
      href: buildSearchHref(criteria, { attributes, cursor: null }),
    });
  }

  return chips;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanText(value: string | undefined, maxLength: number) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanSlug(value: string | undefined) {
  const cleaned = cleanText(value, MAX_FILTER_VALUE_LENGTH).toLowerCase();
  return uuidPattern.test(cleaned) ? cleaned : cleaned.replace(/[^a-z0-9-]/g, "");
}

function cleanCursor(value: string | undefined) {
  const cleaned = cleanText(value, MAX_FILTER_VALUE_LENGTH);
  return uuidPattern.test(cleaned) ? cleaned : null;
}

function parseMoney(value: string | undefined) {
  if (!value) {
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 10_000_000) {
    return null;
  }
  return Math.round(number * 100) / 100;
}

function parseSort(value: string | undefined): SearchSort {
  return searchSortOptions.some((option) => option.value === value) ? (value as SearchSort) : "recommended";
}

function clampLimit(value: string | undefined) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function parseAttributeParams(searchParams: RawSearchParams) {
  const attributes: Record<string, string> = {};

  for (const [paramKey, rawValue] of Object.entries(searchParams)) {
    if (!paramKey.startsWith("attr_")) {
      continue;
    }
    const key = paramKey.replace(/^attr_/, "").replace(/[^a-z0-9_]/g, "");
    const value = cleanText(firstParam(rawValue), MAX_FILTER_VALUE_LENGTH);
    if (key && value) {
      attributes[key] = value;
    }
  }

  return attributes;
}

function setParam(params: URLSearchParams, key: string, value: string) {
  if (value) {
    params.set(key, value);
  }
}

function formatListingPrice(amount: unknown, currency: string, priceType: PriceType) {
  if (priceType === PriceType.FREE) {
    return "Free";
  }
  if (priceType === PriceType.CONTACT || amount == null) {
    return "Contact for price";
  }

  const formatted = formatMoney(Number(amount), currency);

  if (priceType === PriceType.PER_MONTH) {
    return `${formatted}/mo`;
  }
  if (priceType === PriceType.PER_HOUR) {
    return `${formatted}/hr`;
  }

  return formatted;
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
