# GuzoMarket — Database Schema & Entity Relationship Specification v1.0

**Project:** GuzoMarket  
**Document:** Database Schema & Entity Relationship Specification  
**Version:** 1.0  
**Status:** Implementation baseline  
**Primary database:** PostgreSQL  
**Primary ORM:** Prisma  
**Source documents:** GuzoMarket Master PRD v1.1; GuzoMarket Information Architecture & Complete Sitemap v1.0  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

## 1. Purpose

This specification translates the approved GuzoMarket product architecture into a
relational data model suitable for PostgreSQL and Prisma.

It defines:

- Core entities
- Enums and lifecycle states
- Relationships
- Ownership and permissions
- Geographic modeling
- Listing category attributes
- Messaging
- Favorites and saved searches
- Notifications
- Businesses
- Jobs
- Events
- Community
- Moderation and reports
- Verification
- Promotions and subscriptions
- Audit logging
- Search/indexing considerations
- Soft-delete and retention conventions
- Seed taxonomy requirements

The objective is to prevent ad hoc schema decisions during implementation and to
keep the application extensible across locations, categories, and later product phases.

---

## 2. Database Design Principles

The schema must follow these principles:

1. **Stable identifiers**
   - Every primary entity uses a stable ID that does not depend on a slug or title.
   - Public slugs are mutable and never act as primary keys.

2. **Explicit domain boundaries**
   - Listing, Business, Job, Event, and CommunityPost are separate core domain models
     where requirements differ materially.

3. **Structured geography**
   - Locations must be normalized and hierarchical.
   - Public display location and internal geocoded position are separate concerns.

4. **Auditable state transitions**
   - Moderation and security-sensitive actions must be recorded.

5. **Soft deletion where appropriate**
   - User-generated entities should support reversible moderation and safe retention.

6. **Server-authoritative validation**
   - Database constraints complement application validation.

7. **Phase-aware extensibility**
   - MVP schema should avoid premature complexity while leaving clean extension points
     for post-MVP features.

8. **Searchability**
   - Frequently queried filters should map to indexed relational columns whenever
     practical rather than opaque JSON only.

9. **Privacy by default**
   - Sensitive data should never be exposed merely because it exists in the database.

10. **No generic everything-table**
    - Do not collapse every content type into a single polymorphic record if that would
      weaken validation or create unclear lifecycle rules.

---

## 3. ID Strategy

Recommended primary IDs:

```text
UUIDv7
```

or another time-sortable UUID implementation supported cleanly by the chosen stack.

Reasons:

- Safe for distributed creation
- Difficult to enumerate
- Stable across environments
- Useful for public entities
- Better insertion locality than fully random UUIDv4

If UUIDv7 support creates unnecessary tooling friction at implementation time, UUIDv4
is acceptable for MVP.

Never use sequential integer IDs in public URLs.

---

## 4. Timestamp Convention

Most mutable entities should include:

```text
createdAt
updatedAt
```

Where lifecycle requires it, also include:

```text
publishedAt
archivedAt
deletedAt
expiresAt
reviewedAt
lastActiveAt
```

Use timezone-aware timestamps in PostgreSQL (`timestamptz`).

Application UI should localize timestamps for the user.

---

## 5. Core Entity Overview

```text
User
Profile
Role
UserRole
Verification
Session / Auth provider tables

Location
MarketplaceRegion
MarketplaceRegionLocation

Category
CategoryAttributeDefinition
CategoryAttributeOption

Listing
ListingImage
ListingAttributeValue
Favorite
SavedSearch

Conversation
ConversationParticipant
Message
MessageAttachment

Notification
NotificationPreference

Report
ModerationAction
Block
AuditLog

Business
BusinessMember
BusinessImage
BusinessReview
BusinessReviewResponse

Job
JobApplication [Post-MVP capable]
Resume [Post-MVP]

Event
EventImage

CommunityPost
Community
CommunityMember [Phase 2+]

Promotion [Post-MVP]
Subscription [Post-MVP]
Payment [Post-MVP]
```

---

## 6. User Model

### 6.1 User

Represents the account/security identity.

Recommended fields:

```text
id
email
emailNormalized
emailVerifiedAt
passwordHash                 nullable if external auth
status
defaultRole
lastLoginAt
lastActiveAt
createdAt
updatedAt
deletedAt
```

Recommended enum:

```text
UserStatus
- ACTIVE
- PENDING_VERIFICATION
- SUSPENDED
- DEACTIVATED
- DELETED
```

Rules:

- `emailNormalized` is unique.
- Email comparison must be case-insensitive at the application layer and preferably
  enforced with an appropriate normalized column/index.
- `passwordHash` must never be returned through application serializers.
- Account deletion should not immediately destroy records needed for fraud,
  compliance, moderation, or transactional integrity.

