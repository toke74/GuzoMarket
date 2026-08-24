# GuzoMarket

GuzoMarket is a web marketplace foundation for the Washington, DC / Maryland / Northern Virginia community. Prompt 0 establishes the engineering baseline only; marketplace features are intentionally not implemented yet.

## Technology Stack

- Next.js App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui-style primitives
- PostgreSQL
- Prisma ORM
- Vitest and Testing Library

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL for future database stages

## Install

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env.local` and set local values:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guzomarket?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`DATABASE_URL` is server-only and must not be exposed to browser code.

## Database Setup Placeholder

Prompt 0 initializes Prisma with a PostgreSQL datasource and client generator only. The full marketplace schema, migrations, and seed data are deferred to later prompts.

Validate the current Prisma foundation with:

```bash
npm run prisma:validate
```

## Development

```bash
npm run dev
```

## Verification Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Repository Structure

```text
src/
  app/
  components/
    ui/
    layout/
    marketplace/
  features/
  server/
  lib/
  types/
prisma/
  schema.prisma
  migrations/
  seed/
public/
tests/
```

## Current Stage Status

Prompt 0 foundation is the active stage. Authentication, accounts, listings, search, messaging, moderation, admin, jobs, businesses, events, community, payments, maps, email, storage, analytics, and AI features are out of scope for this stage.
