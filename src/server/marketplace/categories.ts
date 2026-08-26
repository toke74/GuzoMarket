import { unstable_cache } from "next/cache";

import { ApplicationError } from "@/lib/errors/application-error";
import { prisma } from "@/server/db/client";
import { CategoryDomainType } from "@/server/db/generated/prisma/client";

const CATEGORY_CACHE_SECONDS = 300;
const CATEGORY_CACHE_TAG = "marketplace:categories";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PublicCategoryDTO = {
  id: string;
  parentId: string | null;
  domainType: CategoryDomainType;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  sortOrder: number;
  isFeatured: boolean;
};

export type PublicCategoryTreeDTO = PublicCategoryDTO & {
  children: PublicCategoryTreeDTO[];
};

export type PublicCategoryAttributeDefinitionDTO = {
  id: string;
  categoryId: string;
  key: string;
  label: string;
  dataType: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  unit: string | null;
  sortOrder: number;
  validation: unknown;
  options: Array<{
    id: string;
    value: string;
    label: string;
    sortOrder: number;
  }>;
};

type CategoryRow = Awaited<ReturnType<typeof queryActiveCategories>>[number];

export const getActiveCategories = unstable_cache(
  queryActiveCategories,
  ["marketplace-active-categories"],
  {
    revalidate: CATEGORY_CACHE_SECONDS,
    tags: [CATEGORY_CACHE_TAG],
  },
);

export const getCategoryHierarchy = unstable_cache(
  async (domainType?: CategoryDomainType) => {
    const categories = await queryActiveCategories(domainType);
    return buildCategoryHierarchy(categories);
  },
  ["marketplace-category-hierarchy"],
  {
    revalidate: CATEGORY_CACHE_SECONDS,
    tags: [CATEGORY_CACHE_TAG],
  },
);

export async function getCategoryAttributeDefinitions(
  categoryId: string,
): Promise<PublicCategoryAttributeDefinitionDTO[]> {
  await validateActiveCategoryId(categoryId);

  const definitions = await prisma.categoryAttributeDefinition.findMany({
    where: { categoryId },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    include: {
      options: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      },
    },
  });

  return definitions.map((definition) => ({
    id: definition.id,
    categoryId: definition.categoryId,
    key: definition.key,
    label: definition.label,
    dataType: definition.dataType,
    isRequired: definition.isRequired,
    isFilterable: definition.isFilterable,
    isSearchable: definition.isSearchable,
    unit: definition.unit,
    sortOrder: definition.sortOrder,
    validation: definition.validationJson,
    options: definition.options.map((option) => ({
      id: option.id,
      value: option.value,
      label: option.label,
      sortOrder: option.sortOrder,
    })),
  }));
}

export async function validateActiveCategoryId(categoryId: string) {
  if (!uuidPattern.test(categoryId)) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid category id." });
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, isActive: true },
    select: { id: true, domainType: true },
  });

  if (!category) {
    throw new ApplicationError("BAD_REQUEST", { message: "Invalid category id." });
  }

  return category;
}

export async function queryActiveCategories(domainType?: CategoryDomainType): Promise<PublicCategoryDTO[]> {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      ...(domainType ? { domainType } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      parentId: true,
      domainType: true,
      name: true,
      slug: true,
      description: true,
      iconKey: true,
      sortOrder: true,
      isFeatured: true,
    },
  });

  return categories;
}

export function buildCategoryHierarchy(categories: CategoryRow[]): PublicCategoryTreeDTO[] {
  const nodes = new Map<string, PublicCategoryTreeDTO>();
  const roots: PublicCategoryTreeDTO[] = [];

  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) {
      continue;
    }

    if (category.parentId) {
      const parent = nodes.get(category.parentId);
      if (parent) {
        parent.children.push(node);
      }
      continue;
    }

    roots.push(node);
  }

  return roots;
}