Indexes:

```text
UNIQUE(emailNormalized)
INDEX(status)
INDEX(createdAt)
INDEX(lastActiveAt)
```

---

## 7. Profile Model

### 7.1 Profile

One-to-one with User.

Fields:

```text
id
userId
displayName
username
bio
avatarUrl
cityLocationId
publicLocationText
joinedDisplayPreference
responseRatePercent          nullable
medianResponseMinutes        nullable
sellerRatingAverage          nullable / derived
sellerRatingCount            default 0
isPublic
createdAt
updatedAt
```

Constraints:

```text
UNIQUE(userId)
UNIQUE(username)             if usernames are enabled publicly
```

Rules:

- Exact residential address never belongs on Profile.
- `sellerRatingAverage` may be derived/cached later.
- Public profile visibility must respect `isPublic` plus future privacy settings.

Relationship:

```text
User 1 ─── 1 Profile
```

---

## 8. Roles and Authorization

### 8.1 Role

Seeded values:

```text
REGISTERED_USER
BUSINESS_ACCOUNT
MODERATOR
ADMIN
SUPER_ADMIN
```

Guest is not a persisted role.

### 8.2 UserRole

Many-to-many to support administrative or business capability layering.

Fields:

```text
id
userId
roleId
grantedByUserId             nullable
createdAt
revokedAt                   nullable
```

Constraints:

```text
UNIQUE(userId, roleId)      for active grants
```

---

## 9. Verification

### 9.1 Verification

Fields:

```text
id
userId                      nullable
businessId                  nullable
type
status
providerReference           nullable
verifiedAt                  nullable
expiresAt                   nullable
reviewedByUserId            nullable
metadataJson                nullable
createdAt
updatedAt
```

Enums:

```text
VerificationType
- EMAIL
- PHONE
- IDENTITY
- BUSINESS

VerificationStatus
- PENDING
- VERIFIED
- REJECTED
- EXPIRED
- REVOKED
```

Rules:

- Verification must never imply transaction safety.
- Business and user verification should be explicitly scoped.
- Store only necessary verification metadata.

---

## 10. Geography

### 10.1 Location

A normalized hierarchical geography table.

Fields:

```text
id
type
name
slug
parentId                    nullable
countryCode                 nullable
regionCode                  nullable
postalCode                  nullable
latitude                    nullable
longitude                   nullable
timezone                    nullable
isActive
createdAt
updatedAt
```

Enum:

```text
LocationType
- COUNTRY
- STATE_REGION
- COUNTY_DISTRICT
- CITY
- NEIGHBORHOOD
- POSTAL_CODE
```

Relationships:

```text
Location parent 1 ─── * Location children
```

Indexes:

```text
INDEX(parentId)
INDEX(type, name)
INDEX(countryCode, regionCode)
INDEX(latitude, longitude)  or spatial index when enabled
```

Recommendation:

For radius search at scale, enable PostGIS later if useful. MVP may use latitude/longitude
plus database distance calculations if volume is modest.

---

## 11. Marketplace Regions

### 11.1 MarketplaceRegion

Represents user-facing markets such as DMV that can cross administrative boundaries.

Fields:

```text
id
name
slug
countryCode
defaultLatitude
defaultLongitude
defaultRadiusMiles
isLaunchMarket
isActive
createdAt
updatedAt
```

### 11.2 MarketplaceRegionLocation

Fields:

```text
id
marketplaceRegionId
locationId
priority
```

Constraint:

```text
UNIQUE(marketplaceRegionId, locationId)
```

Example:

```text
DMV
├── Washington, DC
├── Silver Spring, MD
├── Bethesda, MD
├── Hyattsville, MD
├── Arlington, VA
└── Alexandria, VA
```

---

## 12. Category Taxonomy

### 12.1 Category

Supports top-level and nested marketplace taxonomy.

Fields:

```text
id
parentId                    nullable
domainType
name
slug
description                 nullable
iconKey                     nullable
sortOrder
isActive
isFeatured
createdAt
updatedAt
```

Enum:

```text
CategoryDomainType
- LISTING
- JOB
- SERVICE
- BUSINESS
- EVENT
- COMMUNITY
```

Relationships:

```text
Category parent 1 ─── * Category children
```

Constraints:

```text
UNIQUE(parentId, slug)
```

Top-level seed concepts include:

```text
Buy & Sell
Housing
Cars
Jobs
Services
Events
Businesses
Community
```

---

## 13. Category Attribute Definitions

Different listing categories require different structured fields.

### 13.1 CategoryAttributeDefinition

Fields:

```text
id
categoryId
key
label
dataType
isRequired
isFilterable
isSearchable
unit                      nullable
sortOrder
validationJson            nullable
createdAt
updatedAt
```

