# Design Document

## Module: Backend Foundation, Identity, Tenancy, and Access Control

### TallyBakery — SDD Module 1 and Week 1 Backend/Data Scope

---

## Overview

The Week 1 backend is designed as a set of focused NestJS modules around a
verified request identity and tenant-safe repository boundary. Better Auth owns
identity and sessions. TallyBakery owns business memberships, roles,
permissions, branch/department scopes, master data, and audit evidence.

Every protected request follows the same path:

1. authenticate the cookie/session;
2. resolve active tenant, branch, and optional department selectors against
   active application-owned membership scopes;
3. check a fixed approved permission key and role ceiling;
4. validate the DTO;
5. execute a domain service/use case;
6. query or mutate through a repository that includes tenant/scope predicates;
7. return a caller-specific safe DTO;
8. document the same contract in Swagger/OpenAPI.

This design builds on the implemented Drizzle/Swagger foundation. It does not
pretend that authentication, authorization, master-data modules, or operational
workflows already exist.

## Scope Interpretation and Decisions

- “Module 1” is SDD Module 1: identity, tenant, branch, and access control.
- The backend/data portion of Week 1 also includes item, supplier, and customer
  foundations. These belong conceptually to SDD Module 2 but are Week 1 roadmap
  dependencies.
- PRD Module 1 operational workflows are deferred to Week 2.
- Week 1 roles are fixed and permission keys are allowlisted. Arbitrary role and
  permission builders are deferred.
- The Week 1 catalogue is tenant-wide with unique `(tenant_id, sku)`. Branch
  price/catalogue overrides are deferred until a product rule requires them.
- Application authorization and scoped queries are mandatory. PostgreSQL RLS
  remains a separate defense-in-depth decision because transaction-local tenant
  context must first be proven safe with the selected pooled connection.
- Better Auth adapter/package/version selection is an explicit spike gate, not
  an assumption in this document.
- Swagger is the authoritative endpoint contract. JSDoc supplements service or
  use-case functions whose transaction and policy behavior is not visible in
  the HTTP contract.

## Current Architecture and Evidence

| Concern             | Existing implementation                                                                                                    | Design implication                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Workspace boundary  | `apps/api`, `apps/client`, and `packages/shared` are pnpm workspaces                                                       | Persistence and server policy remain in `apps/api`; only safe serializable contracts belong in `packages/shared`               |
| API bootstrap       | `apps/api/src/main.ts` creates `AppModule` and enables shutdown hooks                                                      | Add global validation, request context, error filter, logging, and auth integration through bootstrap/module composition       |
| API versioning      | `apps/api/src/app.config.ts` sets `/api/v1`                                                                                | Keep domain endpoints under this prefix; mount Better Auth separately at `/api/auth/*`                                         |
| Swagger             | `app.config.ts` publishes `/docs` and `/docs/openapi.json` with a generic bearer scheme                                    | Replace generic-only metadata with the approved cookie/session scheme and per-operation DTO/security/permission documentation  |
| Configuration       | `src/config/environment.ts` validates basic database and port variables                                                    | Extend typed validation for auth secret, trusted origins, cookie policy, readiness timeouts, and logging policy                |
| Database connection | `src/database/database.module.ts` injects Drizzle over node-postgres pooling                                               | Repositories inject the database through `DatabaseModule`; no controller queries Drizzle directly                              |
| Drizzle workflow    | `apps/api/drizzle.config.ts`, migration scripts, and initial migration exist                                               | Extend domain schema by reviewed generated migrations and verify migration history in CI                                       |
| Tenancy schema      | `src/database/schema/tenancy.schema.ts` defines tenant, branch, department, membership, scopes, and role-permission tables | Preserve tenant-consistent composite foreign keys; evolve rather than duplicate these tables                                   |
| Tests               | Vitest unit and Supertest e2e scaffolds exist                                                                              | Add real-PostgreSQL integration suites and authorization matrix e2e tests; retain unit tests for pure policy logic             |
| Current route       | Starter `GET /api/v1` returns “Hello World!”                                                                               | Replace or retain only as a non-contract sample; health endpoints become operational probes                                    |
| Shared contracts    | `packages/shared/src/index.ts` has starter `UserDto` and `ApiResponse`                                                     | Replace or evolve starter contracts intentionally; do not export ORM models or auth internals                                  |
| Domain modules      | No auth, tenant, branch, staff, access, item, supplier, customer, audit, or health modules exist                           | Introduce focused modules and avoid a single `AppModule` service/controller implementation                                     |
| CI/deployment       | No CI workflow is present in the inspected repository                                                                      | Week 1 must add reproducible backend checks and migration-from-empty validation                                                |
| Observability       | `apps/api/AGENTS.md` describes NestJS Observe, but `ObserveModule` is not registered                                       | Structured application logging is required now; Observe integration is enabled only through its approved setup and credentials |

