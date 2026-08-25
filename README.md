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

## Database Setup

Apply the Prisma migrations to a local PostgreSQL database:

```bash
npx prisma migrate dev
```

Seed deterministic development fixtures:

```bash
npm run db:seed
npm run db:seed:verify
```

The seed data uses only synthetic `@guzomarket.test` users, non-login fixture password hashes, approximate DMV public locations, and local placeholder images from `public/fixtures/listings`. Rerunning the seed removes and recreates only known demo records, then preserves unrelated local data.

To reset local development data from scratch:

```bash
npx prisma migrate reset
```

Validate the Prisma schema with:

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

Stage 3 seed data and development fixtures are implemented. Authentication, accounts, listing posting flows, search UI, messaging UI, moderation UI, admin dashboards, payments, maps, email, storage providers, analytics providers, and AI features are out of scope for this stage.
