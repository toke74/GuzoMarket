import { describe, expect, it, vi } from "vitest";

describe("environment config", () => {
  it("validates required foundation environment variables", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/guzomarket");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.resetModules();

    const { env } = await import("@/lib/config/env");

    expect(env.DATABASE_URL).toContain("postgresql://");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("rejects missing server-only database configuration", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.resetModules();

    await expect(import("@/lib/config/env")).rejects.toThrow();
  });
});