## Architecture

```text
Browser / API client
  Better Auth cookie
  X-Tenant-Id / X-Branch-Id / X-Department-Id selectors
  Idempotency-Key on onboarding and other declared mutations
             |
             v
NestJS HTTP boundary
  /api/auth/* ------------------------> Better Auth handler
  /api/v1/*
      RequestId middleware/interceptor
      Session authentication guard
      ActiveContext resolver
      Permission + scope guard
      ValidationPipe (whitelist + forbid unknown)
      Controller + explicit request/response DTOs
             |
             v
Focused application modules
  IdentityAccessModule   TenantModule       BranchModule
  DepartmentModule       StaffModule        AccessControlModule
  CatalogueModule        SupplierModule     CustomerModule
  AuditModule            HealthModule
             |
             v
Domain services / use cases
  policy checks, status transitions, transactions, safe result models
             |
             v
Tenant-scoped repositories
  every resource lookup includes tenant and relevant branch/department scope
             |
             v
Drizzle ORM + node-postgres
  pooled DATABASE_URL for runtime
  direct privileged URL for reviewed migrations
             |
             v
Neon PostgreSQL
  Better Auth-owned tables
  TallyBakery-owned tenancy, access, audit, idempotency, and master data

Cross-cutting outputs
  -> structured redacted logs / optional NestJS Observe
  -> Swagger UI /docs and OpenAPI JSON /docs/openapi.json
  -> liveness / readiness probes
```

## Module Boundaries

| Module                 | Owns                                                                                  | Exports                                           |
| ---------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `AuthModule`           | Better Auth adapter, route handler, session verification                              | Session verifier used by the auth guard           |
| `RequestContextModule` | Request ID and verified actor/context model                                           | `ActorContext` parameter decorator/resolver       |
| `AccessControlModule`  | Permission catalogue, role ceilings, guard metadata, effective-permission calculation | Permission/scope guards and policy service        |
| `TenantModule`         | Atomic tenant onboarding and current tenant settings                                  | Tenant service only where another module needs it |
| `BranchModule`         | Branch metadata and tenant-scoped repository                                          | Branch query/service interfaces                   |
| `DepartmentModule`     | Department metadata and branch consistency                                            | Department query/service interfaces               |
| `StaffModule`          | Membership lifecycle, invitation orchestration, scope replacement                     | Staff use cases, never raw auth records           |
| `CatalogueModule`      | Items, units, price visibility policy                                                 | Item read/write use cases                         |
| `SupplierModule`       | Supplier master data                                                                  | Supplier read/write use cases                     |
| `CustomerModule`       | Customer master data and credit ceiling                                               | Customer read/write use cases                     |
| `AuditModule`          | Append-only privileged-change events                                                  | Audit writer and authorized query service         |
| `IdempotencyModule`    | Claim/result storage for declared online idempotent mutations                         | Transaction-aware idempotency service             |
| `HealthModule`         | Liveness and bounded database/schema readiness                                        | Health controller                                 |
| `DatabaseModule`       | Drizzle connection lifecycle                                                          | Injected database provider                        |

Controllers do not query Drizzle. Services do not accept unverified tenant IDs
as authority. Repositories require an already verified scope object and still
include tenant/scope predicates in every query.

## Request Lifecycle and Verified Context

