# GuzoMarket — API & Backend Specification v1.0

**Project:** GuzoMarket  
**Document:** API & Backend Specification  
**Version:** 1.0  
**Status:** Implementation baseline  
**Primary stack:** Next.js + React + TypeScript + PostgreSQL + Prisma  
**Source documents:** Master PRD v1.1; Information Architecture & Complete Sitemap v1.0; Database Schema & ER Specification v1.0; UI/UX Design System v1.0  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

## 1. Purpose

This specification defines the server-side architecture and application contracts for
GuzoMarket.

It covers:

- Authentication
- Authorization
- API conventions
- Server Actions vs route handlers
- Validation
- Listing CRUD
- Images and file handling
- Search
- Favorites
- Messaging
- Notifications
- Reports and moderation
- Jobs
- Businesses
- Events
- Community
- Admin
- Error contracts
- Pagination
- Rate limiting
- Audit logging
- Background processing
- Transactional email
- Security boundaries
- Observability
- Testing expectations

The objective is to ensure that backend behavior is predictable, secure, and aligned with
the product architecture before implementation begins.

---

## 2. Backend Principles

1. **Server-authoritative**
   - Never trust client-side validation or role claims.
   - All state-changing actions are revalidated on the server.

2. **Least privilege**
   - Users may access only the resources they own or are explicitly allowed to access.

3. **Stable domain boundaries**
   - Listings, Jobs, Businesses, Events, Community, Messaging, Moderation, and Accounts
     remain separate feature modules.

4. **Typed contracts**
   - Request and response types must be defined in TypeScript.
   - Prisma models must not be exposed directly to the client.

5. **Explicit errors**
   - Errors use consistent codes and user-safe messages.

6. **Idempotency where needed**
   - Publishing, payments, uploads, and retryable background work should avoid duplicate
     side effects.

7. **Auditable privileged actions**
   - Moderator/admin/security-sensitive actions must be recorded.

8. **Progressive complexity**
   - Use the simplest production-safe architecture for MVP.
   - Do not add queues, microservices, or external search engines unless needed.

---

## 3. Recommended Application Architecture

Conceptual structure:

```text
app/
  (public)/
  (auth)/
  account/
  admin/
  api/

features/
  auth/
  users/
  locations/
  categories/
  listings/
  search/
  favorites/
  messaging/
  notifications/
  jobs/
  businesses/
  events/
  community/
  moderation/
  admin/

server/
  auth/
  db/
  services/
  policies/
  validation/
  rate-limit/
  uploads/
  email/
  jobs/
  audit/

lib/
  errors/
  permissions/
  pagination/
  security/
  formatting/

db/
  prisma/
  migrations/
  seeds/
```

Avoid a single generic `api.ts` or `services.ts` file containing unrelated domain logic.

---

## 4. Server Actions vs Route Handlers

### Use Server Actions for

Authenticated first-party form mutations where no external API contract is required:

- Profile update
- Listing draft create/update
- Listing publish
- Favorite toggle
- Account preference changes
- Basic moderation actions
- Business/profile form updates

### Use Route Handlers for

Cases requiring standard HTTP semantics, file transfer, external integration, or reusable
client contracts:

- Search endpoints
- Image upload signatures/processing
- Messaging polling/streaming endpoints
- Webhook receivers
- Public read APIs if introduced
- External application integrations
- Health endpoints

### Rule

Business logic belongs in domain services, not inside Server Actions or route handlers.

Example:

```text
UI
→ Server Action / Route Handler
→ Validation
→ Authorization policy
→ Domain service
→ Prisma transaction
→ Audit / notification / side effects
```

---

## 5. API Conventions

Base concept:

```text
/api/v1/...
```

Internal Server Actions do not require an HTTP version prefix, but route-handler APIs should
be versionable when they become durable contracts.

### Request

Use JSON unless uploading binary files.

```json
{
  "field": "value"
}
```

### Success response

