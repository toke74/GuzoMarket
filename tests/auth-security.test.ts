import { describe, expect, it } from "vitest";

import { hashPassword, validatePasswordPolicy, verifyPassword } from "@/server/auth/password";
import { buildLoginPath, normalizeReturnTo } from "@/server/auth/redirects";
import { checkRateLimit, resetRateLimitsForTests } from "@/server/rate-limit/memory";

describe("auth security utilities", () => {
  it("hashes passwords and rejects the wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).not.toContain("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });

  it("applies length and common-password policy", () => {
    expect(validatePasswordPolicy("short")).toContain("Use at least 12 characters.");
    expect(validatePasswordPolicy("password password password")).toContain(
      "Choose a less common password.",
    );
    expect(validatePasswordPolicy("a unique local marketplace passphrase")).toEqual([]);
  });

  it("keeps return destinations same-origin and out of auth loops", () => {
    expect(normalizeReturnTo("/account/security?tab=password")).toBe(
      "/account/security?tab=password",
    );
    expect(normalizeReturnTo("https://evil.example/account")).toBe("/");
    expect(normalizeReturnTo("//evil.example/account")).toBe("/");
    expect(normalizeReturnTo("/auth/log-in")).toBe("/");
    expect(buildLoginPath("/account/security")).toBe(
      "/auth/log-in?returnTo=%2Faccount%2Fsecurity",
    );
  });

  it("rate limits repeated sensitive operations inside a window", () => {
    resetRateLimitsForTests();

    expect(checkRateLimit({ key: "login:test", limit: 2, windowMs: 60_000 }).allowed).toBe(
      true,
    );
    expect(checkRateLimit({ key: "login:test", limit: 2, windowMs: 60_000 }).allowed).toBe(
      true,
    );
    expect(checkRateLimit({ key: "login:test", limit: 2, windowMs: 60_000 }).allowed).toBe(
      false,
    );
  });
});