```text
Request arrives
  -> assign/validate X-Request-Id
  -> verify Better Auth session
  -> load active tenant membership by auth user ID
  -> validate X-Tenant-Id selector (unless onboarding or /me)
  -> validate X-Branch-Id against membership branch scopes, when required
  -> validate X-Department-Id against membership department scopes, when required
  -> calculate effective permissions from fixed role + tenant role_permissions
  -> enforce endpoint permission and immutable role ceiling
  -> validate/transform DTO
  -> execute service transaction through scoped repository
  -> map result to permission-specific response DTO
  -> emit redacted structured completion log
```

### `ActorContext`

The request context is server-created and immutable for the request:

```ts
interface ActorContext {
  requestId: string;
  authUserId: string;
  membershipId: string;
  tenantId: string;
  role: RoleKey;
  branchIds: readonly string[];
  departmentIds: readonly string[];
  activeBranchId?: string;
  activeDepartmentId?: string;
  permissions: ReadonlySet<PermissionKey>;
}
```

Controller DTOs must not contain authoritative `actorUserId`, `membershipId`,
or `tenantId`. If a selector appears in a path, query, body, or header, it is
cross-checked against `ActorContext` and never replaces it.

## Authentication Spike and Decision Gate

Before feature implementation, create a minimal executable spike that proves:

1. the chosen Better Auth core, Drizzle adapter, and optional NestJS adapter
   versions work with NestJS 12, ESM, node-postgres, and the repository’s
   TypeScript version;
2. sign-up/sign-in creates and reads a cookie-backed session;
3. `/api/auth/*` body handling coexists with Nest domain JSON validation;
4. sign-out and session revocation deny the next protected request;
5. trusted origins, cookie attributes, CSRF behavior, and production secret
   validation are demonstrated;
6. auth migrations and application migrations have a documented order;
7. OpenAPI documentation for auth routes comes from an accurate supported
   source or is linked as separate auth documentation.

Record the result as an ADR or a dedicated section in API documentation. If no
compatible route is proven, stop before implementing membership flows rather
than embedding a speculative adapter.

## Permission and Information-Boundary Design

### Fixed roles

```text
OWNER
MANAGER
RECEPTIONIST
PRODUCTION_SUPERVISOR
DISBURSEMENT_OFFICER
```

### Week 1 permission catalogue

```text
tenant:read              tenant:update
branches:read            branches:manage
departments:read         departments:manage
staff:read               staff:manage
roles:read               roles:manage
items:read               items:manage               items:price:read
suppliers:read           suppliers:manage
customers:read           customers:manage           customers:contact:read
audit:read
```

Permissions are code-defined and versioned in a client-safe shared contract.
`role_permissions` chooses from this allowlist but cannot exceed an immutable
role ceiling. A database row containing an unknown or ceiling-breaking key is
ignored and surfaced as a configuration error; it never widens access.

### Baseline matrix

| Capability                       |               Owner |                          Manager |                    Reception |                   Production |                   Disbursement |
| -------------------------------- | ------------------: | -------------------------------: | ---------------------------: | ---------------------------: | -----------------------------: |
| Tenant metadata read             |              Tenant |                   Assigned scope |                  Own summary |                  Own summary |                    Own summary |
| Tenant settings update           |                 Yes |                               No |                           No |                           No |                             No |
| Branch/department administration |          All tenant |     Assigned manageable branches |                           No |                           No |                             No |
| Staff list/manage                |           All / yes | Assigned scopes / non-owner only |                           No |                           No |                             No |
| Role mappings manage             | Yes within ceilings |                        Read only |                           No |                           No |                             No |
| Items read                       |          All fields |                       All fields |       Finished goods + price | Operational fields, no price |       Finished goods, no price |
| Items manage                     |                 Yes |                     Yes in scope |                           No |                           No |                             No |
| Suppliers                        |         Read/manage |             Read/manage in scope |                           No |                           No |                             No |
| Customers                        |         Read/manage |             Read/manage in scope | Read/manage permitted fields |                           No | No contacts or monetary fields |
| Audit events                     |                Read |       Optional scoped permission |                           No |                           No |                             No |

The matrix is both route-level and field-level. Possessing `items:read` does not
entitle every role to the same item response DTO.

## Data and Identity Contracts

### Existing application-owned tables to retain and evolve

