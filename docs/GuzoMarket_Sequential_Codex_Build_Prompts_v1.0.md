# GuzoMarket — Sequential Codex Build Prompts v1.0

**Project:** GuzoMarket  
**Document:** Sequential Codex Build Prompts  
**Version:** 1.0  
**Status:** Implementation execution plan  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

# 1. How to Use This Document

These prompts are designed to be given to Codex **one stage at a time**.

Before using them, place the approved GuzoMarket specification documents in the repository
or otherwise make them available to Codex:

```text
GuzoMarket Master PRD
GuzoMarket Information Architecture & Complete Sitemap
GuzoMarket Database Schema & ER Specification
GuzoMarket UI/UX Design System
GuzoMarket API & Backend Specification
GuzoMarket Security & Trust/Safety Specification
GuzoMarket Page-by-Page UX & Functional Specification
GuzoMarket Admin Dashboard Specification
GuzoMarket AI Feature Specification
GuzoMarket Codex Master Instructions
```

For every stage:

1. Give Codex the **Codex Master Instructions**.
2. Give Codex only the current sequential prompt.
3. Let Codex inspect the actual repository.
4. Require it to run relevant verification.
5. Review the completion report.
6. Commit/checkpoint working code.
7. Continue only when the current stage is complete.

Do not paste all build prompts into Codex and ask it to execute them in one run.

---

# 2. Universal Prefix for Every Prompt

Prepend or provide the following instruction with every stage:

```text
Read and follow GuzoMarket Codex Master Instructions v1.0 and all approved GuzoMarket
specifications relevant to this stage.

Inspect the repository before editing.

Implement only the scope of this prompt plus supporting changes strictly necessary to make
that scope work. Do not jump ahead into later stages.

Preserve working code and existing approved architecture.

Run all applicable verification before declaring completion.

At the end, report:
- Implemented
- Files changed
- Database/migrations
- Tests/checks run and actual results
- Security/privacy notes
- Known limitations/deferred items
- Ready for next prompt: Yes/No

If blocked, report the blocking issue rather than pretending the task is complete.
```

---

# STAGE 0 — REPOSITORY AUDIT & BASELINE

## Prompt 0

```text
STAGE 0 — REPOSITORY AUDIT & BASELINE

Objective:
Establish the factual starting point of the GuzoMarket repository before feature
implementation.

Tasks:

1. Inspect the complete repository structure.
2. Identify:
   - framework/runtime
   - language and version
   - package manager
   - database/ORM
   - authentication implementation
   - styling/design system approach
   - test frameworks
   - lint/typecheck/build commands
   - deployment/configuration files
   - environment variable handling
   - existing routes/pages
   - existing API/server actions
   - existing database schema/migrations
   - seed infrastructure
   - storage/upload infrastructure
   - analytics/logging infrastructure
3. Compare the repository to the approved GuzoMarket specifications.
4. Identify:
   - already implemented requirements
   - partially implemented requirements
   - missing foundations
   - conflicting legacy implementation
   - security/privacy concerns
   - obvious technical debt that blocks future stages
5. Run the current baseline verification commands without changing product behavior:
   - dependency install if needed
   - typecheck
   - lint
   - tests
   - build
6. Fix only trivial baseline issues required to make the repository verifiable, if safe.
7. Do not implement marketplace features in this stage.
8. Produce a concise repository baseline report and recommended mapping of actual
   repository commands/paths to the later stages.

Out of scope:
- New marketplace features
- Major redesign
- Database redesign
- AI features
- Admin feature implementation

Stop after the baseline is documented and repository verification is complete.
```

### Gate

Proceed only when the repository can be understood and baseline failures are documented.

---

# STAGE 1 — PROJECT FOUNDATION & CONFIGURATION

## Prompt 1

```text
STAGE 1 — PROJECT FOUNDATION & CONFIGURATION

Objective:
Make the project foundation consistent, typed, secure, and ready for feature development.

Prerequisite:
Stage 0 completed.

Implement:

1. Normalize approved project structure without unnecessary rewrites.
2. Establish typed/validated environment configuration.
3. Separate browser-safe variables from server-only secrets.
4. Establish shared configuration for:
   - application name
   - base URL
   - initial marketplace/DMV region
   - feature flags
5. Ensure standard scripts exist and work for:
   - development
   - typecheck
   - lint
   - tests
   - build
6. Establish shared server error/logging conventions if missing.
7. Establish safe ID/date/formatting utilities if required.
8. Ensure private routes/configuration cannot accidentally be indexed.
9. Add/update developer setup documentation.
10. Do not build product pages beyond what is necessary to establish the foundation.

Security:
- No secrets in client bundles.
- No secrets committed.
- Environment validation must fail clearly for genuinely required configuration.

Tests:
Add tests for configuration utilities where meaningful.

Verification:
Run typecheck, lint, relevant tests, and build.

Stop after project foundation is stable.
```

---

# STAGE 2 — DATABASE SCHEMA & MIGRATIONS

## Prompt 2