Enum:

```text
AttributeDataType
- TEXT
- INTEGER
- DECIMAL
- BOOLEAN
- DATE
- ENUM
- MULTI_ENUM
```

### 13.2 CategoryAttributeOption

Fields:

```text
id
attributeDefinitionId
value
label
sortOrder
isActive
```

Examples:

Cars:

```text
make
model
year
mileage
transmission
fuelType
bodyStyle
condition
```

Housing:

```text
bedrooms
bathrooms
propertyType
leaseTerm
availableDate
petsAllowed
furnished
```

Electronics:

```text
brand
model
storage
color
condition
```

This structure prevents adding hundreds of nullable category-specific columns to Listing.

---

## 14. Listing

### 14.1 Listing

Represents general marketplace inventory such as Buy & Sell, Housing, Cars, and
service-style marketplace posts when appropriate.

Fields:

```text
id
ownerUserId
categoryId
title
slug
description
priceAmount                  nullable
priceCurrency                default USD for launch market
priceType
condition                    nullable
status
moderationState
publicLocationId
postalCode                   nullable
latitude                     nullable
longitude                    nullable
locationPrecision
contactPreference
availabilityText             nullable
isFeatured
featuredSource               nullable
publishedAt                  nullable
expiresAt                    nullable
soldAt                       nullable
archivedAt                   nullable
deletedAt                    nullable
createdAt
updatedAt
```

Enums:

```text
ListingStatus
- DRAFT
- PENDING_REVIEW
- ACTIVE
- SOLD
- RENTED
- FILLED
- EXPIRED
- ARCHIVED
- REJECTED
- REMOVED
- SUSPENDED

ModerationState
- NOT_REVIEWED
- AUTO_CLEARED
- NEEDS_REVIEW
- UNDER_REVIEW
- APPROVED
- REJECTED
- REMOVED

PriceType
- FIXED
- NEGOTIABLE
- FREE
- CONTACT
- PER_HOUR
- PER_DAY
- PER_WEEK
- PER_MONTH
- SALARY

LocationPrecision
- CITY
- NEIGHBORHOOD
- APPROXIMATE
- EXACT_PUBLIC

ContactPreference
- IN_APP_MESSAGE
- BUSINESS_CONTACT
- EXTERNAL_APPLICATION
```

Rules:

- `slug` is mutable.
- Active discovery requires `status = ACTIVE`.
- Residential listing coordinates should be stored with enough precision for search,
  but public UI may use an approximate point.
- `EXACT_PUBLIC` should be allowed only for categories where exact address exposure is
  appropriate.

Indexes:

```text
INDEX(ownerUserId, status)
INDEX(categoryId, status, publishedAt DESC)
INDEX(publicLocationId, status, publishedAt DESC)
INDEX(priceAmount)
INDEX(status, expiresAt)
INDEX(isFeatured, status)
FULLTEXT / tsvector(title, description) as search implementation matures
```

---

## 15. Listing Images

### 15.1 ListingImage

Fields:

```text
id
listingId
storageKey
publicUrl
width
height
mimeType
fileSizeBytes
sortOrder
altText                    nullable
moderationState
createdAt
```

Constraints:

```text
UNIQUE(listingId, sortOrder)
```

Rules:

- First ordered image acts as primary image.
- Validate MIME type and actual file content.
- Store source metadata required for moderation but not unnecessary EXIF data.
- Strip privacy-sensitive metadata where appropriate.

---

## 16. Listing Attribute Values

### 16.1 ListingAttributeValue

Fields:

```text
id
listingId
attributeDefinitionId
textValue                   nullable
integerValue                nullable
decimalValue                nullable
booleanValue                nullable
dateValue                   nullable
optionValue                 nullable
multiOptionJson             nullable
createdAt
updatedAt
```

Constraint:

```text
UNIQUE(listingId, attributeDefinitionId)
```

Rule:

Exactly one typed value representation should be used according to the associated
definition.

Frequently filtered attributes may later be denormalized/indexed if performance requires.

---

## 17. Favorites

### 17.1 Favorite

Fields:

```text
id
userId
listingId
createdAt
```

Constraint:

```text
UNIQUE(userId, listingId)
```

Indexes:

```text
INDEX(userId, createdAt DESC)
INDEX(listingId)
```

---

## 18. Saved Searches

Phase 1.5.

### 18.1 SavedSearch

Fields:

```text
id
userId
name
queryText                  nullable
categoryId                 nullable
locationId                 nullable
radiusMiles                nullable
filtersJson
sort
notificationFrequency
isActive
lastNotifiedAt             nullable
createdAt
updatedAt
```

Enum:

```text
SavedSearchFrequency
- INSTANT
- DAILY
- WEEKLY
- NONE
```