```json
{
  "data": {},
  "meta": {}
}
```

### Error response

```json
{
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "Listing not found.",
    "fieldErrors": {}
  }
}
```

Do not return:
- Stack traces
- Prisma errors
- SQL errors
- Secrets
- Internal moderation details

---

## 6. Error Code Convention

Use uppercase stable machine-readable codes.

Examples:

```text
UNAUTHENTICATED
FORBIDDEN
VALIDATION_ERROR
RATE_LIMITED
NOT_FOUND
CONFLICT
INTERNAL_ERROR

EMAIL_ALREADY_EXISTS
EMAIL_NOT_VERIFIED

LISTING_NOT_FOUND
LISTING_NOT_EDITABLE
LISTING_ALREADY_COMPLETED
INVALID_LISTING_STATUS

CONVERSATION_NOT_FOUND
MESSAGE_BLOCKED

REPORT_ALREADY_SUBMITTED
MODERATION_ACTION_NOT_ALLOWED
```

HTTP status mapping:

```text
400 validation / bad request
401 unauthenticated
403 forbidden
404 not found
409 conflict
422 semantic validation where useful
429 rate limited
500 unexpected server failure
```

---

## 7. Validation

Recommended schema validation:

```text
Zod
```

Use shared validation schemas where client and server constraints overlap, but server
validation remains authoritative.

Validate:

- String length
- Required fields
- Enum values
- Price ranges
- Supported currency
- Category ownership
- Attribute compatibility
- Image type/size/count
- Location validity
- Message length
- Report reason
- URL safety
- Date ordering
- Status transition legality

Do not accept arbitrary JSON structures without validating their schema.

---

## 8. Authentication

MVP required:

- Email registration
- Email verification
- Login
- Logout
- Password reset
- Secure sessions
- Account deletion

Potential implementation:

```text
Auth.js or equivalent production-ready auth library
```

Authentication provider choice may be finalized during implementation, but must support
the security requirements in this document.

---

## 9. Registration Flow

Conceptual endpoint/action:

```text
POST /api/v1/auth/register
```

Input:

```text
email
password
displayName
```

Backend steps:

1. Normalize email.
2. Validate password policy.
3. Check uniqueness.
4. Hash password.
5. Create User + Profile in transaction.
6. Create email verification token.
7. Send verification email.
8. Audit account creation.
9. Return safe account state.

Do not automatically expose authenticated marketplace mutations until verification policy
permits them.

---

## 10. Email Verification

Flow:

```text
registration
→ token created
→ email delivered
→ verification endpoint
→ token validated
→ User.emailVerifiedAt set
→ token invalidated
```

Requirements:

- Single-use token
- Expiration
- Hashed token storage where practical
- Rate limit resend
- No account enumeration through response wording

---

## 11. Login

Input:

```text
email
password
```

Security:

- Rate limit by account and network signals where appropriate.
- Use generic invalid-credentials response.
- Record meaningful security events.
- Do not log plaintext credentials.
- Consider progressively stronger controls for suspicious attempts.

---

## 12. Password Reset

Flow:

```text
request reset
→ generic response
→ email token
→ reset page
→ new password
→ revoke token
→ optionally revoke existing sessions
```

Password-reset tokens must be:
- Expiring
- Single-use
- Unpredictable
- Stored securely

---

## 13. Sessions

Sessions must support:

- Secure cookies
- HTTP-only
- SameSite appropriate to architecture
- Secure in production
- Session revocation
- Expiration
- Account suspension enforcement

Authentication state must be checked on every protected server mutation.

---

## 14. Authorization Policy Layer

Create explicit policy helpers.

Examples:

```text
canViewListing(user, listing)
canEditListing(user, listing)
canPublishListing(user, listing)
canMessageUser(user, target)
canManageBusiness(user, business)
canModerateReport(user, report)
canAccessAdmin(user)
```

Avoid scattered conditionals such as:

```text
if (user.role === "admin")
```

throughout controllers/components.