```text
STAGE 2 — DATABASE SCHEMA & MIGRATIONS

Objective:
Implement or reconcile the GuzoMarket database schema with the approved Database Schema &
ER Specification.

Prerequisite:
Stages 0–1 complete.

Tasks:

1. Inspect existing schema and migration history.
2. Implement the approved core entities and relationships required for MVP.
3. Preserve existing valid data structures where compatible.
4. Use explicit lifecycle/status enums or equivalent approved domain types.
5. Implement required constraints, indexes, uniqueness rules, and foreign keys.
6. Include the data foundations for:
   - users/profiles
   - locations
   - categories
   - category attribute definitions
   - listings
   - listing attribute values
   - listing images
   - favorites
   - conversations
   - conversation participants if required by approved schema
   - messages
   - notifications
   - reports
   - moderation actions/notes as specified
   - audit log
7. Include Jobs, Businesses, Events, and Community schema only to the extent explicitly
   required by the approved database specification and current migration dependency.
   Do not build their UI/features yet.
8. Create proper migrations.
9. Do not edit applied migrations as a shortcut.
10. Add database-level integrity constraints where appropriate.

Security/data integrity:
- Do not store plaintext passwords.
- Preserve privacy boundaries between public and private user/location data.
- Do not collapse moderation/archive/delete states into one boolean.

Tests:
Add schema/integration tests where supported.

Verification:
- Migration from clean database succeeds.
- Schema generation/client generation succeeds.
- Typecheck/lint/tests/build pass as applicable.

Stop after schema and migrations are stable.
```

---

# STAGE 3 — SEED DATA & DEVELOPMENT FIXTURES

## Prompt 3

```text
STAGE 3 — SEED DATA & DEVELOPMENT FIXTURES

Objective:
Create safe, representative development data for the DMV marketplace.

Prerequisite:
Database schema complete.

Implement seed data for:

1. Marketplace region:
   - Washington, DC
   - representative Maryland locations
   - representative Northern Virginia locations
2. Primary categories and approved subcategories.
3. Representative category attribute definitions:
   - Cars
   - Housing
   - Buy & Sell examples
4. Synthetic users.
5. Synthetic active/draft/completed listings.
6. Representative listing images using safe placeholder/local fixture strategy.
7. Sample reports/moderation records where useful for later admin development.
8. Businesses/events only if their schema is already present and seed data is useful;
   clearly mark them as demo content.

Rules:
- No real credentials.
- No real private user information.
- Seed should be deterministic/re-runnable where practical.
- Do not seed fake production ratings/reviews as though they were real.

Add documentation for resetting/seeding local development.

Verification:
Run seed from a clean database and verify representative records.

Stop after development data is reliable.
```

---

# STAGE 4 — AUTHENTICATION & ACCOUNT SECURITY

## Prompt 4

```text
STAGE 4 — AUTHENTICATION & ACCOUNT SECURITY

Objective:
Implement the approved authentication foundation and protected-route behavior.

Implement:

1. Sign Up.
2. Log In.
3. Log Out.
4. Email verification flow.
5. Forgot password.
6. Reset password.
7. Authenticated session handling.
8. Active/suspended account checks.
9. Safe returnTo behavior for protected actions.
10. Account security route foundation.
11. Server-side helpers/policies for requiring authenticated users.
12. Generic credential/account-recovery errors that avoid unnecessary enumeration.
13. Rate limits for sensitive auth operations where supported by the approved backend
    architecture.

Do not implement social login unless explicitly approved.

UI:
Implement desktop/mobile auth screens according to Page-by-Page and Design System specs.

Tests:
- Sign up
- Login success/failure
- Protected route
- Return destination
- Verification token behavior
- Password reset token behavior
- Suspended account behavior

Security:
- Secure password/session behavior
- Expiring/single-use tokens where applicable
- No secrets/tokens in logs
- Safe redirects only

Verification:
Run all applicable checks.

Stop after authentication is production-quality enough for later marketplace stages.
```

---

# STAGE 5 — GLOBAL UI SHELL & DESIGN PRIMITIVES

## Prompt 5

```text
STAGE 5 — GLOBAL UI SHELL & DESIGN PRIMITIVES

Objective:
Implement the reusable GuzoMarket visual foundation before building major pages.

Implement approved shared components, adapting to the actual repository:

- Global desktop header
- Mobile header
- Mobile bottom navigation
- Footer
- Button variants
- Inputs/textareas/selects
- Search field
- Location selector shell
- Cards
- Badges
- Tabs
- Dialog/modal
- Mobile sheet/drawer
- Toast/status feedback if approved
- Skeletons
- Empty states
- Error states
- Pagination/loading controls
- Breadcrumbs
- Avatar
- Shared listing-card foundation
- Shared section heading patterns

Use the approved front-page visual direction and UI/UX Design System.

Requirements:
- Responsive behavior
- Keyboard accessibility
- Visible focus
- Semantic markup
- No native-app badges
- Dynamic footer year
- No fake verification/rating content

Do not implement full homepage data behavior yet.

Tests:
Add component tests where useful.

Verification:
Run typecheck/lint/tests/build and inspect key components at mobile and desktop widths.

Stop after the shared UI foundation is stable.
```

---

# STAGE 6 — LOCATION & CATEGORY INFRASTRUCTURE

## Prompt 6

