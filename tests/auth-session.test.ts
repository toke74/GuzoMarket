import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    authSession: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

vi.mock("@/server/auth/tokens", () => ({
  createRawToken: vi.fn(() => "new-token"),
  hashSecret: vi.fn((token: string) => `hash:${token}`),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("auth session revocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.authSession.updateMany.mockResolvedValue({ count: 1 });
  });

  it("invalidates only the provided session token", async () => {
    const { revokeSession } = await import("@/server/auth/session");
    const now = new Date("2026-09-01T12:00:00.000Z");

    await revokeSession("signed-out-user-token", now);

    expect(prismaMock.authSession.updateMany).toHaveBeenCalledWith({
      where: {
        sessionTokenHash: "hash:signed-out-user-token",
        revokedAt: null,
      },
      data: { revokedAt: now },
    });
  });

  it("does not mutate any session when there is no token", async () => {
    const { revokeSession } = await import("@/server/auth/session");

    await revokeSession(undefined);

    expect(prismaMock.authSession.updateMany).not.toHaveBeenCalled();
  });
});
