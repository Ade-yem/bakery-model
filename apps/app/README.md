# @repo/app (TallyBakery Main Application)

The main operational web application for TallyBakery — a multi-tenant, offline-first operations and reconciliation platform for commercial bakeries and shift-based food manufacturing facilities.

## Overview

This application serves as the primary user interface for bakery staff and managers across all operational roles:

- **Shift & Handover Management**: Shift start, cash float declaration, mid-shift transfers, and shift seals.
- **Inventory & Stock Tracking**: Raw-material receiving, storage location movements, finished-stock transfers.
- **Production & Recipe Execution**: Production batch tracking, recipe scaling, and material consumption logging.
- **Sales & Cashiering**: Order intake, payment processing, customer credit accounts, and receipt issuance.
- **Dispatch & Fulfillment**: Order staging, packing, dispatch verification, and route tracking.
- **Auditing & Reconciliation**: Real-time discrepancy detection across inventory and cash drawers.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Optimization**: [React Compiler](https://react.dev/learn/react-compiler) via Babel plugin
- **Linter**: [Oxlint](https://oxc.rs/)
- **Shared Contracts**: `@repo/shared` workspace dependency

## Getting Started

### Development

Run from the monorepo root:

```bash
pnpm dev:app
```

Or from this directory:

```bash
pnpm dev
```

### Production Build

Run from the monorepo root:

```bash
pnpm build:app
```

Or from this directory:

```bash
pnpm build
```

### Preview

To preview the production build locally:

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Architectural Guidelines & Boundaries

- **API Integration**: Connects to the backend REST API (`apps/api`) under `/api/v1` and auth routes under `/api/auth`.
- **State & Access Boundaries**: Respects tenant, branch, department, and role access boundaries enforced by the API.
- **Shared Types**: Always import shared models, DTOs, enums, and error contracts from `@repo/shared`. Never define duplicate contracts or import server-only code.