```text
STAGE 6 — LOCATION & CATEGORY INFRASTRUCTURE

Objective:
Implement reusable marketplace location/category services and UI data access.

Implement:

1. Public active-category retrieval.
2. Category hierarchy retrieval.
3. Category attribute-definition retrieval.
4. Public active-location retrieval.
5. DMV marketplace-region handling.
6. Normalized location labels such as:
   - Washington, DC
   - Silver Spring, MD
   - Arlington, VA
7. Category/location selectors used by later search/posting flows.
8. Server-side validation of category/location IDs.
9. Caching only where safe and consistent with architecture.

Privacy:
Do not expose private user/listing coordinates through public location endpoints.

Tests:
- Disabled categories excluded
- Invalid category/location rejected
- Hierarchy behavior
- Public location DTO privacy

Stop after shared category/location infrastructure is ready.
```

---

# STAGE 7 — HOMEPAGE

## Prompt 7

```text
STAGE 7 — HOMEPAGE

Objective:
Implement the approved GuzoMarket front page using real application data.

Implement route `/`.

Required sections:

1. Global header.
2. Hero:
   - approved headline/supporting copy
   - keyword search
   - location selector
   - search CTA
3. Popular searches.
4. Guest/authenticated contextual welcome surface.
5. Primary categories.
6. Popular Near You.
7. Trust & Privacy benefits.
8. Featured Businesses section shell/data only if business records are currently supported;
   otherwise use the approved graceful phase behavior rather than invented content.
9. Community Near You using currently supported event/community data where available;
   otherwise implement the approved empty/phase state.
10. Account-value CTA.
11. Footer.

Requirements:
- Real database/service integration.
- Section-level skeletons.
- Section-level errors where possible.
- Empty marketplace state.
- Correct Washington, DC formatting.
- Save controls only where the authenticated favorite backend exists; otherwise defer
  interaction without fake behavior.
- No fake ratings/reviews.
- No native-app badges.
- Responsive mobile design.
- Homepage analytics events defined in specification.
- SEO metadata.

Tests:
- Guest homepage
- Authenticated homepage
- Empty data
- Search submission
- Category navigation
- Responsive component behavior where testable

Stop after homepage matches approved product behavior.
```

---

# STAGE 8 — SEARCH & CATEGORY DISCOVERY

## Prompt 8

```text
STAGE 8 — SEARCH & CATEGORY DISCOVERY

Objective:
Implement deterministic marketplace search and category landing pages.

Implement:

1. `/search`
2. Category landing routes from the approved sitemap.
3. Keyword search.
4. Location filtering.
5. Category/subcategory filtering.
6. Price and category-specific filters where supported.
7. Sorting.
8. Result count.
9. Pagination/cursor behavior.
10. Shareable URL search state.
11. Mobile filter sheet.
12. Selected filter chips.
13. Empty/no-results state.
14. Error state.
15. Back-navigation state restoration where practical.
16. Search/category analytics.
17. SEO controls preventing uncontrolled arbitrary-filter indexing.

Security/performance:
- Server-validate filters.
- Bound query/page sizes.
- Prevent arbitrary database-field querying.
- Avoid N+1 patterns.
- Add/verify indexes for primary search access patterns.

Do not implement AI natural-language parsing yet.

Tests:
Cover query, location, category, price/filter combinations, invalid filters, pagination,
and no-results behavior.

Stop after deterministic search is reliable.
```

---

# STAGE 9 — LISTING DETAIL & PUBLIC SELLER PROFILE

## Prompt 9

```text
STAGE 9 — LISTING DETAIL & PUBLIC SELLER PROFILE

Objective:
Implement public listing detail and seller profile experiences.

Implement:

1. `/listings/{slug}-{stable-id}`
2. Image gallery.
3. Listing summary.
4. Price and category attributes.
5. Approximate public location.
6. Posted time/date.
7. Seller card.
8. Verification indicators with precise meanings.
9. Share.
10. Report entry-point shell if report backend is not yet built; do not create fake
    successful reporting.
11. Similar listings.
12. Seller's other active listings.
13. Owner management shortcut.
14. Sold/rented/filled/expired/archived public states.
15. Removed/suspended safe public state.
16. Public seller profile route.
17. Public seller active listings.
18. SEO metadata and appropriate structured data.

Privacy:
- No private email/phone unless explicitly public by approved feature.
- No exact residential coordinates.
- No internal moderation/risk fields.

Favorite and Message Seller controls may be connected only if their backend stage is
already implemented; otherwise preserve the approved UI path without pretending success.

Tests:
- Active listing
- Owner/non-owner
- Completed listing
- Removed listing
- Public profile visibility
- Private-field leakage tests

Stop after public listing/profile views are complete.
```

---

# STAGE 10 — POST LISTING FLOW

## Prompt 10

