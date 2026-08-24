# GuzoMarket — Codex Master Instructions v1.0

**Project:** GuzoMarket  
**Document:** Codex Master Instructions  
**Version:** 1.0  
**Status:** Implementation control baseline  
**Initial market:** Washington, DC / Maryland / Northern Virginia (DMV)

---

## 1. Purpose

These instructions govern AI-assisted implementation of the GuzoMarket web application.

Codex must treat the approved GuzoMarket specification set as the product and engineering
source of truth. It must not redesign the marketplace, invent major features, replace
approved architecture, or silently weaken security, privacy, accessibility, moderation,
or data-integrity requirements for implementation convenience.

The objective is not merely to produce code that compiles. The objective is to build a
maintainable, secure, responsive, accessible marketplace that matches the approved product
requirements and can be verified incrementally.

---

# PART I — SOURCE OF TRUTH

## 2. Approved Specification Set

Use the following documents together:

```text
1. GuzoMarket Master PRD
2. Information Architecture & Complete Sitemap
3. Database Schema & ER Specification
4. UI/UX Design System
5. API & Backend Specification
6. Security & Trust/Safety Specification
7. Page-by-Page UX & Functional Specification
8. Admin Dashboard Specification
9. AI Feature Specification
10. Codex Master Instructions
11. Current Sequential Codex Build Prompt
```

The current build prompt defines the task being implemented. These Master Instructions
define how it must be implemented.

---

## 3. Source Priority

When requirements appear to conflict, use this order unless a later explicitly approved
revision states otherwise:

```text
1. Explicit user instruction for the current implementation task
2. Latest approved controlled specification revision
3. Security / Trust & Safety requirements
4. Database and backend integrity requirements
5. Page-level functional requirements
6. UI/UX Design System
7. Master PRD
8. Existing implementation
```

Existing code is not automatically correct simply because it already exists.

Do not silently reconcile genuine specification conflicts. Identify the conflict and choose
the safest reversible interpretation when work can continue without product risk.

---

## 4. No Requirement Invention

Do not invent:

- New monetization models
- New user roles
- New moderation authority
- New listing lifecycle states
- New verification meanings
- New sensitive data collection
- New external integrations
- New native-app functionality
- New AI autonomy
- New payment flows

unless required by an approved specification or current task.

Small implementation details may be chosen when required to make approved behavior work,
but they must remain consistent with the product architecture.

---

# PART II — IMPLEMENTATION METHOD

## 5. Work Incrementally

Do not attempt to build the entire marketplace in one pass.

For every build prompt:

```text
Inspect
Plan
Implement
Migrate if necessary
Test
Verify
Summarize
Stop
```

Do not continue into the next implementation stage unless explicitly instructed.

---

## 6. Inspect Before Editing

Before making changes:

1. Inspect repository structure.
2. Read relevant configuration.
3. Inspect existing schema/migrations.
4. Inspect relevant components/services/routes.
5. Identify reusable implementation.
6. Identify specification constraints.
7. Check current tests.
8. Determine whether the task requires schema/config/environment changes.

Never assume the repository is empty or matches an expected template.

---

## 7. Preserve Working Code

Prefer targeted changes.

Do not:

- Rewrite large areas unnecessarily.
- Delete working features unrelated to the task.
- Replace architecture because another approach is personally preferred.
- Introduce a second competing pattern without reason.
- Reformat the entire repository during a focused task.

Refactoring is allowed when necessary to satisfy the specification safely, but scope it.

---

# PART III — TECHNOLOGY & REPOSITORY RULES

## 8. Technology Stack

Use the technology stack defined by the approved technical specifications and actual
repository.

If the repository already contains the approved stack, extend it rather than replacing it.

Do not silently change framework, database, authentication architecture, package manager,
CSS strategy, testing framework, deployment strategy, or storage provider.

If a required technology decision is genuinely absent from the approved sources and cannot
be inferred safely from the repository, flag it rather than creating a major architectural
commitment casually.

---

## 9. Repository Organization

Follow established repository conventions.

Prefer clear separation among:

```text
UI/components
routes/pages
server/API actions
domain services
authorization/policies
data access
validation
types/DTOs
configuration
tests
utilities
```

Avoid putting database queries, authorization, external-provider calls, and presentation
logic into a single UI component.

---

## 10. Dependency Discipline

Before adding a dependency:

1. Check whether the repository already provides the capability.
2. Prefer existing approved libraries.
3. Confirm the dependency is maintained and appropriate.
4. Avoid packages for trivial functionality.
5. Do not add overlapping libraries that solve the same problem.
6. Record why a meaningful new dependency is required.

