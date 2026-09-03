import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("auth service integration", () => {
  beforeAll(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://postgres:test123@localhost:5432/guzomarket?schema=public");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("AUTH_SESSION_SECRET", "test-only-auth-session-secret-32-characters");
  });

  afterAll(async () => {
    const { prisma } = await import("@/server/db/client");
    const users = await prisma.user.findMany({
      where: { emailNormalized: { endsWith: "@auth-stage4.test" } },
      select: { id: true },
    });
    const userIds = users.map((user) => user.id);

    await prisma.authToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.verification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: { in: userIds } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.profile.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it("signs up, verifies email, and logs in an active account", async () => {
    const { registerUser, authenticateUser } = await import("@/server/auth/service");
    const { verifyEmailToken } = await import("@/server/auth/tokens");
    const { devAuthEmailOutbox } = await import("@/server/email/auth-emails");

    const email = `stage4-${Date.now()}@auth-stage4.test`;
    const password = "a unique marketplace passphrase";

    const registration = await registerUser({
      displayName: "Stage Four",
      email,
      password,
    });

    expect(registration.ok).toBe(true);
    if (!registration.ok) {
      return;
    }
    expect(devAuthEmailOutbox.some((message) => message.to === email)).toBe(true);

    const inactiveLogin = await authenticateUser(email, password);
    expect(inactiveLogin).toMatchObject({ ok: false, reason: "inactive_account" });

    await expect(verifyEmailToken(registration.verification.rawToken)).resolves.toEqual({
      ok: true,
    });
    await expect(verifyEmailToken(registration.verification.rawToken)).resolves.toEqual({
      ok: false,
    });

    const login = await authenticateUser(email, password);
    expect(login.ok).toBe(true);
    if (login.ok) {
      expect(login.session.rawToken).toHaveLength(43);
    }

    await expect(authenticateUser(email, "wrong password")).resolves.toMatchObject({
      ok: false,
      reason: "invalid_credentials",
    });
  }, 20_000);

  it("consumes password reset tokens once and blocks suspended login", async () => {
    const { prisma } = await import("@/server/db/client");
    const { registerUser, authenticateUser } = await import("@/server/auth/service");
    const { createAuthToken, consumePasswordResetToken, verifyEmailToken } = await import(
      "@/server/auth/tokens"
    );
    const { AuthTokenType, UserStatus } = await import("@/server/db/generated/prisma/enums");

    const email = `reset-${Date.now()}@auth-stage4.test`;
    const password = "another unique marketplace passphrase";
    const registration = await registerUser({ displayName: "Reset User", email, password });

    expect(registration.ok).toBe(true);
    if (!registration.ok) {
      return;
    }

    await verifyEmailToken(registration.verification.rawToken);
    const reset = await createAuthToken(registration.userId, AuthTokenType.PASSWORD_RESET);

    await expect(consumePasswordResetToken(reset.rawToken)).resolves.toBe(registration.userId);
    await expect(consumePasswordResetToken(reset.rawToken)).resolves.toBeNull();

    await prisma.user.update({
      where: { id: registration.userId },
      data: { status: UserStatus.SUSPENDED },
    });

    await expect(authenticateUser(email, password)).resolves.toMatchObject({
      ok: false,
      reason: "inactive_account",
    });
  }, 20_000);
});
