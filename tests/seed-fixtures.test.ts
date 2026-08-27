import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
  prisma?: { seed?: string };
};
const seed = readFileSync(join(rootDir, "prisma", "seed.ts"), "utf8");
const verifySeed = readFileSync(join(rootDir, "prisma", "verify-seed.ts"), "utf8");

describe("development seed fixtures", () => {
  it("exposes repeatable seed and verification commands", () => {
    expect(packageJson.scripts["db:seed"]).toBe("node prisma/run-prisma-script.mjs prisma/seed.ts");
    expect(packageJson.scripts["db:seed:verify"]).toBe("node prisma/run-prisma-script.mjs prisma/verify-seed.ts");
    expect(packageJson.prisma?.seed).toBe("node prisma/run-prisma-script.mjs prisma/seed.ts");
  });

  it("keeps demo identities synthetic and visibly non-production", () => {
    expect(seed).toContain("@guzomarket.test");
    expect(seed).toContain("demo-fixture-password-hash-not-valid-for-login");
    expect(seed).not.toContain("@gmail.com");
    expect(seed).not.toContain("@yahoo.com");
    expect(seed).not.toContain("@hotmail.com");
  });

  it("covers Stage 3 fixture requirements", () => {
    for (const requiredText of [
      "Washington, DC",
      "Silver Spring",
      "Arlington",
      "Cars & Vehicles",
      "Housing",
      "Buy & Sell",
      "ListingStatus.ACTIVE",
      "ListingStatus.DRAFT",
      "ListingStatus.SOLD",
      "/fixtures/listings/",
      "ReportStatus.OPEN",
    ]) {
      expect(seed).toContain(requiredText);
    }

    expect(verifySeed).toContain("Seed verification passed");
  });

  it("includes homepage-ready synthetic fixture density without fake ratings", () => {
    for (const requiredText of [
      "demo-adams-morgan-office-chair",
      "demo-rockville-iphone-12-pro",
      "demo-alexandria-bookshelf",
      "demo-wheaton-room-available",
      "demo-dc-macbook-pro",
      "demo-selam-cleaning-services",
      "demo-ethio-market-grocery",
      "demo-habesha-auto-care",
      "demo-zemen-construction",
      "demo-community-soccer-meetup",
      "demo-local-food-pop-up",
    ]) {
      expect(seed).toContain(requiredText);
    }

    expect(seed).not.toContain("ratingAverage:");
    expect(seed).not.toContain("ratingCount:");
    expect(verifySeed).toContain("Expected homepage-ready active demo listings");
    expect(verifySeed).toContain("Expected homepage-ready demo business fixtures");
  });
});