Never add packages merely because they are familiar.

---

# PART IV — CODING STANDARDS

## 11. General Standards

Code should be:

- Readable
- Typed where the stack supports typing
- Modular
- Testable
- Explicit around security-sensitive behavior
- Consistent with repository conventions

Avoid clever abstractions that obscure product behavior.

---

## 12. Naming

Use domain language from the specifications.

Examples:

```text
Listing
ListingCategory
ListingAttributeDefinition
Favorite
Conversation
Message
Report
ModerationAction
Business
Event
Location
```

Do not create inconsistent synonyms such as `Ad`, `ItemPost`, or `FlagCase` if the approved
domain term is Listing or Report.

---

## 13. Constants & Enums

Lifecycle states, roles, moderation reasons, verification states, and similar domain values
must use centralized types/constants or schema enums where appropriate.

Avoid magic strings scattered throughout UI and backend code.

---

## 14. Comments

Comments should explain non-obvious reasoning, constraints, or safety decisions.

Do not narrate obvious syntax.

Security-sensitive or lifecycle-sensitive behavior may include concise comments explaining
why a guard exists.

---

# PART V — DATABASE RULES

## 15. Schema Authority

The approved Database Schema & ER Specification is the baseline.

Before changing schema:

- Confirm the task requires it.
- Check existing migrations.
- Preserve relationships and lifecycle semantics.
- Consider existing data.
- Avoid destructive migration shortcuts.

---

## 16. Migrations

Every persistent schema change requires a proper migration according to the repository's
database tooling.

Do not:

```text
Drop and recreate production-like data casually
Edit an already-applied migration as a shortcut
Depend on manual database edits
Hide schema drift
```

Migration and application code must remain compatible.

---

## 17. Data Integrity

Enforce important invariants at the strongest appropriate layer.

Examples:

- Foreign keys
- Unique constraints
- Non-null requirements
- Check constraints where supported
- Transaction boundaries
- Domain validation
- Server authorization

Do not depend entirely on client-side validation.

---

## 18. Soft Delete / Lifecycle

Use the approved lifecycle/status model.

Do not convert moderation removal, archival, completion, suspension, and deletion into one
generic boolean if the specifications distinguish them.

Historical and audit-relevant records must not be casually destroyed.

---

## 19. Query Safety

Queries must be:

- Parameterized through approved ORM/query tooling
- Bounded
- Paginated where collections can grow
- Indexed appropriately for important access patterns
- Scoped by authorization where required

Avoid N+1 query patterns on major listing/admin pages.

---

# PART VI — SERVER/API RULES

## 20. Server Authority

The server is authoritative for:

```text
Authentication
Authorization
Lifecycle transitions
Moderation
Validation
Database writes
Private data access
AI provider access
External integrations
```

Never rely on hidden/disabled UI controls as protection.

---

## 21. Input Validation

Every write endpoint/action validates input server-side.

Validate:

- Types
- Lengths
- Enums
- IDs
- Numeric ranges
- URLs
- File types
- Dynamic category attributes
- State transitions

Reject unknown or disallowed fields where practical.

---

## 22. DTO Boundaries

Do not return raw database entities directly to public clients when they contain private or
internal fields.

Create appropriate DTOs/view models.

Examples:

```text
PublicListingDTO
PublicUserProfileDTO
AdminListingDTO
ConversationDTO
```

Public DTOs must exclude private coordinates, internal risk data, moderation notes,
security data, and non-public contact information.

---

## 23. Error Handling

Return safe, useful errors.

Do not expose:

- Stack traces
- Raw SQL/database errors
- Secrets
- Internal moderation reasoning
- Whether inaccessible private records exist

Log operational detail server-side where appropriate.

---

## 24. Idempotency

Actions that naturally behave as toggles or repeatable operations should be safe against
duplicate submission where practical.

Examples:

- Favorite/unfavorite
- Notification read state
- Certain moderation transitions
- Retryable external operations

---

# PART VII — AUTHENTICATION & AUTHORIZATION

## 25. Authentication

Use the approved authentication system already established by the project.

Protected actions include:

```text
Post
Save
Message
Account management
Private notifications
Admin/moderation
```

Preserve safe return destinations through login when required.

---

## 26. Authorization

Check authorization server-side for every protected resource.

Examples:

- Listing owner may edit their listing.
- Conversation participants may read the conversation.
- Business members act according to business role.
- Moderator/Admin actions require explicit permission.
- Ordinary users cannot access admin records.