```text
STAGE 10 — POST LISTING FLOW

Objective:
Implement complete authenticated listing creation.

Routes:

```text
/post
/post/category
/post/details
/post/photos
/post/location
/post/preview
/post/success
```

Implement:

1. Draft creation/resume.
2. Category selection.
3. Dynamic category attributes.
4. Details form.
5. Price/price-type behavior.
6. Photo upload.
7. Photo validation.
8. Photo ordering/primary image.
9. Location entry.
10. Public-location privacy behavior.
11. Preview using real listing components.
12. Final server-side validation.
13. Publish/submission lifecycle.
14. Active vs pending-review success state according to moderation policy.
15. Draft preservation through recoverable errors.

Security:
- Auth required.
- Listing ownership verified.
- Unknown attributes rejected.
- Upload type/size/signature validated.
- Sensitive image metadata stripped where required.
- No exact private address published by default.

Tests:
Cover the complete flow, invalid attributes, upload errors, unauthorized access, draft
resume, publish validation, and location privacy.

Stop after a user can safely create a real listing end-to-end.
```

---

# STAGE 11 — ACCOUNT, PROFILE & MY LISTINGS

## Prompt 11

```text
STAGE 11 — ACCOUNT, PROFILE & MY LISTINGS

Objective:
Implement authenticated self-service account and listing management.

Implement:

- `/account`
- `/account/profile`
- `/account/listings`
- `/account/listings/{id}/edit`
- `/account/security`
- `/account/privacy`

Features:

1. Account overview.
2. Edit public profile.
3. Avatar upload if approved storage infrastructure supports it.
4. Profile visibility.
5. My Listings tabs:
   - Active
   - Pending
   - Drafts
   - Completed
   - Expired
   - Archived
6. Edit listing.
7. Mark sold/rented/filled as appropriate.
8. Archive.
9. Renew where approved.
10. Delete/deactivate behavior according to lifecycle specification.
11. Password/security entry points.
12. Privacy controls currently supported.

Authorization:
Only owner may modify their resources.

Tests:
Cross-user access, profile privacy, lifecycle transitions, invalid transitions, and edit
validation.

Stop after self-service account/listing management is complete.
```

---

# STAGE 12 — SAVED LISTINGS

## Prompt 12

```text
STAGE 12 — SAVED LISTINGS

Objective:
Implement real favorite/save behavior.

Implement:

1. Favorite/unfavorite backend.
2. Idempotent save behavior.
3. Save controls on listing cards/detail.
4. Guest authentication gate preserving destination.
5. `/saved/listings`.
6. Saved state on cards/detail.
7. Removed/sold/expired status presentation in Saved.
8. Empty state.
9. Analytics.

Security:
Authenticated user can manipulate only their own favorites.

Tests:
Save, unsave, duplicate requests, guest gate, cross-user isolation, removed listing state.

Do not implement Saved Searches yet unless explicitly required.

Stop after Saved Listings works end-to-end.
```

---

# STAGE 13 — MESSAGING

## Prompt 13

```text
STAGE 13 — MESSAGING

Objective:
Implement secure listing-context messaging.

Routes:

```text
/messages
/messages/{conversation-id}
```

Implement:

1. Start conversation from eligible listing.
2. Prevent invalid self-conversation where product policy requires.
3. Conversation inbox.
4. Unread state.
5. Conversation detail.
6. Listing/entity context header.
7. Send text message.
8. Image attachment only if approved upload/security support is ready.
9. Mark/read behavior.
10. Block/report entry points according to current support.
11. Mobile inbox/conversation behavior.
12. Relevant notifications/events.

Security:
- Only participants access conversation/messages.
- Client-supplied participant IDs are not trusted.
- No broad private-message logging.
- Apply message rate limits/validation.
- Safe attachment handling.

Tests:
Cross-user access, conversation creation, send/read, invalid participant, blocked behavior
when available, and message validation.

Stop after messaging is secure and usable.
```

---

# STAGE 14 — NOTIFICATIONS

## Prompt 14

```text
STAGE 14 — NOTIFICATIONS

Objective:
Implement in-app notifications and current supported preferences.

Implement:

- `/notifications`
- `/account/notifications`

Features:

1. Notification list.
2. Unread indicator.
3. Mark one read.
4. Mark all read.
5. Deep links to authorized context.
6. Empty state.
7. Notification generation for currently supported important events.
8. Preference controls for implemented channels only.
9. Email preferences only if email delivery exists.
10. Push/SMS controls remain disabled/absent until those channels exist.

Security:
Deep links must not grant access to unauthorized resources.

Tests:
Cross-user isolation, read state, deep-link authorization, preference updates.

Stop after in-app notifications are reliable.
```

---

# STAGE 15 — REPORTING, BLOCKING & TRUST/SAFETY USER FLOWS

## Prompt 15

```text
STAGE 15 — REPORTING, BLOCKING & TRUST/SAFETY USER FLOWS

Objective:
Implement user-facing safety controls.

Implement:

1. Report listing.
2. Report user where approved.
3. Report message/conversation where approved.
4. Reason selection.
5. Optional details.
6. Submission confirmation.
7. Server validation and rate limits.
8. Block user.
9. Unblock/manage blocked users through privacy settings.
10. Enforcement-aware behavior for blocked interactions.
11. Safety Center `/help/safety`.
12. Approved scam/payment/location guidance.
13. Report analytics.

Privacy:
- Reporter identity is not exposed to reported user.
- Reports are private moderation records.
- No instant disclosure of moderation outcome unless approved.

Tests:
Report creation, invalid subject, rate limit, reporter privacy, block interaction behavior,
cross-user access.

Stop after user-facing safety workflows are complete.
```

