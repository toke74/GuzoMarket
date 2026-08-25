import { createHmac, randomBytes } from "node:crypto";

import { AuthTokenType, UserStatus, VerificationStatus, VerificationType } from "@/server/db/generated/prisma/enums";
import { env } from "@/lib/config/env";
import { prisma } from "@/server/db/client";

const tokenBytes = 32;
const emailVerificationTtlMs = 1000 * 60 * 60 * 24;
const passwordResetTtlMs = 1000 * 60 * 30;

export function hashSecret(secret: string) {
  return createHmac("sha256", env.AUTH_SESSION_SECRET).update(secret).digest("base64url");
}

export function createRawToken() {
  return randomBytes(tokenBytes).toString("base64url");
}

export async function createAuthToken(userId: string, type: AuthTokenType, now = new Date()) {
  const rawToken = createRawToken();
  const expiresAt = new Date(
    now.getTime() +
      (type === AuthTokenType.EMAIL_VERIFICATION ? emailVerificationTtlMs : passwordResetTtlMs),
  );

  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashSecret(rawToken),
      expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

export async function verifyEmailToken(rawToken: string, now = new Date()) {
  const token = await prisma.authToken.findUnique({
    where: { tokenHash: hashSecret(rawToken) },
    include: { user: true },
  });

  if (
    !token ||
    token.type !== AuthTokenType.EMAIL_VERIFICATION ||
    token.usedAt ||
    token.expiresAt <= now
  ) {
    return { ok: false as const };
  }

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: token.id }, data: { usedAt: now } }),
    prisma.user.update({
      where: { id: token.userId },
      data: {
        emailVerifiedAt: now,
        status:
          token.user.status === UserStatus.PENDING_VERIFICATION
            ? UserStatus.ACTIVE
            : token.user.status,
      },
    }),
    prisma.verification.upsert({
      where: { id: token.id },
      create: {
        id: token.id,
        userId: token.userId,
        type: VerificationType.EMAIL,
        status: VerificationStatus.VERIFIED,
        verifiedAt: now,
      },
      update: {
        status: VerificationStatus.VERIFIED,
        verifiedAt: now,
        expiresAt: null,
      },
    }),
  ]);

  return { ok: true as const };
}

export async function consumePasswordResetToken(rawToken: string, now = new Date()) {
  const token = await prisma.authToken.findUnique({
    where: { tokenHash: hashSecret(rawToken) },
  });

  if (
    !token ||
    token.type !== AuthTokenType.PASSWORD_RESET ||
    token.usedAt ||
    token.expiresAt <= now
  ) {
    return null;
  }

  await prisma.authToken.update({ where: { id: token.id }, data: { usedAt: now } });
  return token.userId;
}