Never trust a user ID, role, owner ID, or business ID supplied by the client without
verification.

---

## 27. Admin Permissions

Use explicit permission checks rather than UI-only role assumptions.

Moderator, Admin, and Super Admin remain distinct.

High-impact operations require the safeguards defined in the Admin Dashboard and Security
specifications.

---

# PART VIII — UI IMPLEMENTATION

## 28. Design System

Use the approved GuzoMarket UI/UX Design System.

Do not create a different visual language page by page.

Reuse shared primitives for:

```text
Buttons
Inputs
Cards
Badges
Dialogs
Sheets
Tabs
Tables
Skeletons
Empty states
Errors
Navigation
Listing cards
Business cards
```

---

## 29. Approved Front Page Direction

The approved homepage/front-page design direction remains the visual baseline.

Implementation should preserve:

- Clear GuzoMarket branding
- Search + location prominence
- Category discovery
- Popular Near You
- Trust/privacy messaging
- Featured Businesses
- Community Near You
- Account CTA/context
- Responsive mobile design

Do not reintroduce removed native-app badges before native apps exist.

---

## 30. Responsive Design

Every consumer page must be intentionally implemented for desktop and mobile.

Do not treat mobile as desktop merely squeezed into a narrow viewport.

Admin is desktop-first but urgent moderation workflows remain usable on smaller screens.

---

## 31. Page States

Every major data-driven screen requires:

```text
Loading
Empty
Filtered-empty where applicable
Error
Unauthorized where applicable
Not found where applicable
Partial failure where appropriate
```

Do not ship pages that only handle the happy path.

---

## 32. Forms

Forms require:

- Labels
- Server validation
- Client validation where useful
- Inline errors
- Pending state
- Prevention of duplicate submissions
- Preservation of user input after recoverable errors

Do not silently discard seller-entered listing content.

---

# PART IX — ACCESSIBILITY

## 33. Accessibility Target

Implement toward WCAG 2.2 AA.

At minimum:

- Semantic HTML
- Keyboard access
- Visible focus
- Correct labels
- Logical heading hierarchy
- Accessible dialogs/sheets
- Error associations
- Appropriate touch targets
- Non-color-only status communication
- Meaningful image alt text
- Screen-reader-compatible status updates

Accessibility is part of Definition of Done.

---

# PART X — SECURITY & TRUST

## 34. Security Baseline

Follow the Security & Trust/Safety Specification.

Never weaken a security requirement because it complicates implementation.

Apply:

- Least privilege
- Secure session behavior
- Input validation
- Output encoding
- Rate limiting
- Safe upload handling
- Authorization
- CSRF protections where applicable
- Appropriate security headers
- Safe error handling
- Secret management

---

## 35. Secrets

Secrets belong in environment/secret management.

Never:

```text
Commit secrets
Expose server keys to browser code
Print secrets in logs
Put secrets in screenshots/test fixtures
Return provider keys through admin APIs
```

Provide documented placeholder environment variables where required.

---

## 36. File Uploads

Uploads must validate:

- Ownership/authorization
- Size
- Allowed media type
- File signature where applicable
- Storage path/key generation

Strip sensitive image metadata where required by the security specification.

Do not trust filename extensions.

---

## 37. Location Privacy

Public consumer listings must not expose exact residential location by default.

Use normalized approximate public location according to the approved specification.

Never leak private latitude/longitude through HTML, API payloads, metadata, maps, or
analytics.

---

## 38. Messaging Safety

Only authorized conversation participants may access messages.

Block/report functionality must remain available as specified.

Do not expose private conversations to unrelated users or broad admin surfaces without a
legitimate moderation purpose.

---

## 39. Moderation Safety

Reporter identity remains private from reported users.

Internal notes remain internal.

High-impact moderation actions require reason, confirmation, authorization, and audit.

AI signals never bypass these requirements.

---

# PART XI — SEARCH & DISCOVERY

## 40. Search

The deterministic search system remains the core search engine.

Search state should be shareable through URL parameters where specified.

Apply filters server-side and validate them.

Results must be bounded and paginated.

---

## 41. SEO

For approved indexable public pages implement:

- Unique page title
- Meta description
- Canonical URL
- Open Graph metadata where appropriate
- Structured data only when it accurately matches visible content

Do not index private account/admin pages.

Avoid uncontrolled indexation of arbitrary search-filter combinations.

---

# PART XII — ANALYTICS & LOGGING

## 42. Analytics

Use stable snake_case event names defined by the page/product specifications.

Do not place unnecessary personal or sensitive content into analytics properties.