Rule:

`filtersJson` should hold validated search criteria only, not arbitrary client state.

---

## 19. Conversations

### 19.1 Conversation

Fields:

```text
id
contextType
listingId                  nullable
businessId                 nullable
jobId                      nullable
eventId                    nullable
createdAt
updatedAt
lastMessageAt              nullable
```

Enum:

```text
ConversationContextType
- LISTING
- BUSINESS
- JOB
- EVENT
- SUPPORT
```

Rule:

Exactly one context reference should be populated for entity-backed conversations.

---

## 20. Conversation Participants

### 20.1 ConversationParticipant

Fields:

```text
id
conversationId
userId
joinedAt
lastReadAt                 nullable
isMuted
leftAt                     nullable
```

Constraint:

```text
UNIQUE(conversationId, userId)
```

For MVP marketplace conversations, most conversations will have two participants,
but the schema should not hard-code a two-user limit.

---

## 21. Messages

### 21.1 Message

Fields:

```text
id
conversationId
senderUserId
body
messageType
sentAt
editedAt                   nullable
deletedAt                  nullable
moderationState
```

Enum:

```text
MessageType
- TEXT
- IMAGE
- SYSTEM
```

Indexes:

```text
INDEX(conversationId, sentAt)
INDEX(senderUserId, sentAt)
```

Rules:

- Soft-delete UI behavior should not necessarily physically delete messages immediately.
- Moderation/security retention should be governed by a later policy.

---

## 22. Message Attachments

### 22.1 MessageAttachment

Fields:

```text
id
messageId
storageKey
publicUrl
mimeType
fileSizeBytes
width                      nullable
height                     nullable
moderationState
createdAt
```

---

## 23. Blocks

### 23.1 Block

Fields:

```text
id
blockerUserId
blockedUserId
createdAt
```

Constraint:

```text
UNIQUE(blockerUserId, blockedUserId)
CHECK(blockerUserId != blockedUserId)
```

Blocking must prevent supported interaction channels according to application policy.

---

## 24. Notifications

### 24.1 Notification

Fields:

```text
id
userId
type
title
body
entityType                 nullable
entityId                   nullable
isRead
readAt                     nullable
createdAt
```

Enum:

```text
NotificationType
- NEW_MESSAGE
- LISTING_APPROVED
- LISTING_REJECTED
- LISTING_EXPIRING
- SAVED_SEARCH_MATCH
- FAVORITE_UPDATE
- PRICE_CHANGE
- REVIEW_RECEIVED
- BUSINESS_INQUIRY
- MODERATION_ACTION
- SECURITY_ALERT
```

Indexes:

```text
INDEX(userId, isRead, createdAt DESC)
```

---

## 25. Notification Preferences

### 25.1 NotificationPreference

Fields:

```text
id
userId
type
inAppEnabled
emailEnabled
pushEnabled
smsEnabled
createdAt
updatedAt
```

Constraint:

```text
UNIQUE(userId, type)
```

MVP should default to in-app plus justified transactional email.

---

## 26. Reports

### 26.1 Report

Fields:

```text
id
reporterUserId
subjectType
listingId                  nullable
userId                     nullable
businessId                 nullable
messageId                  nullable
communityPostId            nullable
eventId                    nullable
reason
description                nullable
status
priority
assignedModeratorId        nullable
createdAt
updatedAt
resolvedAt                 nullable
```

Enums:

```text
ReportSubjectType
- LISTING
- USER
- BUSINESS
- MESSAGE
- COMMUNITY_POST
- EVENT

ReportReason
- SCAM
- SPAM
- PROHIBITED_ITEM
- HARASSMENT
- FRAUD
- DUPLICATE
- MISLEADING
- COPYRIGHT_IP
- OTHER

ReportStatus
- OPEN
- TRIAGED
- UNDER_REVIEW
- RESOLVED
- DISMISSED

ReportPriority
- LOW
- NORMAL
- HIGH
- URGENT
```

Rule:

Exactly one subject entity reference should correspond to `subjectType`.

---

## 27. Moderation Actions

### 27.1 ModerationAction

Fields:

```text
id
moderatorUserId
targetType
targetId
actionType
reasonCode
notes                       nullable
previousStateJson           nullable
newStateJson                nullable
createdAt
```

Enums:

```text
ModerationTargetType
- USER
- LISTING
- BUSINESS
- MESSAGE
- EVENT
- COMMUNITY_POST
- REVIEW

ModerationActionType
- APPROVE
- REJECT
- REMOVE
- RESTORE
- SUSPEND
- UNSUSPEND
- WARN
- FLAG
- UNFLAG
- VERIFY
- REVOKE_VERIFICATION
```

Every moderation action should be attributable to an actor unless it is explicitly
recorded as a system action.

