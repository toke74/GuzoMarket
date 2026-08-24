# GuzoMarket — Greenfield Codex Prompt 0 v1.0

**Purpose:** Create the initial GuzoMarket repository and project foundation from scratch.
**Project type:** Greenfield / no existing codebase
**Implementation mode:** Foundation only — no marketplace feature development yet

---

## PROMPT 0 — GREENFIELD REPOSITORY CREATION

You are creating GuzoMarket from scratch.

Read and follow these approved documents:

1. GuzoMarket Codex Master Instructions v1.0
2. GuzoMarket Master PRD v1.1
3. GuzoMarket Information Architecture & Complete Sitemap v1.0
4. GuzoMarket UI/UX Design System v1.0
5. GuzoMarket Database Schema & ER Specification v1.0
6. GuzoMarket API & Backend Specification v1.0
7. GuzoMarket Security & Trust/Safety Specification v1.0
8. GuzoMarket Page-by-Page UX & Functional Specification v1.0
9. GuzoMarket Admin Dashboard Specification v1.0
10. GuzoMarket AI Feature Specification v1.0

This is a greenfield project. There is no existing repository or codebase to preserve.

Your job in this stage is to create the initial repository and engineering foundation only.

Do not build marketplace features yet.

---

## 1. OBJECTIVE

Create a production-oriented GuzoMarket web application foundation using the approved stack:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
PostgreSQL
Prisma ORM
```

The repository must be able to:

```text
install dependencies
run development server
typecheck
lint
run tests
build successfully
```

---

## 2. PROJECT CREATION

Create a new Next.js project using the current stable production-ready setup supported by
the environment.

Required:

```text
Next.js App Router
TypeScript
ESLint
Tailwind CSS
src/ directory if appropriate
modern package manager lockfile
```

Do not use the legacy Pages Router.
Remove unnecessary starter/demo routes.

---

## 3. APPROVED REPOSITORY STRUCTURE

Create a structure conceptually aligned with:

```text
src/
  app/
  components/
    ui/
    layout/
    marketplace/
  features/
    auth/
    users/
    listings/
    search/
    categories/
    locations/
    favorites/
    messaging/
    notifications/
    moderation/
    admin/
    businesses/
    jobs/
    events/
    community/
  server/
    auth/
    db/
    services/
    policies/
    validation/
    rate-limit/
    uploads/
    email/
    audit/
  lib/
    config/
    errors/
    formatting/
    security/
    utils/
  types/

prisma/
  schema.prisma
  migrations/
  seed/

