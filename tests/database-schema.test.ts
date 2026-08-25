import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const schema = readFileSync(join(rootDir, "prisma", "schema.prisma"), "utf8");
const migration = readdirSync(join(rootDir, "prisma", "migrations"))
  .filter((migrationDir) =>
    existsSync(join(rootDir, "prisma", "migrations", migrationDir, "migration.sql")),
  )
  .map((migrationDir) => {
    return readFileSync(join(rootDir, "prisma", "migrations", migrationDir, "migration.sql"), "utf8");
  })
  .join("\n");

describe("database schema foundation", () => {
  it("models the Stage 2 MVP domain tables", () => {
    const requiredModels = [
      "User",
      "Profile",
      "Role",
      "UserRole",
      "Verification",
      "Location",
      "MarketplaceRegion",
      "MarketplaceRegionLocation",
      "Category",
      "CategoryAttributeDefinition",
      "CategoryAttributeOption",
      "Listing",
      "ListingImage",
      "ListingAttributeValue",
      "Favorite",
      "Conversation",
      "ConversationParticipant",
      "Message",
      "MessageAttachment",
      "Notification",
      "NotificationPreference",
      "Report",
      "ModerationAction",
      "Block",
      "AuditLog",
      "AuthSession",
      "AuthToken",
      "Business",
      "BusinessMember",
      "BusinessImage",
      "Job",
      "Event",
      "EventImage",
      "CommunityPost",
    ];

    for (const model of requiredModels) {
      expect(schema).toContain(`model ${model} {`);
      expect(migration).toContain(`CREATE TABLE "${model}"`);
    }
  });

  it("keeps lifecycle states explicit instead of boolean-only flags", () => {
    for (const enumName of [
      "UserStatus",
      "ListingStatus",
      "ModerationState",
      "ReportStatus",
      "BusinessStatus",
      "JobStatus",
      "EventStatus",
      "CommunityPostStatus",
      "AuthTokenType",
    ]) {
      expect(schema).toContain(`enum ${enumName} {`);
      expect(migration).toContain(`CREATE TYPE "${enumName}" AS ENUM`);
    }
  });

  it("enforces core relationship and privacy invariants in SQL", () => {
    for (const constraint of [
      "UserRole_active_userId_roleId_key",
      "Category_parent_slug_key",
      "Block_no_self_block_check",
      "Listing_priceAmount_nonnegative_check",
      "ListingAttributeValue_exactly_one_value_check",
      "Conversation_context_reference_check",
      "Report_subject_reference_check",
      "Job_salary_nonnegative_check",
      "Event_end_after_start_check",
    ]) {
      expect(migration).toContain(constraint);
    }
  });
});