---

## 28. Audit Log

### 28.1 AuditLog

Fields:

```text
id
actorUserId                 nullable
actorType
action
entityType
entityId                    nullable
ipHash                      nullable
userAgentSummary            nullable
metadataJson                nullable
createdAt
```

Enum:

```text
AuditActorType
- USER
- MODERATOR
- ADMIN
- SYSTEM
```

Rules:

- AuditLog should be append-only in normal application behavior.
- Do not store raw sensitive request bodies.
- Security-relevant metadata should be minimized and retained according to policy.

---

## 29. Business

### 29.1 Business

Fields:

```text
id
ownerUserId
name
slug
description
categoryId
status
verificationStatus
logoUrl                     nullable
coverImageUrl               nullable
publicLocationId
streetAddress               nullable
postalCode                  nullable
latitude                    nullable
longitude                   nullable
phonePublic                 nullable
emailPublic                 nullable
websiteUrl                  nullable
hoursJson                   nullable
socialLinksJson             nullable
ratingAverage               nullable
ratingCount                 default 0
createdAt
updatedAt
deletedAt                   nullable
```

Enums:

```text
BusinessStatus
- DRAFT
- PENDING_REVIEW
- ACTIVE
- SUSPENDED
- ARCHIVED
- REMOVED
```

Indexes:

```text
INDEX(categoryId, status)
INDEX(publicLocationId, status)
INDEX(name)
```

---

## 30. Business Members

### 30.1 BusinessMember

Fields:

```text
id
businessId
userId
role
invitedAt
acceptedAt                  nullable
removedAt                   nullable
```

Enum:

```text
BusinessMemberRole
- OWNER
- ADMIN
- MANAGER
- STAFF
```

Constraint:

```text
UNIQUE(businessId, userId)
```

---

## 31. Business Images

### 31.1 BusinessImage

Fields:

```text
id
businessId
storageKey
publicUrl
sortOrder
altText                     nullable
createdAt
```

---

## 32. Business Reviews

Phase 1.5 unless promoted.

### 32.1 BusinessReview

Fields:

```text
id
businessId
authorUserId
rating
body                        nullable
status
createdAt
updatedAt
deletedAt                   nullable
```

Constraint:

```text
CHECK(rating BETWEEN 1 AND 5)
```

Possible policy constraint:

```text
UNIQUE(businessId, authorUserId)
```

if only one active review per user/business is permitted.

Enum:

```text
ReviewStatus
- ACTIVE
- FLAGGED
- REMOVED
```

---

## 33. Business Review Response

### 33.1 BusinessReviewResponse

Fields:

```text
id
reviewId
businessId
authorUserId
body
createdAt
updatedAt
```

Constraint:

```text
UNIQUE(reviewId)
```

---

## 34. Jobs

### 34.1 Job

Jobs are a distinct domain.

Fields:

```text
id
ownerUserId
businessId                  nullable
title
slug
employerName
description
publicLocationId            nullable
workMode
employmentType
salaryMin                   nullable
salaryMax                   nullable
salaryCurrency              nullable
salaryPeriod                nullable
experienceText              nullable
skillsJson                  nullable
applicationMethod
applicationUrl              nullable
applicationEmail            nullable
status
moderationState
publishedAt                 nullable
expiresAt                   nullable
createdAt
updatedAt
deletedAt                   nullable
```

Enums:

```text
JobWorkMode
- ON_SITE
- HYBRID
- REMOTE

EmploymentType
- FULL_TIME
- PART_TIME
- TEMPORARY
- CONTRACT
- INTERNSHIP
- GIG
- OTHER

SalaryPeriod
- HOUR
- DAY
- WEEK
- MONTH
- YEAR

JobApplicationMethod
- IN_APP_CONTACT
- EXTERNAL_URL
- EMAIL

JobStatus
- DRAFT
- PENDING_REVIEW
- ACTIVE
- FILLED
- EXPIRED
- ARCHIVED
- REJECTED
- REMOVED
- SUSPENDED
```

Indexes:

```text
INDEX(publicLocationId, status, publishedAt DESC)
INDEX(employmentType, status)
INDEX(workMode, status)
INDEX(businessId, status)
```

---

## 35. Job Applications

Post-MVP unless explicitly enabled.

### 35.1 JobApplication

Fields:

```text
id
jobId
applicantUserId
resumeId                    nullable
coverMessage                nullable
status
createdAt
updatedAt
```

Enum:

```text
JobApplicationStatus
- SUBMITTED
- VIEWED
- SHORTLISTED
- REJECTED
- WITHDRAWN
- HIRED
```

---

## 36. Resume

Post-MVP.

### 36.1 Resume

Fields:

```text
id
userId
title
summary                     nullable
storageKey                  nullable
structuredDataJson          nullable
isDefault
createdAt
updatedAt
```

---

## 37. Events

### 37.1 Event

Fields:

```text
id
ownerUserId
businessId                  nullable
title
slug
description
categoryId                  nullable
startAt
endAt                       nullable
timezone
publicLocationId            nullable
venueName                   nullable
streetAddress               nullable
latitude                    nullable
longitude                   nullable
contactUrl                  nullable
contactEmail                nullable
status
moderationState
publishedAt                 nullable
createdAt
updatedAt
deletedAt                   nullable
```

Enums:

```text
EventStatus
- DRAFT
- PENDING_REVIEW
- ACTIVE
- CANCELLED
- COMPLETED
- ARCHIVED
- REJECTED
- REMOVED
```

Indexes:

```text
INDEX(startAt, status)
INDEX(publicLocationId, startAt)
INDEX(categoryId, startAt)
```

---

## 38. Event Images

### 38.1 EventImage

Fields:

```text
id
eventId
storageKey
publicUrl
sortOrder
altText                     nullable
createdAt
```

---

## 39. Community Posts

### 39.1 CommunityPost

Fields:

```text
id
authorUserId
communityId                 nullable
type
title                       nullable
body
publicLocationId            nullable
status
moderationState
createdAt
updatedAt
deletedAt                   nullable
```

Enums:

```text
CommunityPostType
- ANNOUNCEMENT
- RECOMMENDATION
- QUESTION
- HELP_REQUEST
- LOCAL_INFORMATION

CommunityPostStatus
- ACTIVE
- FLAGGED
- REMOVED
- ARCHIVED
```

Community features require stricter moderation and privacy controls than general listings.

---

## 40. Communities / Groups

Phase 2+.

### 40.1 Community

Fields:

```text
id
ownerUserId
name
slug
description
publicLocationId            nullable
visibility
status
createdAt
updatedAt
```

Enums:

```text
CommunityVisibility
- PUBLIC
- PRIVATE

CommunityStatus
- ACTIVE
- SUSPENDED
- ARCHIVED
```

### 40.2 CommunityMember

Fields:

```text
id
communityId
userId
role
joinedAt
status
```

Enums:

```text
CommunityMemberRole
- OWNER
- MODERATOR
- MEMBER

CommunityMemberStatus
- ACTIVE
- PENDING
- BANNED
- LEFT
```

---

## 41. Promotions

Post-MVP.

### 41.1 Promotion

Fields:

```text
id
listingId                   nullable
businessId                  nullable
jobId                       nullable
type
status
startsAt
endsAt
paymentId                   nullable
createdAt
updatedAt
```

Enums:

```text
PromotionType
- FEATURED
- BOOSTED
- URGENT
- HOMEPAGE

PromotionStatus
- PENDING
- ACTIVE
- EXPIRED
- CANCELLED
```

Rules:

- Paid promotion must be clearly distinguishable from organic ranking.
- Exactly one promotable entity should be referenced.

---

## 42. Subscriptions

Post-MVP.

### 42.1 Subscription

Fields:

```text
id
businessId                  nullable
userId                      nullable
provider
providerCustomerId          nullable
providerSubscriptionId      nullable
plan
status
currentPeriodStart
currentPeriodEnd
cancelAtPeriodEnd
createdAt
updatedAt
```

Enums:

```text
SubscriptionPlan
- BUSINESS_FREE
- BUSINESS_PRO
- BUSINESS_PREMIUM

SubscriptionStatus
- ACTIVE
- PAST_DUE
- CANCELLED
- EXPIRED
- TRIALING
```

---

## 43. Payments

Post-MVP for promotions/subscriptions only unless later product scope changes.

### 43.1 Payment

Fields:

```text
id
userId                      nullable
businessId                  nullable
provider
providerPaymentId
amount
currency
purpose
status
createdAt
updatedAt
```

Enums:

```text
PaymentPurpose
- PROMOTION
- SUBSCRIPTION
- JOB_POSTING

PaymentStatus
- PENDING
- SUCCEEDED
- FAILED
- REFUNDED
- PARTIALLY_REFUNDED
```

Important:

MVP does not process buyer-to-seller marketplace transaction payments.

---

## 44. Search Strategy

### MVP

Use PostgreSQL search capabilities.

Recommended searchable sources:

```text
Listing.title
Listing.description
Business.name
Business.description
Job.title
Job.description
Event.title
Event.description
CommunityPost.title/body
```

Use dedicated `tsvector` columns or generated search vectors when implementation
maturity justifies them.

### Later

Search can move to:

```text
Meilisearch
Typesense
OpenSearch
```

without changing authoritative relational storage.

The database remains the source of truth.

---

## 45. Recommended Indexes