| Table                    | Key contract                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `tenants`                | UUID PK; name; status; subscription tier/status metadata; default ISO currency; settings; timestamps                        |
| `branches`               | UUID PK; tenant FK; unique `(tenant_id, code)`; IANA timezone; active/inactive status                                       |
| `departments`            | UUID PK; tenant + branch composite FK; fixed type; name; status; tenant-consistent unique constraints                       |
| `tenant_memberships`     | UUID PK; tenant FK; Better Auth user ID; display name; fixed role key; lifecycle status; unique `(tenant_id, auth_user_id)` |
| `membership_branches`    | Composite PK and composite FKs proving membership and branch share a tenant                                                 |
| `membership_departments` | Composite PK and composite FKs proving membership and department share a tenant                                             |
| `role_permissions`       | Composite PK `(tenant_id, role_key, permission_key)`; permission key validated against code allowlist and role ceiling      |

### New Week 1 application-owned tables

| Table                 | Important fields and constraints                                                                                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalog_items`       | UUID PK, tenant ID, item type, SKU, name, normalized name, category, UOM code, optional `NUMERIC(19,4)` selling price + currency, status, timestamps; unique `(tenant_id, sku)`                                |
| `suppliers`           | UUID PK, tenant ID, name, normalized name, optional external reference, minimal contact fields, status, timestamps; unique non-null `(tenant_id, external_reference)`                                          |
| `customers`           | UUID PK, tenant ID, display name, normalized name, optional external reference/contact fields, `NUMERIC(19,4)` credit ceiling, currency, status, timestamps; unique non-null `(tenant_id, external_reference)` |
| `audit_events`        | UUID PK, tenant ID, actor auth user ID, actor membership ID, action, subject type/ID, request ID, safe JSON summary, optional previous audit ID, server timestamp; append-only in application paths            |
| `idempotency_records` | Tenant ID + idempotency key unique, operation, request fingerprint, state, response status/safe response reference, created/expiry timestamps; used first for onboarding                                       |

### Better Auth-owned tables

User, session, account, verification, and enabled plugin tables remain owned by
the selected Better Auth adapter. Application migrations do not recreate those
tables. `tenant_memberships.auth_user_id` stores the stable Better Auth user ID;
whether a database FK is safe is decided only after adapter schema ownership
and migration order are proven.

### Status transitions

```text
Membership:
  INVITED -> ACTIVE
  INVITED -> INACTIVE
  ACTIVE  -> SUSPENDED -> ACTIVE
  ACTIVE  -> INACTIVE
  SUSPENDED -> INACTIVE