---

# STAGE 16 — ADMIN FOUNDATION & PERMISSIONS

## Prompt 16

```text
STAGE 16 — ADMIN FOUNDATION & PERMISSIONS

Objective:
Implement secure admin architecture before admin features.

Implement:

1. `/admin` route protection.
2. Moderator/Admin/Super Admin role-to-permission mapping.
3. Explicit server-side permission helpers/policies.
4. Admin shell/sidebar/top bar.
5. Permission-driven navigation.
6. Admin loading/error/unauthorized patterns.
7. Audit helper/service for privileged actions.
8. High-impact confirmation component.
9. Internal note component/service foundation.
10. Admin table/filter primitives.
11. `/admin/dashboard` using real available metrics.

Security:
- Normal users cannot access admin data.
- Hidden UI is not authorization.
- Privileged actions are audited.
- Sensitive admin pages are non-indexable.
- Super Admin remains highly restricted.

Tests:
Permission matrix for guest/user/moderator/admin/super-admin.

Stop after the admin foundation is secure.
```

---

# STAGE 17 — ADMIN USERS & LISTINGS

## Prompt 17

```text
STAGE 17 — ADMIN USERS & LISTINGS

Objective:
Implement operational user and listing management.

Routes:

```text
/admin/users
/admin/users/{id}
/admin/listings
/admin/listings/{id}
```

Implement:

1. Search/filter/pagination.
2. User detail.
3. Listing detail.
4. Relevant moderation/history context.
5. Suspend user.
6. Restore user.
7. Listing approve/reject/remove/restore according to legal lifecycle transitions.
8. Reason + confirmation for high-impact actions.
9. Audit records.
10. Permission restrictions.
11. Concurrent/stale state protection.

Do not implement unrestricted role changes unless required by the approved permission
scope; Super Admin changes require strongest safeguards.

Tests:
Permission matrix, suspension/restoration, listing transitions, stale action conflict,
audit creation, private-data handling.

Stop after user/listing operations are safe and auditable.
```

---

# STAGE 18 — REPORT QUEUE & MODERATION WORKFLOW

## Prompt 18

```text
STAGE 18 — REPORT QUEUE & MODERATION WORKFLOW

Objective:
Complete the internal Trust & Safety moderation workflow.

Routes:

```text
/admin/reports
/admin/reports/{id}
```

Implement:

1. Report queue.
2. Priority ordering.
3. Search/filters.
4. Assignment to self/authorized moderator.
5. Report detail.
6. Reporter context.
7. Subject snapshot.
8. Relevant evidence.
9. Related reports/history.
10. Internal notes.
11. Moderation actions.
12. Resolve.
13. Dismiss.
14. Escalation representation using approved existing schema; do not invent a new persistent
    entity unless a controlled schema revision is required and explicitly justified.
15. Audit timeline.
16. Concurrent review protection.

Privacy:
- Reporter identity never becomes public.
- Internal notes remain private.
- Private message evidence is purpose-limited.

Tests:
Assignment, resolve/dismiss, permission boundaries, concurrent actions, reporter privacy,
notes privacy, audit records.

Stop after the moderation queue works end-to-end.
```

---

# STAGE 19 — ADMIN CATEGORY & LOCATION MANAGEMENT

## Prompt 19

```text
STAGE 19 — ADMIN CATEGORY & LOCATION MANAGEMENT

Objective:
Implement safe marketplace taxonomy and geography administration.

Routes:

```text
/admin/categories
/admin/categories/{id}
/admin/locations
/admin/locations/{id}
```

Implement:

1. Category tree.
2. Create/edit/enable/disable/reorder.
3. Category attribute-definition management.
4. Location hierarchy.
5. Create/edit/enable/disable.
6. Parent/location-region assignment.
7. DMV marketplace-region management.
8. Referenced-record safeguards.
9. Audit records.

Do not hard-delete referenced categories/locations.

Tests:
Hierarchy integrity, disabled public behavior, referenced-record protection, permissions,
audit creation.

Stop after taxonomy/location administration is stable.
```

---

# STAGE 20 — JOBS

## Prompt 20

```text
STAGE 20 — JOBS

Objective:
Implement the approved Jobs vertical without destabilizing generic marketplace behavior.

Implement:

1. `/jobs`
2. Job search/location.
3. Filters:
   - employment type
   - work mode
   - salary
   - date posted
   - location
4. `/jobs/{slug}-{stable-id}`
5. Employer/business context.
6. Apply/contact methods supported by the approved schema:
   - in-app
   - validated external URL
   - email where approved
7. Save integration where compatible.
8. Report integration.
9. Related jobs.
10. SEO/JobPosting structured data when accurate.
11. Responsive states.

Security:
Validate external URLs and prevent unsafe schemes.

Tests:
Search/filter, detail, invalid external links, permissions for posting/editing if included.

Stop after Jobs is complete for its approved launch scope.
```

---

# STAGE 21 — BUSINESSES

## Prompt 21

