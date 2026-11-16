# Agent instructions

## Project overview

TallyBakery is intended to be a multi-tenant, offline-first operations and reconciliation platform for shift-based businesses, with commercial bakeries as the initial use case. It connects procurement, raw-material usage, production, finished-stock transfers, customer orders and payments, dispatch, and shift handovers so that stock and cash movements can be reconciled to their actors.

The repository is a pnpm TypeScript monorepo:

- `apps/app` — React 19 and Vite frontend for the main operational application (shifts, inventory, sales, production, reconciliation).
- `apps/marketing` — React 19 and Vite frontend for marketing and public landing pages.
- `apps/api` — NestJS REST API.
- `packages/shared` — shared TypeScript contracts and types.
- `docs` — product requirements and software design documents.

The implementation is currently a starter scaffold. Do not assume the proposed database, authentication, offline sync, PWA, or domain modules in the design document already exist. Treat the PRD as product requirements and the software design document (SDD) as proposed implementation guidance; distinguish both from implemented behavior when making changes.

Read the relevant sections of these documents before changing product behavior:

- `docs/Product Requirements Document_ Shift-Based Invento....md` — personas, access boundaries, workflows, goals, and product requirements.
- `docs/tallybakery_software_design_document.md` — proposed architecture, domain model, ledger rules, API conventions, offline synchronization, security, and acceptance criteria.
- `docs/shared_package.md` — specification of the shared contracts package (`@repo/shared`), including types, enums, error taxonomy, pagination, and boundary rules.

## Workspace and commands

Run commands from the repository root unless noted. Install dependencies with:

```bash
pnpm install
```

The README specifies Node.js 18+ and pnpm 9+.

### Development

Run each app in its own terminal:

```bash
pnpm dev:app
pnpm dev:marketing
pnpm --filter @repo/api start:dev
```

The frontend apps also support `pnpm --filter @repo/app dev` and `pnpm --filter @repo/marketing dev`. The root `dev:api` script currently calls the API package's `dev` script, which is not defined; use `start:dev` directly for API watch mode.

### Build and preview

```bash
pnpm build                 # API, then main app and marketing site
pnpm build:api
pnpm build:app
pnpm build:marketing
pnpm --filter @repo/shared build
pnpm start:api
pnpm start:app             # previews the main app production build
pnpm start:marketing       # previews the marketing site production build
```

The root `build` script does not invoke the shared package build. Build `@repo/shared` separately when a change or local build requires its generated `dist` output.

### Tests, lint, and formatting

```bash
pnpm --filter @repo/api test
pnpm --filter @repo/api test:watch
pnpm --filter @repo/api test:cov
pnpm --filter @repo/api test:e2e
pnpm --filter @repo/api lint
pnpm --filter @repo/app lint
pnpm --filter @repo/marketing lint
pnpm --filter @repo/shared lint
pnpm lint
pnpm format:check
```

API tests use Vitest. The client apps (`apps/app`, `apps/marketing`) and shared package currently have no test scripts (the client apps use oxlint for linting). Root formatting writes across the repository (`pnpm format`); prefer the check command or a narrowly scoped formatter for validation.

Root scripts are declared in `package.json`; package-specific scripts are declared in each workspace package's `package.json`. Use the script that exists in the relevant manifest rather than relying on stale README examples.

## Product and domain invariants

When implementing product functionality, preserve these requirements from the PRD and SDD:

- Enforce tenant, branch, department, and role access on the server. Never authorize a request based only on tenant/user identifiers supplied by the client.
- Keep each role's information boundaries intact. In particular, production users must not see sales or cash data, cashiers must not see production/raw-material or fulfillment controls, and dispatch users must not see monetary or procurement data unless explicitly authorized.
- Treat stock and financial movements as append-only ledgers. Correct finalized records with linked compensating entries rather than silently editing or deleting history.
- Make critical multi-record operations atomic and idempotent. Orders, payments, stock movements, transfer acceptance, shift seals, and sync outcomes must not be partially applied or duplicated.
- Derive balances and reconciliation results from recorded movements; do not make a manually maintained summary the authoritative source.
- Keep offline-created mutations durable and visible until acknowledged. Validate authorization and event payloads on the server, deduplicate with stable event IDs, and surface conflicts rather than silently discarding or rewriting them.
- Validate all inputs at API boundaries, apply field-level as well as route-level authorization, and avoid returning sensitive fields to unauthorized roles.
- Keep operational calculations deterministic. Use decimal-safe money representations and explicit quantity units if/when those domains are implemented.

These are product/design requirements, not proof that the corresponding controls or infrastructure are already present. Add tests for the behavior being introduced, especially authorization, ledger updates, idempotency, and reconciliation.

## Implementation conventions

- Follow the existing TypeScript, module, and formatting patterns in the package being changed. The API uses ESM imports with `.js` extensions in TypeScript source; preserve that convention.
- Keep client-safe shared contracts in `packages/shared`. Do not expose ORM entities, persistence internals, secrets, or server-only types to the browser.
- Keep deployable boundaries between client applications and API. Put validation and authoritative business rules on the API, not only in UI code.
- Prefer small domain-focused NestJS modules/services and typed React components over adding unrelated abstractions.
- Add or update tests alongside behavior changes. For shared contracts, check the affected client apps and API builds as well as the package build.
- Do not add a database, authentication provider, external service, or new framework based solely on the proposed SDD; confirm the integration choices in the relevant task context and document changes where appropriate.

## Skills

For every task in this repository, first read and follow the project-local
[monorepo-development skill](.agents/skills/skills/monorepo-development/SKILL.md).
It applies to frontend, backend, shared-package, and cross-workspace work.

If the working environment provides another skill that directly applies to the
task, use it alongside these project instructions. Do not assume an optional
integration or skill is installed.

## API-specific guidance

The API also has [`apps/api/AGENTS.md`](apps/api/AGENTS.md). Follow it for work under `apps/api`; these root instructions apply repo-wide and supplement, rather than replace, that file.
