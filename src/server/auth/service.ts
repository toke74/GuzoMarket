import { Prisma } from "@/server/db/generated/prisma/client";
import { AuthTokenType, RoleName, UserStatus } from "@/server/db/generated/prisma/enums";
import { prisma } from "@/server/db/client";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { createAuthToken } from "@/server/auth/tokens";
import { sendEmailVerificationEmail } from "@/server/email/auth-emails";

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(input: RegisterInput) {
  const emailNormalized = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { name: RoleName.REGISTERED_USER },
        create: { name: RoleName.REGISTERED_USER },
        update: {},
      });

      const user = await tx.user.create({
        data: {
          email: input.email.trim(),
          emailNormalized,
          passwordHash,
          status: UserStatus.PENDING_VERIFICATION,
          profile: { create: { displayName: input.displayName.trim() } },
          roles: { create: { roleId: role.id } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          actorType: "USER",
          action: "account_registered",
          entityType: "User",
          entityId: user.id,
        },
      });

      return user;
    });

    const verification = await createAuthToken(result.id, AuthTokenType.EMAIL_VERIFICATION);
    await sendEmailVerificationEmail(result.email, verification.rawToken);
    return { ok: true as const, userId: result.id, verification };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false as const, reason: "duplicate_email" as const };
    }

    throw error;
  }
}

export async function authenticateUser(email: string, password: string, now = new Date()) {
  const user = await prisma.user.findUnique({
    where: { emailNormalized: normalizeEmail(email) },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false as const, reason: "invalid_credentials" as const };
  }

  if (user.status !== UserStatus.ACTIVE) {
    return { ok: false as const, reason: "inactive_account" as const };
  }

  const session = await createSession(user.id, now);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: now, lastActiveAt: now },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      actorType: "USER",
      action: "account_login",
      entityType: "User",
      entityId: user.id,
    },
  });

  return { ok: true as const, userId: user.id, session };
}