---

## 15. Role Rules

### Guest

Can:
- Browse
- Search
- View public profiles/businesses/events

Cannot:
- Post
- Message
- Save
- Manage account
- Access moderation/admin

### Registered User

Can:
- Create/manage owned content
- Favorite
- Message
- Report
- Block
- Manage profile

### Business Member

Can:
- Manage business resources according to BusinessMember role

### Moderator

Can:
- Review reports
- Review flagged content
- Take permitted moderation actions

### Admin

Can:
- Manage users, categories, locations, listings, reports, and product administration

### Super Admin

Full authorized system administration.

---

## 16. CSRF & Mutation Protection

Where cookie-based authentication is used:

- Use framework/library CSRF protections as applicable.
- Mutations must be same-origin unless explicitly designed otherwise.
- Validate Origin/Host for sensitive endpoints where appropriate.
- Do not expose privileged mutations via GET.

---

## 17. Listing Service

Primary operations:

```text
createDraft
getListing
getOwnedListing
updateDraft
publishListing
markSold
markRented
archiveListing
renewListing
deleteListing
moderateListing
```

---

## 18. Create Listing Draft

Conceptual action:

```text
createListingDraft(input)
```

Minimum input:

```text
categoryId
```

Backend:

1. Authenticate.
2. Verify category active.
3. Create `DRAFT` listing owned by user.
4. Return draft ID.
5. Audit creation if needed.

The user may progressively populate the draft.

---

## 19. Update Listing

Conceptual:

```text
updateListing(listingId, patch)
```

Rules:

- User must own listing or have elevated authorization.
- Only editable lifecycle states may be changed by the owner.
- Category-specific attributes must match CategoryAttributeDefinition.
- Price/location/category constraints must validate.
- Owner cannot directly set moderation state.
- Certain edits to active content may trigger re-review.

---

## 20. Publish Listing

Conceptual:

```text
publishListing(listingId)
```

Steps:

1. Authenticate owner.
2. Load listing + required attributes/images.
3. Validate listing completeness.
4. Run basic risk checks.
5. Set status according to moderation policy:
   - `PENDING_REVIEW`
   - or `ACTIVE` if policy permits auto-clear
6. Set `publishedAt` only when active.
7. Write moderation/risk metadata as allowed.
8. Notify user of resulting status.
9. Audit transition.

Use a database transaction for critical state changes.

---

## 21. Listing Status Transitions

Allowed owner-driven examples:

```text
DRAFT → PENDING_REVIEW
ACTIVE → SOLD
ACTIVE → RENTED
ACTIVE → ARCHIVED
EXPIRED → DRAFT/renewal flow
```

Moderator/system examples:

```text
PENDING_REVIEW → ACTIVE
PENDING_REVIEW → REJECTED
ACTIVE → SUSPENDED
ACTIVE → REMOVED
SUSPENDED → ACTIVE
```

Reject illegal transitions server-side.

---

## 22. Listing Read APIs

Conceptual:

```text
GET /api/v1/listings/{id}
GET /api/v1/listings/{id}/similar
GET /api/v1/users/{userId}/listings
```

Public read response must omit:

- Private coordinates beyond allowed precision
- Owner email/phone
- Internal moderation state
- Risk scores
- Admin notes

---

## 23. Image Upload Architecture

Recommended flow:

```text
client requests upload authorization
→ server validates user/context
→ client uploads to object storage
→ server finalizes attachment
→ image processing/validation
→ ListingImage persisted
```

Use S3-compatible object storage.

Do not proxy large image bytes through the application server unless required.

---

## 24. Upload Validation

Validate:

- Maximum image count
- MIME allowlist
- Actual file signature
- File size
- Dimensions where useful
- Ownership of target listing
- Storage key isolation
- Malware/content checks where applicable

Recommended accepted MVP image formats:

```text
JPEG
PNG
WebP
HEIC/HEIF only if server pipeline reliably converts it
```

