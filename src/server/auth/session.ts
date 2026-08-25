import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserStatus } from "@/server/db/generated/prisma/enums";
import { prisma } from "@/server/db/client";
import { buildLoginPath } from "@/server/auth/redirects";
import { createRawToken, hashSecret } from "@/server/auth/tokens";

export const authSessionCookieName = "guzomarket_session";
const sessionTtlMs = 1000 * 60 * 60 * 24 * 14;

export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  status: UserStatus;
  emailVerifiedAt: Date | null;
};

export async function createSession(userId: string, now = new Date()) {
  const rawToken = createRawToken();
  const expiresAt = new Date(now.getTime() + sessionTtlMs);

  await prisma.authSession.create({
    data: {
      userId,
      sessionTokenHash: hashSecret(rawToken),
      expiresAt,
      lastUsedAt: now,
    },
  });

  return { rawToken, expiresAt };
}

export async function setSessionCookie(rawToken: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(authSessionCookieName, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(authSessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function revokeSession(rawToken: string | undefined, now = new Date()) {
  if (!rawToken) {
    return;
  }

  await prisma.authSession.updateMany({
    where: { sessionTokenHash: hashSecret(rawToken), revokedAt: null },
    data: { revokedAt: now },
  });
}

export async function getCurrentUser(now = new Date()): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(authSessionCookieName)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await prisma.authSession.findUnique({
    where: { sessionTokenHash: hashSecret(rawToken) },
    include: { user: { include: { profile: true } } },
  });

  if (!session || session.revokedAt || session.expiresAt <= now) {
    return null;
  }

  if (session.user.status !== UserStatus.ACTIVE) {
    await revokeSession(rawToken, now);
    return null;
  }

  await prisma.authSession.update({
    where: { id: session.id },
    data: { lastUsedAt: now, user: { update: { lastActiveAt: now } } },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.profile?.displayName ?? session.user.email,
    status: session.user.status,
    emailVerifiedAt: session.user.emailVerifiedAt,
  };
}

export async function requireActiveUser(returnTo = "/account/security") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginPath(returnTo));
  }

  return user;
}
