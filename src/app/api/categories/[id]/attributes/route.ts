import { getCategoryAttributeDefinitions } from "@/server/marketplace/categories";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const attributes = await getCategoryAttributeDefinitions(id);

  return Response.json({ attributes });
}