Tenant: ACTIVE <-> SUSPENDED; ACTIVE/SUSPENDED -> INACTIVE by approved policy
Branch/Department/Item/Supplier/Customer: ACTIVE <-> INACTIVE
```

No public hard-delete endpoint exists for these records. Re-activation must
revalidate uniqueness and parent status.

### Monetary and unit contracts

- Database money: `NUMERIC(19,4)` with ISO 4217 currency.
- API money: canonical decimal string, never JavaScript floating point as the
  authoritative representation.
- Initial UOM allowlist: `EACH`, `GRAM`, `KILOGRAM`, `MILLILITRE`, `LITRE`, and
  `BAG`. Product approval may amend this list before schema implementation.
- Week 1 does not perform quantity conversion.

### Pagination contract

All Week 1 collection endpoints use bounded cursor pagination:

```ts
interface CursorPage<T> {
  data: T[];
  page: {
    limit: number;
    nextCursor: string | null;
  };
}
```

- Default limit: 25.
- Maximum limit: 100.
- Cursors are opaque and include a deterministic `(created_at, id)` boundary.
- Filters are allowlisted per endpoint; arbitrary column names or SQL fragments
  are never accepted.

## API and Service Boundaries

All paths below are relative to `/api/v1` unless shown otherwise.

| Method and path                     | Controller function / purpose                                            | Required access                                                           |
| ----------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `ALL /api/auth/*`                   | Better Auth-supported identity/session operations                        | Per auth flow; no active tenant required                                  |
| `GET /me`                           | Resolve authenticated user, memberships, active scope, role, permissions | Authenticated session                                                     |
| `POST /tenants`                     | Atomic tenant/owner/initial-branch/default-departments bootstrap         | Authenticated + onboarding eligibility + idempotency key                  |
| `GET /tenants/current`              | Safe active tenant metadata                                              | `tenant:read`                                                             |
| `PATCH /tenants/current`            | Mutable tenant settings only                                             | `tenant:update`                                                           |
| `GET /branches`                     | Paginated authorized branches                                            | `branches:read` + scope                                                   |
| `POST /branches`                    | Create branch                                                            | `branches:manage`                                                         |
| `PATCH /branches/:branchId`         | Update/deactivate branch                                                 | `branches:manage` + manageable branch                                     |
| `GET /departments`                  | Paginated authorized departments                                         | `departments:read` + scope                                                |
| `POST /departments`                 | Create department                                                        | `departments:manage` + branch scope                                       |
| `PATCH /departments/:departmentId`  | Update/deactivate department                                             | `departments:manage` + branch scope                                       |
| `GET /staff`                        | Paginated scoped memberships                                             | `staff:read` + scope                                                      |
| `POST /staff`                       | Invite/create tenant membership                                          | `staff:manage`; Manager cannot create Owner                               |
| `PATCH /staff/:membershipId/status` | Validated status transition                                              | `staff:manage`; final-owner and scope rules                               |
| `PUT /staff/:membershipId/access`   | Atomic role/branch/department replacement                                | `staff:manage`; role ceiling and scope rules                              |
| `GET /permissions`                  | Approved permission catalogue                                            | `roles:read`                                                              |
| `GET /roles`                        | Effective fixed role mappings                                            | `roles:read`                                                              |
| `PUT /roles/:roleKey/permissions`   | Replace configurable mapping within role ceiling                         | `roles:manage`; Owner only                                                |
| `GET /items`                        | Paginated, role-shaped catalogue                                         | `items:read`                                                              |
| `POST /items`                       | Create item                                                              | `items:manage`                                                            |
| `PATCH /items/:itemId`              | Update/deactivate item                                                   | `items:manage`                                                            |
| `GET /suppliers`                    | Paginated suppliers                                                      | `suppliers:read`                                                          |
| `POST /suppliers`                   | Create supplier                                                          | `suppliers:manage`                                                        |
| `PATCH /suppliers/:supplierId`      | Update/deactivate supplier                                               | `suppliers:manage`                                                        |
| `GET /customers`                    | Paginated, role-shaped customers                                         | `customers:read`                                                          |
| `POST /customers`                   | Create customer                                                          | `customers:manage`                                                        |
| `PATCH /customers/:customerId`      | Update/deactivate customer                                               | `customers:manage`                                                        |
| `GET /audit-events`                 | Paginated safe privileged-change evidence                                | `audit:read` + tenant scope                                               |
| `GET /health/live`                  | Process liveness                                                         | Public; no sensitive detail                                               |
| `GET /health/ready`                 | Bounded DB/schema readiness                                              | Public or platform-restricted by deployment policy; no credentials/detail |

### Selector headers

- `X-Tenant-Id`: required for protected tenant-bound routes when the server
  cannot unambiguously infer the active tenant.
- `X-Branch-Id`: required for branch-bound mutations and reads where branch is
  not already a path parameter.
- `X-Department-Id`: required only for department-bound operations.
- `X-Request-Id`: accepted only if it meets format/length rules; otherwise the
  server generates a UUID.
- `Idempotency-Key`: required for tenant onboarding and any endpoint explicitly
  marked idempotent.

Selector headers are documented and verified. They are never authorization
claims.

### Standard errors

```json
{
  "code": "SCOPE_FORBIDDEN",
  "message": "You do not have access to this resource.",
  "requestId": "0f78e5ef-b5a5-47a8-a343-a51ab48cc571",
  "details": {}
}
```

Initial stable codes include:

```text
VALIDATION_FAILED          AUTH_REQUIRED              SESSION_INVALID
ACTIVE_TENANT_REQUIRED     SCOPE_FORBIDDEN             RESOURCE_NOT_FOUND
CONFLICT                   IDEMPOTENCY_KEY_REUSED      INVALID_STATUS_TRANSITION
LAST_OWNER_REQUIRED        ROLE_ASSIGNMENT_FORBIDDEN   UNKNOWN_PERMISSION
DEPENDENCY_UNAVAILABLE     INTERNAL_ERROR
```

Database constraint names map to safe domain conflicts. Raw SQL, table names,
connection information, and cross-tenant existence never appear in public
errors.

## Swagger and Function Documentation Design

Swagger documentation is part of the implementation definition of done, not a
post-implementation task.

### OpenAPI setup

- Swagger UI: `/docs`.
- JSON artifact: `/docs/openapi.json`.
- Title/version: TallyBakery API, version aligned with `/api/v1`.
- Authentication scheme: named cookie/session scheme matching the selected
  Better Auth integration. Bearer auth remains only if an actually supported
  non-browser client flow is approved.
- Domain tags: `auth`, `me`, `tenants`, `branches`, `departments`, `staff`,
  `access-control`, `items`, `suppliers`, `customers`, `audit`, and `health`.

### Per-controller-function contract

Each public controller method must declare or generate:

- stable `operationId`, such as `StaffController_replaceAccess`;
- concise summary and description of transaction/state behavior;
- required permission key and scope selectors;
- auth scheme and public/protected status;
- path/query/header parameters with validation bounds;
- explicit request DTO and response DTO;
- success status and all expected 4xx/5xx response DTOs;
- enum, UUID, timestamp, decimal-string, nullable, and pagination semantics;
- examples for non-obvious requests and errors;
- deprecation metadata when a function is superseded.

Use explicit DTO classes or equivalent OpenAPI model registration with
`@ApiProperty`/`@ApiPropertyOptional`. Generic envelopes use
`@ApiExtraModels` and `$ref` composition rather than falling back to anonymous
objects. Drizzle table types are never passed to Swagger.

Where helpful, a custom `x-permission` and `x-scope` extension may encode the
same metadata consumed by Nest guards. The implementation must have one
authoritative metadata declaration so guard policy and documentation cannot
silently diverge.

### Better Auth documentation

Better Auth routes may be outside Nest controller discovery. The selected auth
integration must use Better Auth’s supported OpenAPI output, a compatible
adapter-generated document, or a clearly linked separate auth reference. The
team must not hand-invent schemas that could drift from the installed version.

### Internal function documentation

Public application service/use-case functions receive concise JSDoc when they
own one or more of:

- an atomic transaction boundary;
- an idempotency guarantee;
- a status transition;
- a permission or field-redaction rule;
- a non-obvious failure contract.

JSDoc describes invariants and side effects, not line-by-line implementation.
Swagger remains authoritative for HTTP behavior.

### OpenAPI validation

CI generates `/docs/openapi.json` from the application and asserts:

- every expected Week 1 operation exists with a stable `operationId`;
- protected operations declare authentication and permission metadata;
- request and successful response schemas contain no unresolved anonymous
  types;
- expected validation/auth/scope/conflict responses are declared;
- selector and idempotency headers are present where required;
- ORM/internal fields and secret-bearing properties are absent;
- the document passes an OpenAPI schema validator;
- a reviewed snapshot or semantic diff flags accidental breaking changes.

## Transactions and Concurrency

### Atomic transactions

- Tenant onboarding: idempotency claim + tenant + owner membership + initial
  branch + default departments + Owner scopes + all fixed-role permissions +
  audit event.
- Staff access replacement: membership role + branch scopes + department
  scopes + audit event.
- Membership status change: validated transition + audit event.
- Role permission replacement: validated ceiling + replacement + audit event.
- Privileged branch/department/master-data mutations: record change + audit
  event when required by policy.

### Idempotency

For onboarding, the server stores `(auth user, operation, idempotency key)`, a
canonical request fingerprint, state, and safe result reference. Reuse with the
same fingerprint returns the original result. Reuse with a different
fingerprint returns `IDEMPOTENCY_KEY_REUSED` and makes no change.

### Concurrency

- Lock or otherwise serialize final-owner checks during owner deactivation or
  role replacement.
- Use unique constraints as the final defense for tenant code, membership,
  SKU, and external-reference races.
- Map uniqueness races to HTTP 409 without leaking another tenant’s data.
- Mutable configuration may add a `version` field and `If-Match` once concurrent
  editing is exposed; Week 1 status/scope replacement tests must at minimum
  prove no partial relation updates.

## Health, Logging, and Configuration

### Liveness

`GET /health/live` returns a small status, service version, and server time. It
does not query PostgreSQL and does not disclose environment values.

### Readiness

`GET /health/ready` executes a short-timeout `SELECT 1` plus an essential
schema-compatibility probe (for example, required application tables or an
expected migration marker). Failure returns HTTP 503 with
`DEPENDENCY_UNAVAILABLE`, request ID, and a non-secret dependency label.

### Structured logging

Request completion logs include timestamp, request ID, method, route template,
status, latency, module, safe tenant ID, and safe actor ID when known. Logs
redact headers/cookies/tokens and avoid body logging on auth, customer, and
supplier routes. Unexpected exception detail is available only to protected
telemetry.

### Required configuration groups

- Runtime: `NODE_ENV`, `PORT`, request timeout and logging level.
- Database: pooled runtime URL, pool bounds, statement/readiness timeout.
- Migration: direct/unpooled privileged URL outside the runtime service.
- Auth: secret, base URL, trusted origins, cookie name/domain/same-site/secure
  policy, enabled verification/reset options, provider configuration.
- Documentation: production Swagger exposure policy; CI generation remains
  enabled regardless.

## Migration, Seed, and Delivery Flow

```text
Schema/contract change
  -> write failing schema/repository/API tests
  -> update Drizzle schemas and DTO contracts
  -> generate named migration
  -> review SQL + snapshot; drizzle-kit check
  -> apply auth migrations in documented order
  -> apply app migrations to empty ephemeral PostgreSQL/Neon test branch
  -> run deterministic seed
  -> run authorization and API suites
  -> generate/validate OpenAPI artifact
  -> build, lint, test, preview deployment
```

The seed script uses stable external keys and upsert-like domain logic, not
hard-coded production secrets. It refuses production by default.

## UI and Interaction Design

No UI implementation is part of this backend bundle. The API must nevertheless
support the Week 1 client by providing:

- `/me` as the session-aware bootstrap contract;
- predictable loading/empty/error outcomes;
- field-redacted responses so the client never receives forbidden data;
- cursor metadata for list screens;
- OpenAPI and `packages/shared` contracts suitable for typed client generation
  or manual integration;
- explicit `INVITED`, `SUSPENDED`, `INACTIVE`, and no-active-workspace states.

Client-side route hiding is only a usability feature. It never replaces server
authorization.

## Security Failure Semantics

| Situation                                      | Result                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| Missing/invalid session                        | 401 `AUTH_REQUIRED` or `SESSION_INVALID`                          |
| No active membership for selected tenant       | 404 `RESOURCE_NOT_FOUND` or explicit no-workspace result on `/me` |
| Permission absent in valid scope               | 403 `SCOPE_FORBIDDEN`                                             |
| Cross-tenant resource ID                       | 404 `RESOURCE_NOT_FOUND` with no existence clue                   |
| Unknown/forbidden role permission              | 400 `UNKNOWN_PERMISSION` or 403 `ROLE_ASSIGNMENT_FORBIDDEN`       |
| Duplicate tenant-scoped key                    | 409 `CONFLICT`                                                    |
| Different request under reused idempotency key | 409 `IDEMPOTENCY_KEY_REUSED`                                      |
| Last active Owner removal                      | 409 `LAST_OWNER_REQUIRED`                                         |
| PostgreSQL unavailable on readiness            | 503 `DEPENDENCY_UNAVAILABLE`                                      |
| Unexpected exception                           | 500 `INTERNAL_ERROR`, generic message + request ID                |

## Traceability

| Design area                               | Requirements        |
| ----------------------------------------- | ------------------- |
| Authentication spike and session handling | W1-02               |
| Tenant/branch/department/staff            | W1-03 through W1-05 |
| Permission and field boundaries           | W1-06, W1-07        |
| Master data                               | W1-08, W1-09        |
| Database/migrations                       | W1-10               |
| Audit                                     | W1-11               |
| Health/config/logging                     | W1-12               |
| Seed/CI/release gate                      | W1-13, W1-14        |
| Swagger and function documentation        | W1-01, W1-15        |
