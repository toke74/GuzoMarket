import { NextResponse } from "next/server";

import { parseSearchCriteria, searchMarketplaceListings } from "@/server/marketplace/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const criteria = parseSearchCriteria(params);

  try {
    const result = await searchMarketplaceListings(criteria);
    return NextResponse.json({
      data: result.listings,
      meta: {
        count: result.resultCount,
        nextCursor: result.nextCursor,
        criteria: result.criteria,
      },
    });
  } catch {
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 500 });
  }
}
