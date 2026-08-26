import { getActiveMarketplaceLocations, getLaunchMarketplaceRegion } from "@/server/marketplace/locations";

export async function GET() {
  const [region, locations] = await Promise.all([
    getLaunchMarketplaceRegion(),
    getActiveMarketplaceLocations(),
  ]);

  return Response.json({ region, locations });
}