public/
tests/
```

Adapt exact placement to current Next.js conventions, but preserve module boundaries.

---

## 4. PACKAGE & DEPENDENCY SETUP

Install only foundation dependencies.

Required or expected where compatible:

```text
prisma
@prisma/client
zod
shadcn/ui dependencies
class-variance-authority
clsx
tailwind-merge
lucide-react
```

Use a stable testing setup such as Vitest + Testing Library if appropriate.

Do not add Stripe, AI SDKs, Maps SDKs, email vendors, S3 SDKs, realtime vendors, or
analytics vendors yet.

---

## 5. TYPESCRIPT

Configure strict TypeScript.

Required:

```text
strict: true
```

Avoid broad `any`.

Create useful path aliases if appropriate:

```text
@/components
@/features
@/server
@/lib
@/types
```

---

## 6. ENVIRONMENT CONFIGURATION

Create typed environment handling.

Prepare at minimum:

```text
DATABASE_URL
NEXT_PUBLIC_APP_URL
```

Create:

```text
.env.example
```

Rules:

- Never commit real secrets.
- Separate browser-safe from server-only values.
- Do not expose DATABASE_URL to browser code.
- Validate required environment variables.
- Do not add unused provider keys yet.

---

## 7. DATABASE FOUNDATION

Install and initialize Prisma.

Create only the minimum Prisma foundation:

```text
PostgreSQL datasource
Prisma client generator
```

Do not implement the full marketplace schema in this prompt.

Do not invent a temporary simplified marketplace schema.

---

## 8. DESIGN SYSTEM FOUNDATION

Implement semantic GuzoMarket tokens for:

```text
Primary Green    #087F5B
Primary Hover    #066B4C
Light Green      #E8F5F0
Accent Gold      #F4B740
Navy             #102A43
Main Text        #172B4D
Secondary Text   #64748B
Background       #F8FAFC
Card             #FFFFFF
Border           #E5E7EB
Success          #16A34A
Warning          #F59E0B
Error            #DC2626
```

Expose semantic names such as:

```text
brand-primary
brand-primary-hover
brand-accent
background
surface
surface-muted
text-primary
text-secondary
text-inverse
border
border-strong
success
warning
error
```

Avoid scattering raw hex values through components.

---

## 9. TYPOGRAPHY

Configure:

```text
Inter     → primary UI font
Manrope   → display/brand font
```

Use supported Next.js font loading.

Create reusable typography utilities/tokens aligned to the approved design system.

---

## 10. LAYOUT TOKENS

Implement:

```text
Standard desktop content width: 1280px
Maximum wide content width: 1440px
Desktop gutter: 32px
Tablet gutter: 24px
Mobile gutter: 16px
```

Spacing scale:

```text
4
8
12
16
24
32
48
64
80
96px
```

Border radius:

```text
sm 8px
md 12px
lg 16px
xl 24px
```

---

## 11. SHADCN/UI

Initialize shadcn/ui properly.

Add only foundational components needed now, for example:

```text
Button
Input
Textarea
Card
Badge
Dialog
Sheet
DropdownMenu
Avatar
Skeleton
Tabs
```

Customize them to the GuzoMarket token system.

Do not install the full shadcn catalog.

---

## 12. BASE GLOBAL LAYOUT

Create the root application layout with:

```text
HTML metadata foundation
Inter UI font
Manrope display font
global background
semantic text colors
responsive container utility
accessible main content structure
```

Use application metadata conceptually based on:

```text
GuzoMarket
Buy. Sell. Connect.
```

Do not build the full SEO layer yet.

---

## 13. FOUNDATION UI COMPONENTS

Create only reusable primitives required to validate the design-system foundation.

Recommended:

```text
Container
PageSection
SectionHeader
EmptyState
ErrorState
LoadingSkeleton
```

Do not build final ListingCard, BusinessCard, Header, Footer, homepage, or feature-specific
components yet.

---

## 14. TEMPORARY ROOT PAGE

Create a minimal temporary `/` page showing:

```text
GuzoMarket
Buy. Sell. Connect.
Project foundation is ready.
```

A small component/token preview is acceptable.

This page will be replaced by the approved homepage later.

Do not recreate the homepage in Prompt 0.

---

## 15. ERROR FOUNDATION

Create a reusable safe application-error pattern:

```text
safe application error type
user-safe error message utility
development logging boundary
```

Do not expose stack traces to users.

---

## 16. UTILITIES

Create only clearly needed reusable utilities, for example:

```text
cn()
formatDate foundation
safe base URL helper
environment config
```

Avoid speculative utility libraries.

---

## 17. SECURITY FOUNDATION

Implement baseline safeguards appropriate to this stage:

```text
no secrets in client code
no unsafe HTML rendering
no database credentials exposed
safe environment separation
secure dependency choices
```

Do not claim full security hardening is complete yet.

---

## 18. ACCESSIBILITY FOUNDATION

Foundation components must include:

```text
visible focus states
semantic buttons/inputs
labels where inputs are demonstrated
keyboard-accessible dialogs/sheets
appropriate contrast
```

Do not rely on color alone.

---

## 19. DEVELOPMENT DOCUMENTATION

Create or update `README.md`.

Include:

```text
Project overview
Technology stack
Prerequisites
Install
Environment setup
Database setup placeholder
Development command
Typecheck command
Lint command
Test command
Build command
Repository structure
Current stage status
```

Clearly state that marketplace features are intentionally not implemented in Prompt 0.

---

## 20. PACKAGE SCRIPTS

Ensure working scripts for:

```text
dev
build
start
lint
typecheck
test
```

`test:watch` is acceptable if useful.

Do not create scripts that silently ignore failures.

---

## 21. TEST FOUNDATION

Add a minimal meaningful test suite.

Examples:

```text
environment/config utility test
shared component render test
```

The goal is to prove the test infrastructure works.

---

## 22. VERIFICATION

Before declaring completion, actually run:

```text
dependency installation
typecheck
lint
tests
production build
```

Run Prisma/tooling validation if safe at this stage.

Fix real errors.

Do not claim commands passed unless they were executed.

---

## 23. EXPLICITLY OUT OF SCOPE

Do not implement:

```text
Full database schema
Seed data
Authentication
User accounts
Homepage
Search
Listings
Posting flow
Favorites
Messaging
Notifications
Trust & Safety workflows
Admin dashboard
Jobs
Businesses
Events
Community
Payments
Subscriptions
Maps
Email provider integration
Object storage integration
AI features
Native apps
```

---

## 24. COMPLETION CRITERIA

Prompt 0 is complete only when:

- A new GuzoMarket repository exists.
- Next.js runs.
- TypeScript strict mode works.
- Tailwind works.
- shadcn/ui is initialized.
- Inter and Manrope are configured.
- Semantic GuzoMarket design tokens exist.
- Prisma is initialized for PostgreSQL.
- Typed environment configuration exists.
- Repository/module structure is established.
- README/setup instructions exist.
- Test infrastructure works.
- Typecheck passes.
- Lint passes.
- Tests pass.
- Production build passes.
- No marketplace feature scope was prematurely implemented.
- No secrets are committed.

---

## 25. REQUIRED COMPLETION REPORT

At the end, provide:

```text
Implemented
- ...

Repository structure created
- ...

Dependencies added
- ...

Environment variables
- ...

Database/Prisma status
- ...

Design-system foundation
- ...

Tests/checks actually run
- command: result
- command: result
- ...

Security/privacy notes
- ...

Deferred to later stages
- ...

Ready for next database stage: Yes/No
```

Do not automatically continue to the next stage.

---

**End of GuzoMarket Greenfield Codex Prompt 0 v1.0**
