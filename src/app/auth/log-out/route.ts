import { NextResponse } from "next/server";

import { authSessionCookieName, clearSessionCookie, revokeSession } from "@/server/auth/session";

export async function POST(request: Request) {
  const rawCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${authSessionCookieName}=`))
    ?.split("=")[1];

  await revokeSession(rawCookie);
  await clearSessionCookie();

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