```text
STAGE 21 — BUSINESSES

Objective:
Implement the approved business directory and business profiles.

Implement:

1. `/businesses`
2. Search/location/category filters.
3. Business cards.
4. `/businesses/{slug}-{stable-id}`
5. Cover/logo/name/category/location.
6. Verification display with precise meaning.
7. About.
8. Hours.
9. Services.
10. Public contact methods intentionally configured by business.
11. Listings/products association where supported.
12. Photos/map where supported.
13. Related businesses.
14. `/account/businesses` management if Phase 1.5 business management is now in scope.
15. Business member permissions.
16. Admin business management/verification if approved for this release.
17. SEO/LocalBusiness structured data when accurate.

Do not invent ratings/reviews if review functionality is not implemented.

Security:
Business membership and verification changes are server-authorized and audited.

Tests:
Public/private fields, membership permissions, verification behavior, filters.

Stop after approved business scope is complete.
```

---

# STAGE 22 — EVENTS

## Prompt 22

```text
STAGE 22 — EVENTS

Objective:
Implement local event discovery and event detail.

Implement:

1. `/events`
2. Date/location/category filters.
3. Upcoming event cards.
4. `/events/{slug}-{stable-id}`
5. Hero/title/date/time.
6. Venue/location.
7. Organizer.
8. RSVP/contact behavior supported by schema.
9. Description/photos.
10. Directions where supported.
11. Related events.
12. Report integration.
13. Upcoming/cancelled/completed/archived states.
14. Admin event oversight if approved for current phase.
15. SEO/Event structured data when accurate.

Distinguish event cancellation from moderation removal.

Tests:
Date filtering, lifecycle states, location privacy/venue behavior, admin permissions.

Stop after Events is complete.
```

---

# STAGE 23 — BASIC COMMUNITY

## Prompt 23

```text
STAGE 23 — BASIC COMMUNITY

Objective:
Implement the approved basic local Community experience without turning GuzoMarket into a
generic social network.

Implement:

1. `/community`
2. Content types:
   - announcements
   - recommendations
   - questions
   - help requests
   - local information
3. Location/community context.
4. Content-type filters.
5. Public community cards/posts.
6. Authenticated create-post flow if approved for launch.
7. Server validation.
8. Stronger posting rate limits.
9. Report integration.
10. Moderation lifecycle.
11. Empty/loading/error states.

Out of scope:
- Community Groups unless Phase 2 is explicitly started.
- Generic follower/social graph.
- AI-generated community feed.

Tests:
Posting authorization, rate limits, moderation state, public/private field safety.

Stop after Basic Community is complete.
```

---

# STAGE 24 — SEO, ANALYTICS & PERFORMANCE HARDENING

## Prompt 24

```text
STAGE 24 — SEO, ANALYTICS & PERFORMANCE HARDENING

Objective:
Apply cross-product discoverability, measurement, and performance requirements.

SEO:
1. Audit indexable routes.
2. Unique titles/descriptions.
3. Canonical URLs.
4. Open Graph metadata.
5. Accurate structured data where approved.
6. Prevent indexing of account/admin/private pages.
7. Control arbitrary search-filter indexation.
8. Sitemap/robots behavior where supported.

Analytics:
1. Implement approved snake_case events.
2. Avoid sensitive properties.
3. Verify key funnel events:
   - homepage search
   - search result click
   - listing view
   - save
   - message start/send
   - listing creation/publish
   - report submit
   - major business/job/event interactions
4. Keep AuditLog separate.

Performance:
1. Audit N+1 queries.
2. Verify pagination.
3. Optimize major images.
4. Avoid oversized client bundles.
5. Lazy-load appropriate non-critical content.
6. Verify database indexes for major query paths.
7. Measure and address obvious major bottlenecks.

Do not perform speculative micro-optimization.

Verification:
Run production build and applicable performance/SEO checks.

Stop after cross-product hardening is complete.
```

---

# STAGE 25 — SECURITY, PRIVACY & ACCESSIBILITY QA

## Prompt 25

```text
STAGE 25 — SECURITY, PRIVACY & ACCESSIBILITY QA

Objective:
Perform a focused pre-release audit against the approved specifications and fix discovered
issues within scope.

Security review:
- Authentication
- Authorization
- Cross-user resource access
- Admin permissions
- Lifecycle transitions
- CSRF where applicable
- Input validation
- Upload validation
- Rate limits
- Safe redirects
- Secrets
- Security headers
- Error leakage
- Logging leakage
- Audit logging

Privacy review:
- Exact residential coordinates
- Private email/phone
- Private messages
- Reporter identity
- Internal notes
- Risk/moderation data
- Analytics properties
- Public DTOs

Accessibility:
- Keyboard navigation
- Focus
- Headings
- Labels
- Dialogs/sheets
- Errors
- Status indicators
- Touch targets
- Alt text
- Screen-reader feedback
- Desktop/mobile behavior

Testing:
Add regression tests for every material issue found.

Run the full applicable test/build suite.

Do not declare release readiness with known critical/high-severity security or privacy
failures.

Stop with a written QA summary.
```

---

# STAGE 26 — AI PHASE 1.5 FOUNDATION

## Prompt 26

