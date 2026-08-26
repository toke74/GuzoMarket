import { getActiveCategories, getCategoryHierarchy } from "@/server/marketplace/categories";
import { CategoryDomainType } from "@/server/db/generated/prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domainType = parseDomainType(url.searchParams.get("domainType"));
  const includeHierarchy = url.searchParams.get("hierarchy") === "true";
  const categories = includeHierarchy
    ? await getCategoryHierarchy(domainType)
    : await getActiveCategories(domainType);

  return Response.json({ categories });
}

function parseDomainType(value: string | null) {
  if (!value) {
    return undefined;
  }

  if (Object.values(CategoryDomainType).includes(value as CategoryDomainType)) {
    return value as CategoryDomainType;
  }

  return undefined;
}
