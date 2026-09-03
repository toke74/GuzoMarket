import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authenticateUserMock,
  cookieGetMock,
  revokeSessionMock,
  setSessionCookieMock,
  clearSessionCookieMock,
  redirectMock,
} = vi.hoisted(() => ({
  authenticateUserMock: vi.fn(),
  cookieGetMock: vi.fn(),
  revokeSessionMock: vi.fn(),
  setSessionCookieMock: vi.fn(),
  clearSessionCookieMock: vi.fn(),
  redirectMock: vi.fn((href: string) => {
    throw new Error(`redirect:${href}`);
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
  cookies: vi.fn(async () => ({
    get: cookieGetMock,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/auth/session", () => ({
  authSessionCookieName: "guzomarket_session",
  setSessionCookie: setSessionCookieMock,
  revokeSession: revokeSessionMock,
  clearSessionCookie: clearSessionCookieMock,
}));

vi.mock("@/server/auth/service", () => ({
  authenticateUser: authenticateUserMock,
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
  registerUser: vi.fn(),
}));

vi.mock("@/server/auth/tokens", () => ({
  createAuthToken: vi.fn(),
  consumePasswordResetToken: vi.fn(),
}));

vi.mock("@/server/auth/password", () => ({
  hashPassword: vi.fn(),
  passwordPolicy: { minLength: 12, maxLength: 128 },
  validatePasswordPolicy: vi.fn(() => []),
}));

vi.mock("@/server/db/client", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    authSession: { updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/server/email/auth-emails", () => ({
  sendEmailVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock("@/server/rate-limit/memory", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

describe("logout action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revokes the active session, clears the cookie, and redirects home", async () => {
    cookieGetMock.mockReturnValueOnce({ value: "session-token" });
    const { logOutAction } = await import("@/features/auth/actions");

    await expect(logOutAction()).rejects.toThrow("redirect:/");

    expect(cookieGetMock).toHaveBeenCalledWith("guzomarket_session");
    expect(revokeSessionMock).toHaveBeenCalledWith("session-token");
    expect(clearSessionCookieMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("login action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists the session cookie and returns the normalized redirect target", async () => {
    authenticateUserMock.mockResolvedValueOnce({
      ok: true,
      session: {
        rawToken: "session-token",
        expiresAt: new Date("2026-09-17T12:00:00.000Z"),
      },
    });
    const formData = new FormData();
    formData.set("email", "amina.demo@guzomarket.test");
    formData.set("password", "stage eleven local passphrase");
    formData.set("returnTo", "/post");
    const { initialAuthActionState } = await import("@/features/auth/validation");
    const { logInAction } = await import("@/features/auth/actions");

    await expect(logInAction(initialAuthActionState, formData)).resolves.toEqual({
      status: "success",
      redirectTo: "/post",
    });

    expect(authenticateUserMock).toHaveBeenCalledWith(
      "amina.demo@guzomarket.test",
      "stage eleven local passphrase",
    );
    expect(setSessionCookieMock).toHaveBeenCalledWith(
      "session-token",
      new Date("2026-09-17T12:00:00.000Z"),
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
