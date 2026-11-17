# Monorepo

A full-stack monorepo with shared libraries, React client applications (main app and marketing), and a NestJS API.

## Structure

- `packages/shared` - Shared TypeScript types, DTO contracts, and interfaces
- `apps/app` - React + TypeScript + Vite frontend for the main operational application (shifts, inventory, sales, production)
- `apps/marketing` - React + TypeScript + Vite frontend for marketing and public landing pages
- `apps/api` - NestJS backend API

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm (v9+)

### Installation

```bash
pnpm install
```

### Development

Run applications from the repository root:

```bash
pnpm dev:app          # Main app
pnpm dev:marketing    # Marketing site
pnpm dev:api          # NestJS API
```

Or from individual app directories:

```bash
cd apps/app && pnpm dev
cd apps/marketing && pnpm dev
cd apps/api && pnpm dev
```

### Building

Build all packages:

```bash
pnpm build
```

Build specific packages:

```bash
pnpm build:app
pnpm build:marketing
pnpm build:api
pnpm --filter @repo/shared build
```

## Scripts

- `pnpm dev:app` - Start main application development server
- `pnpm dev:marketing` - Start marketing site development server
- `pnpm dev:api` - Start API development server
- `pnpm build` - Build API and all frontend apps
- `pnpm build:app` - Build main application only
- `pnpm build:marketing` - Build marketing site only
- `pnpm build:api` - Build API only
- `pnpm start:api` - Start API production server
- `pnpm start:app` - Preview main application production build
- `pnpm start:marketing` - Preview marketing site production build
- `pnpm lint` - Lint codebase across workspace packages
- `pnpm format:check` - Check formatting across workspace packages

## Shared Library

The `@repo/shared` package contains common types, enums, error taxonomy, and interfaces used across the monorepo.

Update it at `packages/shared/src/index.ts` and it will be available to all apps.