### Listings

```text
(categoryId, status, publishedAt DESC)
(publicLocationId, status, publishedAt DESC)
(ownerUserId, status)
(status, expiresAt)
(priceAmount)
(isFeatured, status)
```

### Jobs

```text
(publicLocationId, status, publishedAt DESC)
(employmentType, status)
(workMode, status)
(businessId, status)
```

### Events

```text
(publicLocationId, startAt)
(status, startAt)
(categoryId, startAt)
```

### Businesses

```text
(publicLocationId, status)
(categoryId, status)
```

### Messaging

```text
(conversationId, sentAt)
(userId, isRead, createdAt DESC)      -- notifications
```

### Reports

```text
(status, priority, createdAt)
(assignedModeratorId, status)
```

Final indexes must be validated against real query plans once usage data exists.

---

## 46. Soft Delete Policy

Recommended soft-delete support:

```text
User
Listing
Business
Job
Event
CommunityPost
BusinessReview
Message
```

Soft-deleted entities should be excluded from normal queries by default.

Hard deletion may occur only according to retention policy, legal requirements, and
security/moderation needs.

---

## 47. Slug Policy

Entities with public pages may store mutable slugs:

```text
Listing.slug
Business.slug
Job.slug
Event.slug
Community.slug
```

Rules:

- Slug is not an ID.
- Stable ID is always authoritative.
- Renamed titles may update slug.
- Old slug redirects may be supported later with a `SlugRedirect` table if SEO requires.

Optional future table:

```text
SlugRedirect
id
entityType
entityId
oldSlug
newSlug
createdAt
```

---

## 48. Data Validation Rules

Examples of database/application invariants:

```text
priceAmount >= 0
salaryMin >= 0
salaryMax >= salaryMin
rating BETWEEN 1 AND 5
startAt <= endAt when endAt exists
blockerUserId != blockedUserId
```

Only supported categories may accept attributes defined for that category.

Only authorized owners/business members may edit owned domain records.

Published entities must satisfy all required category/domain fields.

---

## 49. Privacy Rules

Sensitive data should be treated as private by default.

Do not expose:

- Email addresses
- Phone numbers
- Password hashes
- Session/token values
- Precise residential location
- Internal moderation metadata
- IP/device risk signals
- Private reports
- Audit logs

Public APIs must use explicit DTO/serializer layers rather than returning raw ORM models.

---

## 50. Ownership Rules

### Listing

```text
Listing.ownerUserId -> User
```

Only owner or authorized moderator/admin may mutate.

### Business

```text
Business.ownerUserId -> User
BusinessMember -> delegated access
```

### Job

Owned by posting user and optionally associated business.

### Event

Owned by posting user and optionally associated business.

### CommunityPost

Owned by author; moderation overrides apply.

### Conversation

Only active participants may access.

---

## 51. Deletion & Referential Behavior

Use conservative relational behavior.

Recommended:

- Avoid broad cascading hard deletes for user-generated content.
- Use `RESTRICT` or soft-deletion where records are needed for moderation/audit.
- Child media may cascade only when the parent is permanently purged under retention policy.
- Favorites may cascade when a listing is permanently purged.
- AuditLog and ModerationAction should not cascade away when a target is deleted.

---

## 52. Analytics Event Storage

Do not force high-volume product analytics into the core transactional schema.

Application analytics should normally go to an analytics platform or event pipeline.

The relational database may store operational aggregates where needed, but not raw
high-volume clickstream indefinitely.

Core product event examples:

```text
search_performed
listing_viewed
listing_favorited
message_started
listing_posted
listing_published
business_viewed
business_contacted
job_viewed
event_viewed
report_submitted
```

---

## 53. Seed Data Requirements

Initial database seeding should include:

### Roles

```text
REGISTERED_USER
BUSINESS_ACCOUNT
MODERATOR
ADMIN
SUPER_ADMIN
```

### Launch marketplace region

```text
DMV
```

### Geographic seed

At minimum:

```text
United States
Washington, DC
Maryland
Virginia
Silver Spring
Bethesda
Hyattsville
Rockville
Arlington
Alexandria
```

plus additional DMV cities/neighborhoods required by the product.

### Core categories

```text
Buy & Sell
Housing
Cars
Jobs
Services
Events
Businesses
Community
```

and their approved PRD subcategories.

### Attribute definitions

Seed common attribute definitions for:

```text
Cars
Housing
Electronics
Jobs
```

before implementing category-specific forms.

---

## 54. Suggested Prisma Module Boundaries

Recommended schema/domain organization conceptually:

```text
auth
users
locations
categories
listings
search
favorites
messaging
notifications
moderation
businesses
jobs
events
community
billing
audit
```

Even if Prisma uses a single schema file initially, application repository/service
modules should preserve these boundaries.