Analytics are not an authorization, moderation, or audit mechanism.

---

## 43. Logging

Logs should support debugging and operations without becoming a shadow database of private
content.

Do not broadly log:

- Passwords
- Tokens
- Secrets
- Full private messages
- Identity documents
- Raw sensitive AI prompts

Use correlation/request IDs where appropriate.

---

## 44. Audit Logging

Privileged admin/moderation actions use the approved AuditLog mechanism.

Audit records are distinct from analytics.

Normal application behavior must not permit editing/deleting audit history.

---

# PART XIII — AI IMPLEMENTATION

## 45. AI Is Optional Infrastructure

Core GuzoMarket must function without AI.

AI features are independently feature-flagged.

Provider calls occur server-side behind approved AI services/provider abstraction.

---

## 46. AI Output

Treat model output as untrusted.

Validate:

```text
Schema
Enums
IDs
Ranges
Lengths
Policy constraints
Permissions where relevant
```

AI output never bypasses ordinary database/business validation.

---

## 47. AI User Content

Generated listing text is:

- Explicitly requested
- Shown as a suggestion
- Editable
- Rejectable
- Never silently published

Preserve the user's original content.

---

## 48. AI Moderation

AI moderation is assistive.

Do not implement autonomous permanent bans, identity decisions, criminal determinations, or
other prohibited high-impact decisions.

Human reviewers retain accountable authority according to the AI and Admin specifications.

---

# PART XIV — ENVIRONMENT & CONFIGURATION

## 49. Environment Variables

Use typed/validated environment configuration where supported.

Separate:

```text
Public browser-safe variables
Server-only configuration
Secrets
Provider credentials
Feature flags
```

Fail clearly at startup/build time for missing required server configuration when
appropriate.

Do not expose server-only values through public bundles.

---

## 50. Development Defaults

Local development may use safe placeholder/test services where approved.

Do not create production code that depends on undocumented local-only behavior.

Document required setup.

---

# PART XV — SEED DATA

## 51. Seed Principles

Seed data should support development and testing without resembling real private users.

Include representative:

```text
DMV locations
Categories/subcategories
Category attributes
Sample users
Sample listings
Businesses/events when their phases are implemented
Moderation/report examples where useful
```

Clearly mark seed/demo content.

Never seed real credentials or secrets.

---

# PART XVI — TESTING

## 52. Testing Requirement

Every implementation stage should add or update tests appropriate to the change.

Use the repository's approved test framework.

Test behavior, not merely implementation details.

---

## 53. Critical Test Classes

Depending on the task, include:

```text
Unit tests
Validation tests
Service/domain tests
Authorization tests
API/server-action tests
Database/integration tests
Component tests
End-to-end critical flows
```

---

## 54. Security Tests

Always consider:

- Unauthorized access
- Cross-user access
- Forged ownership IDs
- Forged roles
- Invalid lifecycle transitions
- Oversized/malformed input
- Private-field leakage
- Upload abuse
- Rate-limit behavior where relevant

---

## 55. Responsive & Accessibility Verification

For UI tasks verify relevant desktop/mobile breakpoints and keyboard behavior.

Run automated accessibility checks where available, but do not treat automation as complete
accessibility validation.

---

# PART XVII — DEFINITION OF DONE

## 56. A Task Is Done Only When

All applicable items are true:

```text
Requirement implemented
Code follows repository architecture
Types compile
Lint passes
Relevant tests pass
Database migration succeeds
Authorization verified
Validation verified
Loading/empty/error states implemented
Responsive behavior verified
Accessibility reviewed
No private-data leakage
No secrets committed
No obvious security regression
No placeholder/mock production path remains
Documentation/config updated if required
```

A visually rendered page with fake data is not complete if the task requires real
integration.

---

## 57. Verification Before Claiming Completion

Before saying a task is complete, Codex must run the applicable repository checks.

Examples:

```text
typecheck
lint
unit/integration tests
targeted end-to-end tests
build
migration validation
```

Do not claim a command passed if it was not run.

If a command cannot run, report exactly why.

---

# PART XVIII — AMBIGUITY

## 58. Handling Ambiguity

When a small reversible implementation detail is unspecified:

1. Follow existing repository convention.
2. Follow the design/system pattern.
3. Choose the simplest secure implementation.
4. Document the assumption in the completion summary if meaningful.

When ambiguity affects:

```text
Security
Privacy
Payments
Authorization
Data deletion
Moderation authority
Legal obligations
Major architecture
Public API compatibility
```

do not guess. Surface the issue.

---

## 59. Do Not Over-Ask