```text
STAGE 26 — AI PHASE 1.5 FOUNDATION

Objective:
Add the AI infrastructure defined by the AI Feature Specification without making core
GuzoMarket dependent on AI.

Prerequisite:
Core marketplace is stable.

Implement:

1. Server-only AI provider abstraction.
2. Feature-specific AI service pattern.
3. Typed AI configuration.
4. Independent feature flags.
5. Prompt registry/versioning.
6. Structured-output validation.
7. Timeouts.
8. Rate limits.
9. Safe metrics/cost tracking foundation.
10. Deterministic fallback behavior.
11. Provider-secret protection.
12. Kill switches.

Do not yet implement all AI product features in this prompt.

Do not send private messages, identity documents, security data, or unrelated personal data
to the provider.

Tests:
Provider failure, timeout, invalid structured output, disabled feature, rate limit, fallback.

Stop after AI infrastructure is isolated and safe.
```

---

# STAGE 27 — AI LISTING ASSISTANCE

## Prompt 27

```text
STAGE 27 — AI LISTING ASSISTANCE

Objective:
Implement the first low-risk user-facing AI feature.

Implement in `/post/details`:

1. Improve title.
2. Improve description.
3. Optional category suggestion.
4. Optional structured attribute extraction when approved infrastructure is ready.
5. Preserve original user content.
6. Show generated content as an editable suggestion.
7. Accept / Keep Mine / Regenerate within limits.
8. User review reminder.
9. Structured validation.
10. AI analytics.
11. Non-AI fallback.

Prompt constraints:
AI must not invent material facts such as condition, mileage, price, ownership, warranty,
address, licenses, or credentials.

Publishing still uses normal listing validation.

Tests:
Feature disabled, provider failure, hallucination-oriented evaluation fixtures, invalid
category IDs, invalid attributes, original-content preservation.

Stop after listing assistance meets AI acceptance criteria.
```

---

# STAGE 28 — AI SEARCH PARSING

## Prompt 28

```text
STAGE 28 — AI SEARCH PARSING

Objective:
Add optional natural-language interpretation on top of deterministic search.

Implement:

```text
natural-language query
→ AI parser
→ validated SearchIntent
→ existing standard search service
```

SearchIntent may include approved fields such as:

```text
query
categoryId
locationId
radius
priceMin
priceMax
condition
sort
domainSpecificFilters
confidence
```

Requirements:
- IDs/enums validated against application data.
- Unknown values dropped.
- Interpreted filters visible/removable.
- Search URL remains shareable.
- Failure falls back to original keyword search.
- AI never generates raw database queries.
- Rate limits/cost controls apply.

Tests:
Representative DMV queries, invalid IDs, ambiguous query, timeout, disabled feature,
fallback.

Stop after AI search remains an enhancement rather than a dependency.
```

---

# STAGE 29 — AI MODERATOR SUMMARIES & RISK ASSISTANCE

## Prompt 29

```text
STAGE 29 — AI MODERATOR SUMMARIES & RISK ASSISTANCE

Objective:
Introduce carefully bounded internal AI assistance.

Implement first:
1. AI-assisted report summary.
2. Clear AI-assisted label.
3. Direct access to source evidence.
4. Minimum necessary context.
5. No automatic enforcement.
6. Feature flag/rate limit/timeout/fallback.
7. Safe operational metrics.

Only if evaluation requirements are satisfied, optionally add:
- spam classification signal
- scam-risk signal
- duplicate-content signal
- queue-priority suggestion

Rules:
- AI output is not proof.
- AI cannot bypass moderator permissions.
- AI cannot perform permanent bans or prohibited high-impact decisions.
- Reporter/private-message data is purpose-limited.
- Raw sensitive prompts are not broadly logged.

Tests/evaluation:
False positives, false negatives, provider failure, manipulated content/prompt injection,
permission boundaries, no-action fallback.

Stop after assistive moderation behavior is verified.
```

---

# STAGE 30 — PRODUCTION READINESS

## Prompt 30

```text
STAGE 30 — PRODUCTION READINESS

Objective:
Perform the final engineering readiness pass for the currently approved GuzoMarket release.

Do not add major features.

Audit:

1. Environment/configuration.
2. Production secrets strategy.
3. Database migration path.
4. Seed/demo-data separation.
5. Backups/recovery assumptions where infrastructure supports them.
6. Authentication/session production configuration.
7. Email configuration.
8. Upload/storage configuration.
9. Domain/base URL.
10. Security headers.
11. Rate limits.
12. Logging/monitoring.
13. Error reporting.
14. Analytics.
15. Admin permissions.
16. Audit logging.
17. SEO/robots/sitemap.
18. Performance.
19. Accessibility.
20. Privacy/data exposure.
21. AI flags/provider configuration if AI is included in release.
22. Feature flags for unfinished modules.
23. Legal/help placeholders that require final human/legal content.
24. Dependency/security audit using repository-supported tooling.
25. Full build/test suite.

Perform a clean production build.

Perform or document critical smoke tests:

```text
Guest homepage/search
Sign up/login
View listing
Post listing
Edit/manage listing
Save listing
Message seller
Notifications
Report/block
Moderator login
Review report
Moderation action
Admin category/location management
Jobs/Businesses/Events/Community if enabled
AI fallback if AI enabled
```

Create a final readiness report with:

```text
PASS
BLOCKER
DEFERRED
REQUIRES HUMAN/LEGAL/INFRASTRUCTURE ACTION
```

Do not declare production ready if blockers remain.

Stop after the final report.
```