---

## 55. High-Level Entity Relationship Map

```text
User
├── 1 Profile
├── * UserRole ─── Role
├── * Verification
├── * Listing
├── * Favorite ─── Listing
├── * SavedSearch
├── * ConversationParticipant ─── Conversation
├── * Message
├── * Notification
├── * Block (blocker/blocked)
├── * Report
├── * BusinessMember ─── Business
├── * BusinessReview
├── * Job
├── * Event
└── * CommunityPost

Location
├── * Location children
├── * Listing
├── * Business
├── * Job
├── * Event
└── * CommunityPost

MarketplaceRegion
└── * MarketplaceRegionLocation ─── Location

Category
├── * Category children
├── * CategoryAttributeDefinition
├── * Listing
├── * Business
├── * Event
└── * Job/service taxonomy where applicable

Listing
├── * ListingImage
├── * ListingAttributeValue
├── * Favorite
├── * Conversation
├── * Report
└── * Promotion

Business
├── * BusinessMember
├── * BusinessImage
├── * BusinessReview
├── * Job
├── * Event
├── * Conversation
└── * Promotion

Conversation
├── * ConversationParticipant
└── * Message
    └── * MessageAttachment

Report
└── * ModerationAction / related audit trail

AuditLog
└── records sensitive user/admin/system actions
```

---

## 56. MVP Tables

Required for MVP:

```text
User
Profile
Role
UserRole
Verification

Location
MarketplaceRegion
MarketplaceRegionLocation

Category
CategoryAttributeDefinition
CategoryAttributeOption

Listing
ListingImage
ListingAttributeValue
Favorite

Conversation
ConversationParticipant
Message
MessageAttachment

Notification
NotificationPreference

Report
ModerationAction
Block
AuditLog

Job
```

May be included in launch if the associated product surfaces ship:

```text
Business
BusinessMember
BusinessImage
Event
EventImage
CommunityPost
```

---

## 57. Phase 1.5 Tables

```text
SavedSearch
BusinessReview
BusinessReviewResponse
```

Potentially richer:

```text
Business verification support
Seller rating support
Map/geospatial extensions
```

---

## 58. Phase 2+ Tables

```text
Community
CommunityMember
JobApplication
Resume
Promotion
Subscription
Payment
SlugRedirect
```

Additional AI/risk-signal tables should be introduced only after the Trust & Safety and
AI specifications define their legal, privacy, explainability, and retention requirements.

---

## 59. Database Migration Rules

Every schema change must:

1. Be represented by a migration.
2. Be reversible where practical.
3. Avoid destructive production changes without a migration plan.
4. Include backfill steps when adding required data.
5. Be tested against seed data.
6. Be reviewed for indexing/query impact.
7. Be reviewed for privacy/security impact.
8. Avoid unrelated refactoring.

---

## 60. Acceptance Criteria for Database Foundation

The database foundation is complete when:

- Prisma schema models MVP entities.
- All migrations run cleanly on a fresh database.
- Seed data creates roles, launch locations, categories, and key attributes.
- Foreign keys and uniqueness constraints are enforced.
- Listing lifecycle states are explicit.
- Public location does not require exposing precise address.
- Listing category-specific attributes can be stored and validated.
- Messaging has conversation context.
- Reporting/moderation actions are auditable.
- Favorites cannot duplicate.
- Protected user data is not exposed through normal data serializers.
- Core search/filter columns are indexed.
- Unit/integration tests cover key relational invariants.

---

## 61. Decisions Locked by This Document

Unless superseded by a later approved specification:

1. PostgreSQL is the authoritative relational database.
2. Prisma is the primary ORM.
3. Stable UUID-style IDs are used for core entities.
4. Listing, Business, Job, Event, and CommunityPost remain distinct domain models.
5. Geography is hierarchical and normalized.
6. MarketplaceRegion supports cross-jurisdiction markets such as DMV.
7. Category-specific listing attributes use definitions + typed values.
8. Listing lifecycle uses explicit statuses.
9. Messaging uses Conversation + Participant + Message.
10. Reports and moderation actions are auditable.
11. Sensitive/private fields are never exposed through raw ORM serialization.
12. Buyer-to-seller marketplace payments are not part of MVP.

---

## 62. Next Deliverable

After approval of this database specification, create:

**GuzoMarket UI/UX Design System v1.0**

That document should convert the approved homepage direction into implementation-ready
tokens, typography, spacing, layout grids, breakpoints, color roles, iconography,
buttons, inputs, cards, forms, navigation, filters, dialogs, tables, empty/loading/error
states, accessibility rules, mobile behavior, and reusable page templates.

---

**End of GuzoMarket Database Schema & Entity Relationship Specification v1.0**
