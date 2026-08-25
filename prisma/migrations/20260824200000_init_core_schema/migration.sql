-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DEACTIVATED', 'DELETED');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('REGISTERED_USER', 'BUSINESS_ACCOUNT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE', 'IDENTITY', 'BUSINESS');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('COUNTRY', 'STATE_REGION', 'COUNTY_DISTRICT', 'CITY', 'NEIGHBORHOOD', 'POSTAL_CODE');

-- CreateEnum
CREATE TYPE "CategoryDomainType" AS ENUM ('LISTING', 'JOB', 'SERVICE', 'BUSINESS', 'EVENT', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "AttributeDataType" AS ENUM ('TEXT', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'ENUM', 'MULTI_ENUM');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SOLD', 'RENTED', 'FILLED', 'EXPIRED', 'ARCHIVED', 'REJECTED', 'REMOVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ModerationState" AS ENUM ('NOT_REVIEWED', 'AUTO_CLEARED', 'NEEDS_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'NEGOTIABLE', 'FREE', 'CONTACT', 'PER_HOUR', 'PER_DAY', 'PER_WEEK', 'PER_MONTH', 'SALARY');

-- CreateEnum
CREATE TYPE "LocationPrecision" AS ENUM ('CITY', 'NEIGHBORHOOD', 'APPROXIMATE', 'EXACT_PUBLIC');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('IN_APP_MESSAGE', 'BUSINESS_CONTACT', 'EXTERNAL_APPLICATION');

-- CreateEnum
CREATE TYPE "ConversationContextType" AS ENUM ('LISTING', 'BUSINESS', 'JOB', 'EVENT', 'SUPPORT');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MESSAGE', 'LISTING_APPROVED', 'LISTING_REJECTED', 'LISTING_EXPIRING', 'SAVED_SEARCH_MATCH', 'FAVORITE_UPDATE', 'PRICE_CHANGE', 'REVIEW_RECEIVED', 'BUSINESS_INQUIRY', 'MODERATION_ACTION', 'SECURITY_ALERT');

-- CreateEnum
CREATE TYPE "ReportSubjectType" AS ENUM ('LISTING', 'USER', 'BUSINESS', 'MESSAGE', 'COMMUNITY_POST', 'EVENT');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SCAM', 'SPAM', 'PROHIBITED_ITEM', 'HARASSMENT', 'FRAUD', 'DUPLICATE', 'MISLEADING', 'COPYRIGHT_IP', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'TRIAGED', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ModerationTargetType" AS ENUM ('USER', 'LISTING', 'BUSINESS', 'MESSAGE', 'EVENT', 'COMMUNITY_POST', 'REVIEW');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('APPROVE', 'REJECT', 'REMOVE', 'RESTORE', 'SUSPEND', 'UNSUSPEND', 'WARN', 'FLAG', 'UNFLAG', 'VERIFY', 'REVOKE_VERIFICATION');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'REMOVED');

-- CreateEnum
CREATE TYPE "BusinessMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "JobWorkMode" AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'TEMPORARY', 'CONTRACT', 'INTERNSHIP', 'GIG', 'OTHER');

-- CreateEnum
CREATE TYPE "SalaryPeriod" AS ENUM ('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "JobApplicationMethod" AS ENUM ('IN_APP_CONTACT', 'EXTERNAL_URL', 'EMAIL');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'FILLED', 'EXPIRED', 'ARCHIVED', 'REJECTED', 'REMOVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'CANCELLED', 'COMPLETED', 'ARCHIVED', 'REJECTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "CommunityPostType" AS ENUM ('ANNOUNCEMENT', 'RECOMMENDATION', 'QUESTION', 'HELP_REQUEST', 'LOCAL_INFORMATION');

-- CreateEnum
CREATE TYPE "CommunityPostStatus" AS ENUM ('ACTIVE', 'FLAGGED', 'REMOVED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMPTZ(6),
    "passwordHash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "defaultRole" "RoleName" NOT NULL DEFAULT 'REGISTERED_USER',
    "lastLoginAt" TIMESTAMPTZ(6),
    "lastActiveAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "cityLocationId" UUID,
    "publicLocationText" TEXT,
    "joinedDisplayPreference" TEXT,
    "responseRatePercent" INTEGER,
    "medianResponseMinutes" INTEGER,
    "sellerRatingAverage" DECIMAL(3,2),
    "sellerRatingCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "grantedByUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "businessId" UUID,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "providerReference" TEXT,
    "verifiedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "reviewedByUserId" UUID,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL,
    "type" "LocationType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" UUID,
    "countryCode" TEXT,
    "regionCode" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "timezone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceRegion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "defaultLatitude" DECIMAL(9,6) NOT NULL,
    "defaultLongitude" DECIMAL(9,6) NOT NULL,
    "defaultRadiusMiles" INTEGER NOT NULL,
    "isLaunchMarket" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MarketplaceRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceRegionLocation" (
    "id" UUID NOT NULL,
    "marketplaceRegionId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MarketplaceRegionLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "domainType" "CategoryDomainType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAttributeDefinition" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dataType" "AttributeDataType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isFilterable" BOOLEAN NOT NULL DEFAULT false,
    "isSearchable" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "validationJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CategoryAttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryAttributeOption" (
    "id" UUID NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CategoryAttributeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceAmount" DECIMAL(12,2),
    "priceCurrency" TEXT NOT NULL DEFAULT 'USD',
    "priceType" "PriceType" NOT NULL,
    "condition" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',
    "publicLocationId" UUID,
    "postalCode" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "locationPrecision" "LocationPrecision" NOT NULL DEFAULT 'APPROXIMATE',
    "contactPreference" "ContactPreference" NOT NULL DEFAULT 'IN_APP_MESSAGE',
    "availabilityText" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredSource" TEXT,
    "publishedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "soldAt" TIMESTAMPTZ(6),
    "archivedAt" TIMESTAMPTZ(6),
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "altText" TEXT,
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAttributeValue" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "textValue" TEXT,
    "integerValue" INTEGER,
    "decimalValue" DECIMAL(14,4),
    "booleanValue" BOOLEAN,
    "dateValue" DATE,
    "optionValue" TEXT,
    "multiOptionJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ListingAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "contextType" "ConversationContextType" NOT NULL,
    "listingId" UUID,
    "businessId" UUID,
    "jobId" UUID,
    "eventId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastMessageAt" TIMESTAMPTZ(6),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMPTZ(6),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "leftAt" TIMESTAMPTZ(6),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "senderUserId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "sentAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMPTZ(6),
    "deletedAt" TIMESTAMPTZ(6),
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" UUID,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "reporterUserId" UUID NOT NULL,
    "subjectType" "ReportSubjectType" NOT NULL,
    "listingId" UUID,
    "userId" UUID,
    "businessId" UUID,
    "messageId" UUID,
    "communityPostId" UUID,
    "eventId" UUID,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ReportPriority" NOT NULL DEFAULT 'NORMAL',
    "assignedModeratorId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "resolvedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" UUID NOT NULL,
    "moderatorUserId" UUID NOT NULL,
    "targetType" "ModerationTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "notes" TEXT,
    "previousStateJson" JSONB,
    "newStateJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" UUID NOT NULL,
    "blockerUserId" UUID NOT NULL,
    "blockedUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "actorType" "AuditActorType" NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "ipHash" TEXT,
    "userAgentSummary" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,
    "status" "BusinessStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "publicLocationId" UUID NOT NULL,
    "streetAddress" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "phonePublic" TEXT,
    "emailPublic" TEXT,
    "websiteUrl" TEXT,
    "hoursJson" JSONB,
    "socialLinksJson" JSONB,
    "ratingAverage" DECIMAL(3,2),
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMember" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "BusinessMemberRole" NOT NULL,
    "invitedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMPTZ(6),
    "removedAt" TIMESTAMPTZ(6),

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessImage" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "businessId" UUID,
    "categoryId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "publicLocationId" UUID,
    "workMode" "JobWorkMode" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "salaryCurrency" TEXT,
    "salaryPeriod" "SalaryPeriod",
    "experienceText" TEXT,
    "skillsJson" JSONB,
    "applicationMethod" "JobApplicationMethod" NOT NULL,
    "applicationUrl" TEXT,
    "applicationEmail" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',
    "publishedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "businessId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" UUID,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6),
    "timezone" TEXT NOT NULL,
    "publicLocationId" UUID,
    "venueName" TEXT,
    "streetAddress" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "contactUrl" TEXT,
    "contactEmail" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventImage" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" UUID NOT NULL,
    "authorUserId" UUID NOT NULL,
    "type" "CommunityPostType" NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "publicLocationId" UUID,
    "status" "CommunityPostStatus" NOT NULL DEFAULT 'ACTIVE',
    "moderationState" "ModerationState" NOT NULL DEFAULT 'NOT_REVIEWED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_userId_roleId_idx" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "Verification_userId_type_status_idx" ON "Verification"("userId", "type", "status");

-- CreateIndex
CREATE INDEX "Verification_businessId_type_status_idx" ON "Verification"("businessId", "type", "status");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "Location"("parentId");

-- CreateIndex
CREATE INDEX "Location_type_name_idx" ON "Location"("type", "name");

-- CreateIndex
CREATE INDEX "Location_countryCode_regionCode_idx" ON "Location"("countryCode", "regionCode");

-- CreateIndex
CREATE INDEX "Location_latitude_longitude_idx" ON "Location"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceRegion_slug_key" ON "MarketplaceRegion"("slug");

-- CreateIndex
CREATE INDEX "MarketplaceRegionLocation_locationId_idx" ON "MarketplaceRegionLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceRegionLocation_marketplaceRegionId_locationId_key" ON "MarketplaceRegionLocation"("marketplaceRegionId", "locationId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_domainType_isActive_sortOrder_idx" ON "Category"("domainType", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "CategoryAttributeDefinition_categoryId_sortOrder_idx" ON "CategoryAttributeDefinition"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAttributeDefinition_categoryId_key_key" ON "CategoryAttributeDefinition"("categoryId", "key");

-- CreateIndex
CREATE INDEX "CategoryAttributeOption_attributeDefinitionId_sortOrder_idx" ON "CategoryAttributeOption"("attributeDefinitionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAttributeOption_attributeDefinitionId_value_key" ON "CategoryAttributeOption"("attributeDefinitionId", "value");

-- CreateIndex
CREATE INDEX "Listing_ownerUserId_status_idx" ON "Listing"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "Listing_categoryId_status_publishedAt_idx" ON "Listing"("categoryId", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Listing_publicLocationId_status_publishedAt_idx" ON "Listing"("publicLocationId", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Listing_priceAmount_idx" ON "Listing"("priceAmount");

-- CreateIndex
CREATE INDEX "Listing_status_expiresAt_idx" ON "Listing"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_isFeatured_status_idx" ON "Listing"("isFeatured", "status");

-- CreateIndex
CREATE INDEX "Listing_slug_idx" ON "Listing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ListingImage_listingId_sortOrder_key" ON "ListingImage"("listingId", "sortOrder");

-- CreateIndex
CREATE INDEX "ListingAttributeValue_attributeDefinitionId_idx" ON "ListingAttributeValue"("attributeDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAttributeValue_listingId_attributeDefinitionId_key" ON "ListingAttributeValue"("listingId", "attributeDefinitionId");

-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "Conversation_listingId_idx" ON "Conversation"("listingId");

-- CreateIndex
CREATE INDEX "Conversation_businessId_idx" ON "Conversation"("businessId");

-- CreateIndex
CREATE INDEX "Conversation_jobId_idx" ON "Conversation"("jobId");

-- CreateIndex
CREATE INDEX "Conversation_eventId_idx" ON "Conversation"("eventId");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_sentAt_idx" ON "Message"("conversationId", "sentAt");

-- CreateIndex
CREATE INDEX "Message_senderUserId_sentAt_idx" ON "Message"("senderUserId", "sentAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_key" ON "NotificationPreference"("userId", "type");

-- CreateIndex
CREATE INDEX "Report_status_priority_createdAt_idx" ON "Report"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Report_assignedModeratorId_status_idx" ON "Report"("assignedModeratorId", "status");

-- CreateIndex
CREATE INDEX "Report_reporterUserId_idx" ON "Report"("reporterUserId");

-- CreateIndex
CREATE INDEX "ModerationAction_targetType_targetId_createdAt_idx" ON "ModerationAction"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationAction_moderatorUserId_createdAt_idx" ON "ModerationAction"("moderatorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Block_blockedUserId_idx" ON "Block"("blockedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerUserId_blockedUserId_key" ON "Block"("blockerUserId", "blockedUserId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "Business_categoryId_status_idx" ON "Business"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Business_publicLocationId_status_idx" ON "Business"("publicLocationId", "status");

-- CreateIndex
CREATE INDEX "Business_name_idx" ON "Business"("name");

-- CreateIndex
CREATE INDEX "Business_ownerUserId_status_idx" ON "Business"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "Business_slug_idx" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "BusinessMember_userId_idx" ON "BusinessMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_businessId_userId_key" ON "BusinessMember"("businessId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessImage_businessId_sortOrder_key" ON "BusinessImage"("businessId", "sortOrder");

-- CreateIndex
CREATE INDEX "Job_publicLocationId_status_publishedAt_idx" ON "Job"("publicLocationId", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Job_employmentType_status_idx" ON "Job"("employmentType", "status");

-- CreateIndex
CREATE INDEX "Job_workMode_status_idx" ON "Job"("workMode", "status");

-- CreateIndex
CREATE INDEX "Job_businessId_status_idx" ON "Job"("businessId", "status");

-- CreateIndex
CREATE INDEX "Job_ownerUserId_status_idx" ON "Job"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "Job_categoryId_status_idx" ON "Job"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Job_slug_idx" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Event_startAt_status_idx" ON "Event"("startAt", "status");

-- CreateIndex
CREATE INDEX "Event_publicLocationId_startAt_idx" ON "Event"("publicLocationId", "startAt");

-- CreateIndex
CREATE INDEX "Event_categoryId_startAt_idx" ON "Event"("categoryId", "startAt");

-- CreateIndex
CREATE INDEX "Event_ownerUserId_status_idx" ON "Event"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "Event_businessId_status_idx" ON "Event"("businessId", "status");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EventImage_eventId_sortOrder_key" ON "EventImage"("eventId", "sortOrder");

-- CreateIndex
CREATE INDEX "CommunityPost_publicLocationId_status_createdAt_idx" ON "CommunityPost"("publicLocationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityPost_authorUserId_status_idx" ON "CommunityPost"("authorUserId", "status");

-- CreateIndex
CREATE INDEX "CommunityPost_type_status_createdAt_idx" ON "CommunityPost"("type", "status", "createdAt");

-- Additional integrity constraints not expressible in Prisma schema.
CREATE UNIQUE INDEX "UserRole_active_userId_roleId_key" ON "UserRole"("userId", "roleId") WHERE "revokedAt" IS NULL;

CREATE UNIQUE INDEX "Category_parent_slug_key" ON "Category"(COALESCE("parentId", '00000000-0000-0000-0000-000000000000'::uuid), "slug");

ALTER TABLE "Block" ADD CONSTRAINT "Block_no_self_block_check" CHECK ("blockerUserId" <> "blockedUserId");

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_priceAmount_nonnegative_check" CHECK ("priceAmount" IS NULL OR "priceAmount" >= 0);

ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_dimensions_file_size_positive_check" CHECK ("width" > 0 AND "height" > 0 AND "fileSizeBytes" > 0);

ALTER TABLE "ListingAttributeValue" ADD CONSTRAINT "ListingAttributeValue_exactly_one_value_check" CHECK (
  num_nonnulls("textValue", "integerValue", "decimalValue", "booleanValue", "dateValue", "optionValue", "multiOptionJson") = 1
);

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_context_reference_check" CHECK (
  ("contextType" = 'LISTING' AND "listingId" IS NOT NULL AND "businessId" IS NULL AND "jobId" IS NULL AND "eventId" IS NULL)
  OR ("contextType" = 'BUSINESS' AND "listingId" IS NULL AND "businessId" IS NOT NULL AND "jobId" IS NULL AND "eventId" IS NULL)
  OR ("contextType" = 'JOB' AND "listingId" IS NULL AND "businessId" IS NULL AND "jobId" IS NOT NULL AND "eventId" IS NULL)
  OR ("contextType" = 'EVENT' AND "listingId" IS NULL AND "businessId" IS NULL AND "jobId" IS NULL AND "eventId" IS NOT NULL)
  OR ("contextType" = 'SUPPORT' AND "listingId" IS NULL AND "businessId" IS NULL AND "jobId" IS NULL AND "eventId" IS NULL)
);

ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_file_size_positive_check" CHECK ("fileSizeBytes" > 0);

ALTER TABLE "Report" ADD CONSTRAINT "Report_subject_reference_check" CHECK (
  ("subjectType" = 'LISTING' AND "listingId" IS NOT NULL AND "userId" IS NULL AND "businessId" IS NULL AND "messageId" IS NULL AND "communityPostId" IS NULL AND "eventId" IS NULL)
  OR ("subjectType" = 'USER' AND "listingId" IS NULL AND "userId" IS NOT NULL AND "businessId" IS NULL AND "messageId" IS NULL AND "communityPostId" IS NULL AND "eventId" IS NULL)
  OR ("subjectType" = 'BUSINESS' AND "listingId" IS NULL AND "userId" IS NULL AND "businessId" IS NOT NULL AND "messageId" IS NULL AND "communityPostId" IS NULL AND "eventId" IS NULL)
  OR ("subjectType" = 'MESSAGE' AND "listingId" IS NULL AND "userId" IS NULL AND "businessId" IS NULL AND "messageId" IS NOT NULL AND "communityPostId" IS NULL AND "eventId" IS NULL)
  OR ("subjectType" = 'COMMUNITY_POST' AND "listingId" IS NULL AND "userId" IS NULL AND "businessId" IS NULL AND "messageId" IS NULL AND "communityPostId" IS NOT NULL AND "eventId" IS NULL)
  OR ("subjectType" = 'EVENT' AND "listingId" IS NULL AND "userId" IS NULL AND "businessId" IS NULL AND "messageId" IS NULL AND "communityPostId" IS NULL AND "eventId" IS NOT NULL)
);

ALTER TABLE "Business" ADD CONSTRAINT "Business_rating_bounds_check" CHECK (
  "ratingAverage" IS NULL OR ("ratingAverage" >= 0 AND "ratingAverage" <= 5)
);

ALTER TABLE "Business" ADD CONSTRAINT "Business_rating_count_nonnegative_check" CHECK ("ratingCount" >= 0);

ALTER TABLE "Job" ADD CONSTRAINT "Job_salary_nonnegative_check" CHECK (
  ("salaryMin" IS NULL OR "salaryMin" >= 0)
  AND ("salaryMax" IS NULL OR "salaryMax" >= 0)
  AND ("salaryMin" IS NULL OR "salaryMax" IS NULL OR "salaryMax" >= "salaryMin")
);

ALTER TABLE "Event" ADD CONSTRAINT "Event_end_after_start_check" CHECK ("endAt" IS NULL OR "endAt" >= "startAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_cityLocationId_fkey" FOREIGN KEY ("cityLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceRegionLocation" ADD CONSTRAINT "MarketplaceRegionLocation_marketplaceRegionId_fkey" FOREIGN KEY ("marketplaceRegionId") REFERENCES "MarketplaceRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceRegionLocation" ADD CONSTRAINT "MarketplaceRegionLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAttributeDefinition" ADD CONSTRAINT "CategoryAttributeDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAttributeOption" ADD CONSTRAINT "CategoryAttributeOption_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "CategoryAttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_publicLocationId_fkey" FOREIGN KEY ("publicLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAttributeValue" ADD CONSTRAINT "ListingAttributeValue_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAttributeValue" ADD CONSTRAINT "ListingAttributeValue_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "CategoryAttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "CommunityPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedModeratorId_fkey" FOREIGN KEY ("assignedModeratorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_moderatorUserId_fkey" FOREIGN KEY ("moderatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerUserId_fkey" FOREIGN KEY ("blockerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_publicLocationId_fkey" FOREIGN KEY ("publicLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessImage" ADD CONSTRAINT "BusinessImage_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_publicLocationId_fkey" FOREIGN KEY ("publicLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_publicLocationId_fkey" FOREIGN KEY ("publicLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_publicLocationId_fkey" FOREIGN KEY ("publicLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