---

# 3. Optional Checkpoint Prompt

Use this between stages when needed:

```text
CHECKPOINT — DO NOT IMPLEMENT NEW FEATURES

Review the current repository against the completed GuzoMarket build stages.

Run the full applicable verification suite.

Identify:
- regressions
- incomplete acceptance criteria
- schema drift
- authorization gaps
- private-data leakage
- broken responsive behavior
- accessibility regressions
- failing tests/build
- accidental implementation of later-stage features

Fix only regressions belonging to already-completed stages.

Report the repository state and whether it is safe to continue.
```

---

# 4. Recovery Prompt

If a Codex stage goes badly, use:

```text
RECOVERY — STABILIZE CURRENT STAGE

Do not add new features.

Inspect the current git diff and repository state.

Compare the changes to:
- GuzoMarket Codex Master Instructions
- the current Sequential Build Prompt
- relevant approved specifications

Identify:
1. unrelated changes
2. architectural drift
3. security/privacy regressions
4. failing tests/build
5. incomplete requirements
6. speculative later-stage implementation

Revert or correct only the problematic changes while preserving valid work.

Run the applicable verification suite.

Report exactly what was repaired and whether the current stage now satisfies its acceptance
criteria.
```

---

# 5. Bug-Fix Prompt Template

After implementation, use this for targeted defects:

```text
BUG FIX — GuzoMarket

Issue:
[describe reproducible problem]

Expected behavior:
[describe expected behavior]

Relevant route/component:
[route or component]

Follow GuzoMarket Codex Master Instructions and relevant approved specifications.

First reproduce and identify root cause.

Implement the smallest complete fix.

Do not redesign unrelated code or add unrelated features.

Add/update a regression test.

Run relevant tests, typecheck, lint, and build as applicable.

Report:
- Root cause
- Fix
- Files changed
- Regression test
- Verification results
```

---

# 6. UI Refinement Prompt Template

Use after functionality is correct:

```text
UI REFINEMENT — GuzoMarket

Target:
[page/component]

Compare the implementation to the approved GuzoMarket UI/UX Design System,
Page-by-Page Specification, and approved front-page visual direction.

Improve only:
- spacing
- hierarchy
- typography
- responsive layout
- interaction clarity
- accessibility
- loading/empty/error presentation

Do not change product behavior, database behavior, permissions, or approved information
architecture.

Verify desktop and mobile.

Run applicable tests/typecheck/lint/build.

Summarize changes.
```

---

# 7. Security Review Prompt Template

```text
SECURITY REVIEW — GuzoMarket

Target:
[feature/route/service]

Review this area against the GuzoMarket Security & Trust/Safety Specification and Codex
Master Instructions.

Specifically test:
- authentication
- authorization
- object ownership
- role/permission forgery
- input validation
- output/private-field leakage
- lifecycle transition abuse
- CSRF where applicable
- rate limits
- logging leakage
- unsafe redirects/URLs
- upload abuse if relevant

Fix confirmed issues within this target only.

Add regression tests.

Do not weaken functionality by simply disabling required features unless necessary as a
temporary safety measure and explicitly reported.

Run applicable verification and provide findings.
```

---

# 8. Database Migration Review Prompt Template

```text
DATABASE MIGRATION REVIEW — GuzoMarket

Review the proposed/current migration for:

- compatibility with approved GuzoMarket schema
- destructive operations
- data preservation
- constraints
- indexes
- foreign keys
- enum/state changes
- rollback/recovery implications
- application compatibility

Do not modify already-applied migration history as a shortcut.

If unsafe, create the correct forward migration.

Run migration against a clean development database and relevant tests.

Report risks and results.
```

---

# 9. Release Rule

A sequential stage may be considered complete only when:

```text
Scope is implemented
Applicable acceptance criteria are satisfied
Relevant tests pass
Typecheck/lint pass
Build passes where applicable
Migrations work where applicable
Security/privacy requirements are verified
No unrelated later-stage feature was introduced
Completion report is truthful
Repository is left in a working state
```

If any required check cannot run, the stage report must state that explicitly.

---

# 10. Recommended Git Discipline

After every successfully completed stage:

```text
Review diff
Remove accidental changes
Run final checks
Commit/checkpoint
Tag milestone if useful
Proceed to next prompt
```

Suggested commit naming:

```text
stage-00: repository baseline
stage-01: project foundation
stage-02: database schema
stage-03: seed data
stage-04: authentication
...
stage-30: production readiness
```

Exact git workflow may follow the repository/team convention.

---

# 11. Final Implementation Principle

The sequence is intentionally conservative.

GuzoMarket should be built as a series of verified, working increments rather than one
large generation.

At every stage:

```text
Build what is approved.
Protect user data.
Enforce permissions on the server.
Preserve lifecycle integrity.
Handle failure states.
Test the behavior.
Stop at the stage boundary.
```

---

**End of GuzoMarket Sequential Codex Build Prompts v1.0**