Strip sensitive EXIF metadata where appropriate.

---

## 25. Search API

Conceptual:

```text
GET /api/v1/search
```

Parameters:

```text
q
domain
category
location
radius
minPrice
maxPrice
sort
cursor
limit
```

Category-specific filters may extend query parameters.

Search must validate all input and cap maximum result sizes.

---

## 26. Search Implementation — MVP

Source of truth: PostgreSQL.

Use:

- Normalized relational filters
- Indexed columns
- PostgreSQL full-text search where useful
- Location filtering
- Deterministic sorting

Do not introduce an external search engine until product volume or relevance requirements
justify it.

---

## 27. Search Ranking

MVP "Relevant/Recommended" may combine:

```text
text relevance
recency
geographic relevance
listing quality/completeness
featured treatment
```

Paid/featured ranking must remain distinguishable in UI and logic.

Do not call a ranking personalized AI unless it actually is.

---

## 28. Search Pagination

Prefer cursor pagination for large changing feeds.

Response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": "opaque-value",
    "hasMore": true
  }
}
```

Offset pagination is acceptable for small admin tables and fixed result sets.

Cursor values must be opaque to clients.

---

## 29. Favorites

Actions:

```text
favoriteListing(listingId)
unfavoriteListing(listingId)
getFavorites(cursor)
```

Rules:

- Authentication required.
- Unique `(userId, listingId)`.
- Favoriting removed/non-viewable content should fail safely.
- Toggle endpoints should be idempotent where practical.

---

## 30. Saved Searches

Phase 1.5.

Operations:

```text
createSavedSearch
updateSavedSearch
deleteSavedSearch
listSavedSearches
runSavedSearchNotifications
```

Background job evaluates matching content according to frequency.

---

## 31. Messaging Service

Core operations:

```text
startConversation
listConversations
getConversation
sendMessage
markConversationRead
blockParticipant
reportConversation/message
```

Authentication required.

---

## 32. Start Conversation

Input:

```text
contextType
contextId
```

Backend:

1. Authenticate.
2. Resolve context.
3. Verify context can receive messages.
4. Resolve intended recipient.
5. Check block relationships.
6. Reuse existing context-participant conversation where product rules prefer.
7. Create conversation + participants otherwise.

Do not expose seller email or phone automatically.

---

## 33. Send Message

Input:

```text
conversationId
body
attachmentIds[]
```

Rules:

- Sender must be active participant.
- Check blocks.
- Validate message length.
- Sanitize unsafe content for rendering.
- Attachments must belong to sender/upload flow.
- Create Message.
- Update `Conversation.lastMessageAt`.
- Create recipient notification.
- Trigger transactional email only according to preferences/rate limits.

Use a transaction where consistency requires it.

---

## 34. Messaging Delivery

MVP may use:

- Normal request/response
- Optimistic UI
- Polling/revalidation

Later:

- WebSockets
- Server-Sent Events
- Managed realtime service

Do not require realtime infrastructure for the initial marketplace launch.

---

## 35. Blocking

When User A blocks User B:

- Prevent new supported conversations.
- Prevent sending messages in existing conversations as policy defines.
- Hide or restrict profile interactions where appropriate.
- Do not notify blocked user of the block itself unless required by policy.

Blocking behavior must be enforced server-side.

---

## 36. Notifications Service

Core:

```text
createNotification
listNotifications
markRead
markAllRead
getPreferences
updatePreferences
```

Notification creation should be centralized rather than manually inserted by every UI
handler.

---

## 37. Transactional Email

Email provider must support:

- Verification
- Password reset
- Important listing status
- Message notification summaries/alerts
- Security alerts

Email sending should go through a dedicated service:

```text
EmailService.sendVerification(...)
EmailService.sendPasswordReset(...)
EmailService.sendListingApproved(...)
```

Templates should not contain sensitive data unnecessarily.

---

## 38. Reports

Action:

```text
submitReport(input)
```

Input:

```text
subjectType
subjectId
reason
description?
```

Rules:

- Authentication requirement may vary by report type, but MVP should generally require a
  logged-in user for abuse resistance.
- Validate target exists.
- Prevent obvious duplicate report spam.
- Create Report.
- Optionally increase risk/triage signals.
- Notify moderation queue.
- Return a neutral success confirmation.

Reporter must not receive private moderator notes.

---

## 39. Moderation Queue

Admin/moderator operations:

```text
listReports
getReport
assignReport
takeModerationAction
resolveReport
dismissReport
```

Filters:

```text
status
priority
reason
subjectType
assignedModerator
createdAt
```

---

## 40. Moderation Action Service

Conceptual:

```text
applyModerationAction({
  actorUserId,
  targetType,
  targetId,
  actionType,
  reasonCode,
  notes
})
```

Must:

1. Verify moderator permission.
2. Load target.
3. Validate action allowed.
4. Record previous state.
5. Apply state change transactionally.
6. Create ModerationAction.
7. Create AuditLog.
8. Notify affected user where appropriate.

No silent privileged mutations.

---

## 41. User Suspension

Suspension must affect:

- Login/session access according to policy
- New postings
- Messaging
- Business management
- Existing content visibility as moderation policy defines

Suspension is not the same as deletion.

---

## 42. Admin User APIs

Conceptual:

```text
GET /api/v1/admin/users
GET /api/v1/admin/users/{id}
POST /api/v1/admin/users/{id}/suspend
POST /api/v1/admin/users/{id}/restore
```

Every privileged write requires:
- Authorized role
- Validation
- Reason where applicable
- AuditLog

---

## 43. Category Administration

Operations:

```text
createCategory
updateCategory
disableCategory
reorderCategory
createAttributeDefinition
updateAttributeDefinition
```

Rules:

- Disabling category should not orphan historical content.
- Existing listings retain category references.
- Attribute definition changes must consider existing values.

---

## 44. Location Administration

Operations:

```text
createLocation
updateLocation
disableLocation
assignMarketplaceRegion
```

Do not physically delete locations referenced by public content without a migration strategy.

---

## 45. Jobs Service

Core operations:

```text
createJobDraft
updateJob
publishJob
getJob
searchJobs
markJobFilled
archiveJob
```

Rules mirror listing lifecycle where appropriate but use Job-specific validation.

---

## 46. Job Application Behavior

MVP:

Supported application methods may be:

```text
IN_APP_CONTACT
EXTERNAL_URL
EMAIL
```

The backend must validate external URLs and safe schemes.

Full JobApplication/Resume flows remain post-MVP unless promoted into scope.

---

## 47. Businesses Service

Core:

```text
createBusiness
updateBusiness
getBusiness
searchBusinesses
inviteBusinessMember
updateBusinessMember
removeBusinessMember
```

Authorization derives from BusinessMember role.

Only approved public fields are exposed to guests.

---

## 48. Business Membership Permissions

Suggested:

### OWNER
- Full business management
- Member management
- Verification/subscription ownership

### ADMIN
- Manage profile/content
- Manage members except ownership transfer

### MANAGER
- Manage profile/listings/services/messages

### STAFF
- Limited operational access

Exact permissions should be encoded in policy helpers, not UI assumptions.

---

## 49. Business Reviews

Phase 1.5.

Operations:

```text
createReview
updateReview
deleteReview
respondToReview
reportReview
moderateReview
```

Review abuse controls required before enabling broadly.

---

## 50. Events Service

Core:

```text
createEvent
updateEvent
publishEvent
getEvent
searchEvents
cancelEvent
archiveEvent
```

Validate:

- start/end dates
- venue/location rules
- organizer ownership
- status transitions

---

## 51. Community Service

Core early operations:

```text
createCommunityPost
updateCommunityPost
deleteCommunityPost
listCommunityPosts
reportCommunityPost
```

Phase 2+:

```text
createCommunity
joinCommunity
leaveCommunity
manageMembership
```

Community content should have stronger rate limits/moderation controls.

---

## 52. Rate Limiting

Rate limit at minimum:

- Registration
- Login
- Password reset
- Verification resend
- Listing creation/publish
- Messaging
- Report submission
- Search abuse
- Upload authorization
- Admin sensitive mutations

Rate limiting can use:

- In-memory only for local development
- Redis/managed key-value store for production

Limits should be configurable.

---

## 53. Abuse Controls

Potential signals:

- Rapid account creation
- High-volume posting
- Duplicate listing text
- Duplicate images
- Repeated report patterns
- Suspicious links
- Messaging spam
- Excessive failed login attempts

MVP may use rules-based controls.

AI may assist later but must not make irreversible high-impact decisions without appropriate
human review.

---

## 54. URL & Link Safety

For user-submitted URLs:

- Allow only approved schemes (`https`, possibly `http` where justified).
- Reject `javascript:` and unsafe schemes.
- Consider redirect/interstitial policy for external links.
- Sanitize rendered text and links.
- Use `rel` attributes where appropriate for external user content.

---

## 55. Database Transactions

Use transactions for multi-step operations requiring consistency.

Examples:

- Register User + Profile
- Publish listing + state/audit
- Start conversation + participants
- Send message + conversation timestamp + notification
- Moderation state change + ModerationAction + AuditLog
- Business ownership/member changes

Do not wrap long external network operations inside database transactions.

---

## 56. Background Jobs

MVP background tasks may include:

- Email sending
- Listing expiration
- Notification fan-out
- Image processing
- Cleanup of abandoned uploads
- Saved search delivery [Phase 1.5]
- Risk checks

Start with a reliable framework/provider appropriate for Next.js deployment.

Do not build a custom queue system unless necessary.

---

## 57. Listing Expiration Job

Recurring process:

```text
find ACTIVE listings where expiresAt <= now
→ set EXPIRED
→ create notification
→ audit/system record if required
```

Must be idempotent.

---

## 58. Image Processing Jobs

Potential processing:

- Resize
- Optimize
- Generate thumbnails
- Strip EXIF
- Convert unsupported source formats
- Content/risk scanning

Store original only when justified; otherwise retain optimized safe derivatives according
to policy.

---

## 59. Caching

Good cache candidates:

- Category taxonomy
- Location hierarchy
- Public homepage modules
- Public business/event/listing reads where freshness permits

Do not cache:

- Private account data across users
- Permission decisions without safe keys/invalidation
- Sensitive moderation data in public caches

Use framework caching carefully with authenticated routes.

---

## 60. Revalidation

After mutation, invalidate/revalidate affected surfaces.

Examples:

Favorite:
```text
/saved
/listing detail favorite state
```

Listing publish:
```text
owner listing dashboard
category pages
search
homepage modules
listing detail
```

Business update:
```text
business detail
business search
owner account
```

---

## 61. Logging

Structured server logs should include:

- Request correlation ID
- Route/action name
- Safe user identifier where appropriate
- Result status
- Duration
- Error code
- Background job outcome

Do not log:

- Passwords
- Full authentication tokens
- Sensitive report evidence unnecessarily
- Private message bodies by default
- Full payment details
- Raw identity verification documents

---

## 62. Audit Logging

AuditLog is distinct from normal application logs.

Audit events include:

- Account suspension/restoration
- Verification changes
- Listing removal/restoration
- Report resolution
- Category/location admin changes
- Business ownership changes
- Permission/role changes
- Sensitive security operations

Audit logs should be append-only in normal application behavior.

---

## 63. Observability

Production should track:

- Error rate
- Response latency
- Database latency
- Search latency
- Upload failures
- Email failures
- Background job failures
- Authentication failures
- Message-send failures
- Moderation queue volume

Use an error-monitoring/observability provider appropriate to deployment.

---

## 64. Health Checks

Provide an internal/public-safe endpoint where deployment platform needs it:

```text
GET /api/health
```

Return only basic status.

Do not expose:
- Database credentials
- Version secrets
- Internal topology

---

## 65. Pagination Standards

Default page/cursor limit:

```text
20
```

Suggested maximum:

```text
50
```

Admin tables may use separate capped values.

Never allow arbitrary unbounded result sizes.

---

## 66. Data Transfer Objects

Never serialize raw Prisma objects directly into public components/APIs.

Example:

```text
ListingPublicDTO
ListingOwnerDTO
ListingAdminDTO
```

Each has intentionally different fields.

Public DTO excludes:
- exact private coordinates
- internal moderation state
- owner private contact
- audit metadata

---

## 67. Security Headers

Production app should configure appropriate:

- Content Security Policy
- X-Content-Type-Options
- Referrer-Policy
- Frame-ancestors / clickjacking protection
- Permissions-Policy
- HSTS where deployment supports full HTTPS

Exact CSP depends on analytics, storage, maps, and third-party providers.

---

## 68. XSS Protection

User-generated content must be treated as untrusted.

- Escape plain text by default.
- Avoid rendering arbitrary HTML.
- If rich text is later supported, sanitize server-side with strict allowlist.
- Validate URLs.
- Prevent unsafe SVG/script uploads.

---

## 69. SQL Injection

Use Prisma parameterization and avoid unsafe raw SQL.

If raw SQL is needed:

- Use parameterized APIs.
- Centralize and review queries.
- Never concatenate user input into SQL.

---

## 70. Secrets

Secrets belong in deployment environment/secret management.

Examples:

- Database URL
- Email provider keys
- Storage keys
- Auth secrets
- Maps keys
- AI keys
- Payment keys [future]

Never commit them to source control.

---

## 71. Configuration

Use typed environment validation at startup.

Example groups:

```text
DATABASE
AUTH
EMAIL
STORAGE
APP_URL
MAPS
RATE_LIMIT
OBSERVABILITY
```

Fail fast in production when required configuration is missing.

---

## 72. External Providers

Abstract providers behind service interfaces.

Examples:

```text
StorageProvider
EmailProvider
MapProvider
SearchProvider
AIProvider
PaymentProvider
```

This follows the PRD requirement that providers be replaceable without rewriting domain
logic.

---

## 73. Email Provider Interface

Concept:

```text
sendEmail({
  to,
  template,
  variables,
  idempotencyKey?
})
```

Application features should not directly call vendor-specific SDKs throughout the codebase.

---

## 74. Storage Provider Interface

Concept:

```text
createUploadIntent
finalizeUpload
deleteObject
getPublicUrl
```

Storage keys should be generated by the server, not arbitrary user input.

---

## 75. Map/Geocoding Interface

Concept:

```text
geocode(query)
reverseGeocode(lat, lng)
normalizeLocation(result)
```

Persist normalized GuzoMarket Location references separate from provider-specific IDs where
practical.

---

## 76. Search Provider Interface

Even while using PostgreSQL, define domain search through a service abstraction:

```text
searchListings(criteria)
searchJobs(criteria)
searchBusinesses(criteria)
```

This makes later migration to Meilisearch/Typesense/OpenSearch manageable.

---

## 77. AI Provider Boundary

AI features are post-MVP unless specifically promoted.

AI service must be isolated:

```text
suggestListingContent
parseNaturalLanguageSearch
scoreModerationRisk
```

Never allow AI provider output to bypass:
- validation
- permissions
- moderation policies
- human-review requirements

---

## 78. API Security Testing

Test at minimum:

- Unauthorized access
- Cross-user object access
- Privilege escalation
- Invalid lifecycle transitions
- Rate limits
- Upload type bypass
- Report abuse
- Block bypass
- Admin-route access
- Unsafe URL submissions
- Injection attempts
- Session invalidation

---

## 79. Unit Testing

Unit-test:

- Validation schemas
- Permission policies
- Listing transitions
- Search criteria parsing
- Business member permissions
- Moderation action legality
- Notification preference logic

---

## 80. Integration Testing

Integration-test:

- Registration/login
- Listing creation/publish
- Favorites
- Search filters
- Conversation creation
- Message send
- Blocking
- Reporting
- Moderator resolution
- Business/member permissions
- Job publish
- Event publish

Use a real test database where practical.

---

## 81. End-to-End Testing

Critical E2E journeys:

### Buyer
```text
Browse → Search → Listing → Login → Favorite → Message
```

### Seller
```text
Register → Verify → Post → Publish → Receive message → Mark sold
```

### Moderator
```text
Login → Reports → Review → Remove content → Audit result
```

---

## 82. API Documentation

For durable route-handler APIs:

- Document inputs
- Document outputs
- Document auth requirement
- Document error codes
- Document pagination
- Document rate limits where relevant

OpenAPI may be introduced when route-handler surface becomes large enough to justify it.

Server Actions should still have typed service contracts and tests.

---

## 83. MVP Backend Scope

Required:

```text
Auth
Profiles
Locations
Categories
Listings
Listing images
Dynamic listing attributes
Search
Favorites
Messaging
Notifications
Reporting
Blocking
Basic moderation
Admin
Jobs
Audit logging
Transactional email
```

May ship if ready:

```text
Basic Businesses
Basic Events
Basic Community Posts
```

---

## 84. Phase 1.5 Backend Scope

```text
Saved searches
Search alerts
Map search
Phone verification
Seller ratings
Business reviews
Richer business directory
Richer events
```

---

## 85. Phase 2+ Backend Scope

```text
Community groups
Job applications/resumes
Paid promotions
Subscriptions
AI listing assistant
AI search
Advanced moderation assistance
Recommendations
Native app APIs
Marketplace payments/delivery only after dedicated design
```

---

## 86. Acceptance Criteria

The backend foundation is complete when:

- Authentication and sessions are production-safe.
- Server authorization prevents cross-user data access.
- Listing CRUD respects lifecycle and category validation.
- Uploads are validated and isolated.
- Search is indexed and bounded.
- Favorites are idempotent.
- Messaging enforces participation and block rules.
- Notifications use centralized creation.
- Reports feed an auditable moderation workflow.
- Admin actions are permission-checked and audited.
- Public DTOs never expose private location/contact/moderation fields.
- Rate limiting exists on abuse-sensitive endpoints.
- Errors are consistent and user-safe.
- Critical domain services have tests.
- Fresh database migrations + seed + application startup work end-to-end.

---

## 87. Decisions Locked by This Document

Unless superseded later:

1. Business logic lives in domain services, not UI handlers.
2. Server Actions are preferred for first-party authenticated form mutations.
3. Route handlers are used for reusable HTTP/file/integration contracts.
4. Zod-style schema validation is required server-side.
5. Authorization uses explicit policy helpers.
6. Raw Prisma models are not public API contracts.
7. PostgreSQL powers MVP search.
8. Messaging does not require realtime infrastructure for MVP.
9. File uploads use direct object-storage flow where practical.
10. Privileged moderation/admin actions are audited.
11. Background tasks must be idempotent.
12. External providers are abstracted behind interfaces.
13. Buyer-to-seller marketplace payments remain outside MVP.

---

## 88. Next Deliverable

After approval of this API & Backend Specification, create:

**GuzoMarket Security & Trust/Safety Specification v1.0**

That document should define:

- Account abuse prevention
- Listing policies
- Prohibited/restricted content
- Scam and fraud signals
- Verification policy
- Reporting taxonomy
- Moderation workflow
- Enforcement levels
- Appeals
- Messaging safety
- Location/contact privacy
- Business trust
- Admin permissions
- Audit requirements
- Incident handling
- Data retention considerations
- AI moderation boundaries

---

**End of GuzoMarket API & Backend Specification v1.0**