Do not stop for trivial decisions that can be safely resolved from existing conventions.

Clarification is appropriate only when the missing decision materially affects product
behavior, security, architecture, or irreversible data design.

---

# PART XIX — PROHIBITED SHORTCUTS

## 60. Never Use These as "Temporary" Completion

Do not:

- Hard-code authenticated users.
- Hard-code admin access.
- Trust client-supplied roles.
- Skip authorization because a route is hidden.
- Use mock data in production paths when real integration is required.
- Publish exact residential coordinates.
- Expose private DTO fields.
- Disable validation to make a form submit.
- Swallow errors silently.
- Use `any` broadly to bypass type failures.
- Disable lint/tests rather than fix the issue.
- Delete failing tests without justification.
- Hard-code secrets.
- Edit production data manually instead of migrations.
- Implement permanent moderation actions without audit.
- Let AI publish or enforce autonomously outside approved boundaries.
- Add native-app download claims before native apps exist.
- Label unverified businesses/users as verified.
- Treat Featured as equivalent to Verified.
- Invent ratings/reviews.
- Invent legal text as production-approved legal advice.

---

# PART XX — IMPLEMENTATION REPORT FORMAT

## 61. Completion Summary

At the end of each sequential build task, provide a concise report:

```text
Implemented
- ...

Files changed
- ...

Database/migrations
- ...

Tests/checks run
- ...

Security/privacy notes
- ...

Known limitations / deferred items
- ...

Ready for next prompt: Yes/No
```

Do not dump enormous code listings into the summary.

---

## 62. Failed/Partial Task

If the task cannot be fully completed, say so.

Report:

```text
Completed portion
Blocking issue
Evidence/error
Safest next action
```

Do not disguise partial completion as success.

---

# PART XXI — BUILD SEQUENCE DISCIPLINE

## 63. Sequential Prompt Authority

The forthcoming **GuzoMarket Sequential Codex Build Prompts** will divide implementation
into dependency-aware stages.

For each prompt:

- Implement only its scope plus necessary supporting changes.
- Do not jump ahead into later features.
- Do not create speculative infrastructure for distant phases.
- Leave the repository in a working state.
- Complete verification before proceeding.

---

## 64. Recommended Build Order

The sequential prompt set should broadly follow:

```text
0. Repository audit & baseline
1. Project foundation/configuration
2. Database schema & migrations
3. Seed data
4. Authentication
5. Global UI shell/design primitives
6. Location/category infrastructure
7. Homepage
8. Search/discovery
9. Listing detail
10. Posting flow
11. Account/profile/my listings
12. Saved listings
13. Messaging
14. Notifications
15. Trust & Safety/reporting/blocking
16. Admin foundation & permissions
17. Admin users/listings
18. Moderation reports/workflow
19. Jobs
20. Businesses
21. Events
22. Community
23. SEO/analytics/performance hardening
24. Security/accessibility QA
25. AI Phase 1.5 features
26. Production readiness
```

Exact stages may be adjusted to match repository dependencies, but dependency order and
controlled scope should be preserved.

---

# PART XXII — FINAL ENGINEERING PRINCIPLES

## 65. Optimize For

```text
Correctness over cleverness
Security over convenience
Clarity over abstraction for abstraction's sake
Data integrity over quick demos
Reusable design patterns over page-specific hacks
Incremental verified delivery over giant rewrites
User privacy over unnecessary data collection
Human accountability over autonomous AI decisions
```

---

## 66. Final Instruction to Codex

Before every implementation change, ask internally:

```text
What approved requirement am I implementing?
What data and permissions does it involve?
What can fail?
What could leak?
What lifecycle rules apply?
What states must the UI handle?
How will I verify it?
```

Then implement the smallest complete, production-quality change that satisfies the current
build prompt and the approved GuzoMarket specifications.

Do not declare success until the applicable checks have actually passed.

---

# PART XXIII — NEXT DELIVERABLE

## 67. Sequential Codex Build Prompts

The next document is:

**GuzoMarket Sequential Codex Build Prompts v1.0**

It should turn the approved specification package into copy/paste-ready implementation
prompts.

Each prompt should contain:

```text
Stage objective
Prerequisites
Relevant source documents
Exact implementation scope
Required files/components/services
Database work if applicable
Security requirements
UI/UX requirements
Tests
Verification commands
Explicit out-of-scope items
Completion report requirement
Stop condition
```

The prompts should be dependency-aware and should prevent Codex from trying to build the
entire marketplace in one uncontrolled generation.

---

**End of GuzoMarket Codex Master Instructions v1.0**
