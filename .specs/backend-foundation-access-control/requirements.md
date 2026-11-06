# Requirements Document

## Module: Backend Foundation, Identity, Tenancy, and Access Control

### TallyBakery — SDD Module 1 and Week 1 Backend/Data Scope

---

## Introduction

This specification defines the secure backend foundation required by Module 1
and the backend/data portion of Week 1 in the TallyBakery software design
document. It establishes authenticated identity, tenant isolation, branch and
department scopes, staff access administration, master data, stable API
conventions, database migrations, health checks, and operational diagnostics.

There is a naming conflict between the source documents. In this specification,
**Module 1** means the SDD module named **Identity, tenant, branch, and access
control**. The PRD section named **Module 1: Departmental Operational
Workflows**—procurement, production, disbursement, and sales—is not part of this
Week 1 backend scope and begins in the Week 2 operating-ledger work.

The intended outcome is a deployable API skeleton in which every persona can
authenticate, discover only their authorized scopes, and use the permitted
Week 1 master-data endpoints without crossing tenant, branch, department, role,
or field-level boundaries.

## Source of Truth and Requirement Priority

1. The PRD defines personas, explicit information restrictions, core product
   outcomes, and audit/security expectations.
2. The SDD defines the proposed Module 1 architecture and Week 1 delivery
   scope.
3. Repository `AGENTS.md` files define implementation invariants and package
   boundaries.
4. This specification resolves Week 1 implementation details without claiming
   that proposed SDD components already exist.

If an implementation choice in this specification conflicts with a later
approved product decision, update this bundle before implementation proceeds.

## Existing Capabilities and Boundaries

### Implemented baseline

- `apps/api` is a NestJS 12 ESM application with a global `/api/v1` prefix.
- Swagger UI is exposed at `/docs`, with OpenAPI JSON at
  `/docs/openapi.json`.
- Environment parsing currently validates `NODE_ENV`, `PORT`, `DATABASE_URL`,
  and `DATABASE_POOL_MAX`.
- A Nest-injected Drizzle/node-postgres connection and Drizzle Kit migration
  workflow exist.
- The initial schema already defines tenants, branches, departments, tenant
  memberships, membership branch/department scopes, role permissions, status
  enums, tenant-consistent composite foreign keys, and supporting indexes.
- The API currently exposes only a starter root response. No authentication,
  request identity, permission guards, domain repositories, master-data APIs,
  global DTO validation, standardized errors, health readiness checks,
  structured request logging, or seed workflow exists.
- `packages/shared` contains starter contracts only. It must not expose ORM
  records or server-only types.

### In scope

- Better Auth compatibility spike, selected adapter/version, and working
  cookie/session integration under `/api/auth/*`.
- Tenant onboarding, branches, default departments, memberships, fixed Week 1
  role keys, an approved permission-key catalogue, and staff scope assignment.
- `GET /api/v1/me` with safe membership, scope, and permission summaries.
- Item, supplier, and customer schema/repository/service/API foundations needed
  by Week 2 workflows.
- Global input validation, stable response/error conventions, OpenAPI coverage,
  request IDs, safe structured logs, liveness/readiness checks, configuration
  validation, migrations, seed data, and backend CI commands.
- Immediate automated proof of cross-tenant, cross-branch,
  cross-department, role, and field-level denial.

### Out of scope

- Week 1 frontend/PWA shell, client routing, UI components, IndexedDB, and
  offline sync.
- Procurement receipts, expenses, production batches, transfers, orders,
  payments, stock movements, shift handovers, incidents, notifications,
  analytics, and AI insights.
- Subscription payment collection. Only tier/status metadata is retained.
- Arbitrary custom roles, custom permissions, or custom department workflow
  builders. Week 1 uses an approved fixed catalogue.
- Attendance, schedules, and shift assignments.
- Mandatory PostgreSQL Row-Level Security. Application authorization and
  tenant-scoped repositories are mandatory; RLS requires a separate approved
  pooled-connection design and leak test before enablement.
- Production email/SMS provider selection. Verification, reset, and invitation
  delivery may use a development adapter until a provider is approved, but
  production must fail closed when a required provider is absent.

## Glossary

- **Authenticated User**: Identity and session established by Better Auth.
- **Actor**: The authenticated user performing an API operation.
- **Tenant**: A business account and the highest customer-data isolation
  boundary.
- **Tenant Membership**: The application-owned association between one auth
  user and one tenant, including role and status.
- **Active Tenant Context**: The tenant selected for a request after the server
  verifies an active membership; it is never accepted as proof merely because
  the client supplied an ID.
- **Branch Scope**: The set of tenant branches a membership is allowed to use.
- **Department Scope**: The set of tenant departments a membership is allowed
  to use.
- **Role Key**: A fixed Week 1 business-role identifier assigned to a tenant
  membership.
- **Permission Key**: An approved action identifier used by server-side guards,
  such as `staff:manage` or `items:read`.
- **Owner**: The Business Owner/Super Admin persona inside one tenant. Owner
  authority never crosses tenants.
- **Manager**: The Shift/Branch Manager persona, limited to explicitly assigned
  branches and departments unless tenant-wide scope is granted.
- **Master Data**: Week 1 item, supplier, and customer records used by later
  operational workflows.
- **Inactive Record**: A retained record excluded from normal active lists and
  new assignments; inactivation is not deletion.
- **Safe DTO**: A public response type selected for the caller’s permission and
  containing no ORM internals, secrets, password/session data, or forbidden
  fields.
- **Readiness**: Whether required dependencies, especially PostgreSQL, can
  support API traffic.
- **Liveness**: Whether the API process is running, independent of dependency
  health.

## Requirements

### Requirement 1: Versioned API Foundation and Contracts (W1-01)

**User Story:** As an API consumer, I want consistent versioned contracts and
validation so that I can integrate without depending on persistence details.

#### Acceptance Criteria

1. THE System SHALL expose domain APIs beneath `/api/v1` and authentication
   handlers beneath `/api/auth/*`.
2. THE System SHALL validate request bodies, route parameters, query
   parameters, and selector headers at the API boundary, transform declared
   scalar values, reject unknown fields, and reject invalid enum values.
3. THE System SHALL return explicit response DTOs and SHALL NOT serialize
   Drizzle rows, database-only columns, secrets, session tokens, password
   material, or unauthorized fields directly.
4. THE System SHALL return errors in the shape `{ code, message, requestId,
details }`, with safe details and a stable machine-readable code.
5. WHEN a request is malformed, THE System SHALL return HTTP 400 without
   invoking the domain mutation.
6. WHEN an unauthenticated caller accesses a protected endpoint, THE System
   SHALL return HTTP 401.
7. WHEN an authenticated caller lacks permission in an otherwise valid active
   scope, THE System SHALL return HTTP 403.
8. IF a scoped lookup references a record outside the actor’s tenant, branch,
   or department, THEN THE System SHALL return a non-enumerating HTTP 404 and
   SHALL NOT disclose that the record exists.
9. THE System SHALL publish accurate OpenAPI schemas, authentication metadata,
   response codes, pagination contracts, and error shapes for every Week 1
   endpoint.

### Requirement 2: Authentication and Session Integration (W1-02)

**User Story:** As a staff member, I want a secure session so that the API can
identify me without exposing long-lived credentials to browser storage.

#### Acceptance Criteria

1. THE System SHALL use Better Auth as the identity and session authority.
2. BEFORE feature implementation commits to an adapter, THE System team SHALL
   prove one compatible Better Auth, NestJS 12, Drizzle/PostgreSQL, and ESM
   version combination through an executable integration test and record the
   decision.
3. THE System SHALL expose enabled sign-up/sign-in, sign-out, session lookup,
   password-reset, and email-verification flows through `/api/auth/*` according
   to the approved authentication configuration.
4. THE System SHALL store browser sessions in secure HTTP-only cookies and
   SHALL NOT require long-lived tokens in `localStorage`.
5. WHILE running in production, THE System SHALL enforce HTTPS-compatible
   secure cookie settings, explicit trusted origins, a non-default auth secret,
   and the approved CSRF protection behavior.
6. WHEN a protected request carries an expired, revoked, malformed, or absent
   session, THE System SHALL fail with HTTP 401 before repository access.
7. WHEN a user signs out or an administrator deactivates their last active
   membership, THE System SHALL prevent subsequent protected access according
   to the approved session-revocation policy.
8. IF auth request-body handling conflicts with Nest’s normal JSON pipeline,
   THEN THE System SHALL preserve the auth handler’s required body semantics
   without disabling validation on domain routes.
9. THE System SHALL NOT log passwords, reset tokens, verification tokens,
   cookie values, session IDs, or complete auth payloads.

### Requirement 3: Tenant Onboarding and Owner Bootstrap (W1-03)

**User Story:** As a new Business Owner, I want to create a business workspace
so that I can administer branches and staff within an isolated tenant.

#### Acceptance Criteria

1. WHEN an eligible authenticated user creates a tenant, THE System SHALL
   atomically create the tenant, an active Owner membership, the initial
   branch, the four default departments, the Owner's initial scopes, all
   approved fixed-role permission assignments, and an audit event.
2. THE System SHALL create default department types for Reception, Production,
   Disbursement, and Store within the initial branch.
3. THE System SHALL require tenant name, initial branch name/code, valid IANA
   timezone, ISO 4217 currency code, and approved subscription metadata.
4. THE System SHALL use non-guessable UUIDs for public application-owned
   records.
5. WHEN onboarding is retried with the same idempotency key, THE System SHALL
   return the original successful result and SHALL NOT create a second tenant
   or partial duplicate hierarchy.
6. IF any onboarding write fails, THEN THE System SHALL roll back every
   application-owned onboarding record.
7. THE System SHALL prevent an ordinary authenticated user from creating
   unlimited tenants unless the approved onboarding policy permits it.
8. THE System SHALL NOT grant an Owner membership access to any other tenant.

### Requirement 4: Branch and Department Administration (W1-04)

**User Story:** As an Owner or authorized Manager, I want to administer branch
and department metadata so that staff can operate in correctly bounded scopes.

#### Acceptance Criteria

1. WHEN an authorized actor creates or updates a branch, THE System SHALL
   validate tenant ownership, branch-code uniqueness within the tenant, IANA
   timezone, status, and allowed mutable fields.
2. WHEN an authorized actor creates or updates a department, THE System SHALL
   verify that the department’s branch belongs to the active tenant.
3. THE System SHALL support only the approved Week 1 department types:
   `RECEPTION`, `PRODUCTION`, `DISBURSEMENT`, and `STORE`.
4. THE System SHALL prevent branch or department hard deletion through the
   public API and SHALL use status transitions for deactivation.
5. WHEN a branch is inactive, THE System SHALL reject new active assignments
   and operational selections for that branch while retaining history.
6. WHEN a department is inactive, THE System SHALL reject new active
   department assignments while retaining prior membership scope evidence.
7. IF a Manager attempts to administer a branch outside their authorized
   branch scope, THEN THE System SHALL deny the request without mutation.
8. WHEN branch or department settings change, THE System SHALL record the
   actor, tenant, request ID, safe before/after summary, and server timestamp in
   an append-only audit event.

### Requirement 5: Staff Membership Lifecycle and Scope Assignment (W1-05)

**User Story:** As an Owner or authorized Manager, I want to onboard and scope
staff so that each person can work only in assigned business areas.

#### Acceptance Criteria

1. WHEN an authorized actor invites or creates staff access, THE System SHALL
   associate the auth identity with a tenant membership and SHALL NOT duplicate
   the same auth user within that tenant.
2. THE System SHALL support membership states `INVITED`, `ACTIVE`, `SUSPENDED`,
   and `INACTIVE` with explicit permitted transitions.
3. THE System SHALL assign exactly one approved Week 1 role key to each tenant
   membership and zero or more verified branch and department scopes as allowed
   by that role.
4. WHEN department access is assigned, THE System SHALL verify that each
   department belongs to an assigned branch and the active tenant.
5. WHEN staff access is replaced, THE System SHALL update branch scopes,
   department scopes, and role assignment atomically and write one audit event.
6. WHEN a membership becomes suspended or inactive, THE System SHALL deny new
   protected operations immediately and preserve membership and audit history.
7. THE System SHALL prevent Managers from assigning Owner authority, widening
   access beyond their own manageable scope, or modifying Owner memberships.
8. THE System SHALL prevent an actor from removing or deactivating the final
   active Owner of a tenant.
9. IF an invitation-delivery provider is unavailable, THEN THE System SHALL
   retain an explicit non-active invitation state and report a safe retryable
   outcome without silently activating access.
10. THE System SHALL NOT expose whether an email belongs to a user in another
    tenant.

### Requirement 6: Permission Catalogue and Deny-by-Default Authorization (W1-06)

**User Story:** As a Business Owner, I want predictable role permissions so
that information boundaries are enforced consistently across endpoints and
fields.

#### Acceptance Criteria

1. THE System SHALL maintain a versioned allowlist of permission keys and SHALL
   reject unknown keys even if a client supplies them.
2. THE System SHALL support the fixed Week 1 role keys `OWNER`, `MANAGER`,
   `RECEPTIONIST`, `PRODUCTION_SUPERVISOR`, and
   `DISBURSEMENT_OFFICER`.
3. THE System SHALL deny protected operations unless the authenticated active
   membership has the required permission and all required resource scopes.
4. THE System SHALL derive actor identity from the verified session and tenant,
   branch, and department context from verified membership scopes; client IDs
   SHALL be treated only as selectors.
5. WHEN a request selects a tenant or branch, THE System SHALL verify the
   selection against active membership scopes before executing controller
   business logic.
6. THE System SHALL enforce authorization in both the guard/service boundary
   and tenant-scoped repository predicates.
7. THE System SHALL prevent Production users from receiving customer, sales,
   price, or cash data.
8. THE System SHALL prevent Reception users from receiving raw-material,
   production, or fulfillment-control data.
9. THE System SHALL prevent Disbursement users from receiving selling prices,
   payment amounts, cash totals, customer contact details, or procurement data.
10. THE System SHALL prevent Managers from altering finalized history and
    SHALL reserve tenant-wide role/permission administration for Owners.
11. WHEN permissions or role mappings change, THE System SHALL invalidate or
    refresh affected authorization context before the next protected request.
12. IF database RLS is later enabled, THEN THE System SHALL retain application
    checks and SHALL prove transaction-local tenant context cannot leak across
    pooled connections.

### Requirement 7: Current User and Active Scope Discovery (W1-07)

**User Story:** As an authenticated user, I want a safe summary of my access so
that clients can render only the workspaces I am permitted to enter.

#### Acceptance Criteria

1. WHEN an authenticated user calls `GET /api/v1/me`, THE System SHALL return a
   safe identity summary, active memberships, role keys, permitted branches,
   permitted departments, effective permission keys, and membership status.
2. THE System SHALL omit auth secrets, password data, session records, internal
   database metadata, and memberships not belonging to the authenticated user.
3. WHEN an active tenant selector is valid, THE System SHALL identify the
   active tenant and available branch/department choices in the response.
4. IF no active membership exists, THEN THE System SHALL return an explicit
   no-active-workspace result without granting protected domain access.
5. WHILE a membership is suspended or inactive, THE System SHALL exclude it
   from active workspace choices while retaining any safe status needed to
   explain denied access.
6. THE System SHALL treat `/me` as the canonical client bootstrap contract and
   version its client-safe types through `packages/shared`.

### Requirement 8: Item Catalogue Foundation (W1-08)

**User Story:** As authorized operational staff, I want a consistent item
catalogue so that later procurement, production, and sales records reference
stable products and units.

#### Acceptance Criteria

1. THE System SHALL model tenant-scoped catalogue items with item type, SKU,
   name, category, unit of measure, active status, and optional selling price
   plus currency where applicable.
2. THE System SHALL support item types `RAW_MATERIAL`, `FINISHED_GOOD`, and
   `OTHER`.
3. THE System SHALL require an approved explicit unit code and SHALL NOT infer
   or silently convert quantities.
4. THE System SHALL enforce SKU uniqueness within the tenant for Week 1; branch
   overrides and branch-specific price lists are deferred.
5. THE System SHALL store authoritative monetary values in PostgreSQL numeric
   form and serialize them as decimal strings.
6. WHEN a Production user lists items, THE System SHALL omit selling prices and
   customer-facing monetary fields.
7. WHEN a Disbursement user lists items, THE System SHALL return only permitted
   finished-goods fields and SHALL omit selling prices.
8. WHEN a Reception user lists items, THE System SHALL exclude raw-material
   records and MAY receive permitted finished-good selling prices.
9. THE System SHALL deactivate items rather than hard-delete them and SHALL
   retain stable IDs for historical references.
10. THE System SHALL paginate item lists and support bounded filters for active
    state, item type, SKU, and normalized name search.

### Requirement 9: Supplier and Customer Master Data (W1-09)

**User Story:** As authorized staff, I want scoped supplier and customer
records so that later procurement and sales workflows can reference validated
parties without exposing unnecessary personal or commercial data.

#### Acceptance Criteria

1. THE System SHALL model tenant-scoped suppliers with stable ID, name,
   optional external reference, minimal contact fields, status, and timestamps.
2. THE System SHALL model tenant-scoped customers with stable ID, display name,
   minimal contact fields, optional external reference, credit ceiling,
   currency, status, and timestamps.
3. THE System SHALL treat customer outstanding receivable as a future derived
   ledger value and SHALL NOT accept a manually maintained authoritative
   balance in Week 1.
4. THE System SHALL serialize credit ceilings as decimal strings and SHALL
   validate their currency and non-negative value.
5. THE System SHALL enforce tenant-scoped uniqueness for approved supplier and
   customer external references when present.
6. THE System SHALL allow only Owner/Manager procurement access to supplier
   records.
7. THE System SHALL allow Reception and authorized Owner/Manager access to
   customer records and SHALL deny Production and Disbursement access to
   customer contacts.
8. THE System SHALL deactivate suppliers and customers rather than hard-delete
   them.
9. THE System SHALL paginate supplier and customer lists and bound search
   inputs to indexed fields.
10. THE System SHALL minimize returned contact fields according to permission
    and SHALL NOT log customer or supplier contact payloads unnecessarily.

### Requirement 10: Persistence, Migrations, and Database Roles (W1-10)

**User Story:** As a backend operator, I want repeatable schema management so
that environments start from the same reviewed database state.

#### Acceptance Criteria

1. THE System SHALL manage application-owned PostgreSQL schema changes through
   version-controlled Drizzle schema and migration files.
2. THE System SHALL keep Better Auth-owned identity/session tables under the
   selected Better Auth adapter’s supported migration mechanism and SHALL
   document migration order.
3. THE System SHALL use a pooled runtime connection and a direct,
   migration-privileged connection in deployed Neon environments.
4. THE System SHALL keep runtime and migration credentials separate and SHALL
   never commit either secret.
5. THE System SHALL enforce tenant-consistent foreign keys for branch,
   department, membership, and master-data relationships where applicable.
6. THE System SHALL add indexes for tenant-scoped status and lookup filters and
   SHALL verify uniqueness constraints with real PostgreSQL integration tests.
7. WHEN migrations run against an empty supported test database, THE System
   SHALL reach the current schema without manual SQL steps.
8. WHEN the current schema is compared with migration history, THE System SHALL
   report no ungenerated drift.
9. IF a migration fails, THEN THE deployment pipeline SHALL stop before serving
   the incompatible application version.
10. THE System SHALL NOT apply schema changes directly to production through an
    unreviewed `push` workflow.

### Requirement 11: Auditability of Access and Configuration (W1-11)

**User Story:** As an Owner or auditor, I want privileged access changes to be
traceable so that staff authority cannot change without evidence.

#### Acceptance Criteria

1. THE System SHALL append an audit event for tenant onboarding, branch and
   department configuration changes, invitations, membership status changes,
   role changes, scope replacements, and permission-mapping changes.
2. THE System SHALL record tenant, actor auth user ID, actor membership ID,
   action, subject type/ID, request ID, server timestamp, and a safe change
   summary.
3. THE System SHALL NOT store passwords, tokens, raw cookies, or unnecessary
   contact details in audit payloads.
4. THE System SHALL treat audit events as append-only through application
   services; corrections SHALL create a linked follow-up event.
5. WHEN a privileged mutation and its audit event are required, THE System
   SHALL commit both in one database transaction.
6. IF the audit write fails, THEN THE System SHALL roll back the privileged
   mutation.
7. THE System SHALL restrict audit reads to authorized Owner/audit permissions
   and tenant scope.

### Requirement 12: Health, Configuration, Logging, and Error Safety (W1-12)

**User Story:** As an operator, I want observable and fail-safe service health
so that deployment and dependency failures are detected quickly.

#### Acceptance Criteria

1. THE System SHALL fail startup with a clear non-secret error when required
   configuration is absent or invalid.
2. THE System SHALL validate auth configuration, trusted origins, database
   connection settings, production cookie requirements, and permitted numeric
   pool/time-out settings.
3. `GET /health/live` SHALL report process liveness without requiring a
   successful database query.
4. `GET /health/ready` SHALL execute a bounded database readiness probe and
   return non-success while PostgreSQL is unavailable or migrations are known
   to be incompatible.
5. THE System SHALL assign or propagate a request ID and return it in error
   responses and response headers.
6. THE System SHALL emit structured logs containing timestamp, request ID,
   route, method, status, latency, module, and safe actor/tenant identifiers
   when available.
7. THE System SHALL redact authorization headers, cookies, passwords, tokens,
   bank details, and unnecessary contact fields.
8. IF an unexpected exception occurs, THEN THE System SHALL return a generic
   safe error with a request ID and SHALL preserve diagnostic detail only in
   protected server telemetry.
9. THE System SHALL expose Swagger documentation without exposing secrets or
   making protected endpoints callable without normal authentication checks.

### Requirement 13: Seed Data and Development Repeatability (W1-13)

**User Story:** As a developer or tester, I want deterministic demo data so
that role and scope behavior can be reproduced safely.

#### Acceptance Criteria

1. THE System SHALL provide an idempotent non-production seed command for one
   demo tenant, at least two branches, the four default department types,
   approved roles/permissions, one user per product persona, and representative
   items, suppliers, and customers.
2. THE System SHALL source demo credentials from explicit non-production
   configuration or generate them for local output and SHALL NOT embed
   production-capable secrets in source control.
3. WHEN the seed command is rerun, THE System SHALL update or reuse deterministic
   records without duplicating them.
4. WHILE `NODE_ENV` is `production`, THE System SHALL refuse to run the demo
   seed unless an explicit separately reviewed override exists.
5. THE System SHALL give demo personas scopes that make both allowed and denied
   authorization tests meaningful.

### Requirement 14: Backend Quality and Week 1 Exit Gate (W1-14)

**User Story:** As a product and engineering team, I want an objective Week 1
backend gate so that operational workflow work does not build on insecure or
unstable foundations.

#### Acceptance Criteria

1. THE System repository SHALL provide working API build, lint, unit,
   integration, end-to-end, migration-check, and migration-from-empty commands
   suitable for CI.
2. BEFORE production implementation of each requirement begins, THE team SHALL
   review and confirm its failing tests from `test-spec.md`.
3. WHEN CI runs, THE System SHALL reject changes that fail type/build, lint,
   tests, migration validation, or OpenAPI contract generation.
4. THE System SHALL prove through automated tests that an actor cannot read or
   mutate another tenant by changing path, query, body, or selector IDs.
5. THE System SHALL prove through automated tests that each departmental
   persona cannot read forbidden resources or fields.
6. THE System SHALL prove that migrations apply to an empty test database and
   health readiness succeeds afterward.
7. THE System SHALL prove that an Owner and each departmental persona can
   authenticate and receive the correct `/me` workspace summary.
8. IF any required external auth-delivery integration is unavailable, THEN the
   release gate SHALL label it explicitly as blocked or development-only and
   SHALL NOT represent it as production-ready.
9. THE Week 1 backend SHALL NOT be accepted while known cross-tenant,
   cross-department, permission, secret-leakage, or migration-integrity tests
   are failing or skipped without an approved exception.

### Requirement 15: Swagger Documentation for API Functions (W1-15)

**User Story:** As an API consumer or maintainer, I want every exposed
controller function documented in Swagger so that its contract, security, and
failure behavior can be understood and tested without reading implementation
code.

#### Acceptance Criteria

1. THE System SHALL publish Swagger UI at `/docs` and an OpenAPI JSON document
   at `/docs/openapi.json` for the active API version.
2. THE System SHALL assign every exposed controller function a stable,
   descriptive OpenAPI `operationId` and group it under a domain tag.
3. THE System SHALL document each endpoint function’s summary, behavior,
   authentication scheme, required permission, active-scope rules, parameters,
   request body, response body, HTTP status codes, and stable error codes.
4. THE System SHALL derive request and response schemas from explicit DTO
   classes or equivalent registered OpenAPI models and SHALL NOT document ORM
   entities as public contracts.
5. THE System SHALL document pagination, filtering, sorting, selector headers,
   idempotency headers, decimal-string fields, timestamps, enums, and nullable
   fields wherever they apply.
6. THE System SHALL include representative examples for onboarding, staff
   access replacement, `/me`, master-data creation, validation errors,
   authorization errors, and conflict errors.
7. WHEN an endpoint is protected, THE OpenAPI operation SHALL declare cookie
   authentication or the approved auth scheme and SHALL state its required
   permission in a consistent description or vendor extension.
8. WHEN Better Auth exposes routes that cannot be generated accurately by
   NestJS decorators, THE System SHALL merge or link Better Auth’s supported
   OpenAPI description rather than publish invented request or response
   schemas.
9. THE System SHALL document liveness and readiness response differences and
   SHALL identify readiness failure as a dependency condition.
10. WHEN controller functions or DTOs change, THE System SHALL fail contract
    tests if `/docs/openapi.json` is missing the operation, security metadata,
    schema, or declared responses.
11. THE System SHALL keep Swagger enabled in non-production environments; if
    production exposure is restricted, THE System SHALL still generate and
    validate the OpenAPI artifact in CI and document the access policy.
12. THE System SHALL add concise JSDoc to public service/use-case functions
    whose behavior or transaction boundary is not fully represented by the
    HTTP contract, while Swagger remains authoritative for API endpoints.

## Requirement Traceability Summary

| Source area                      | Covered requirements              |
| -------------------------------- | --------------------------------- |
| SDD Module 1 identity/access     | W1-02 through W1-07, W1-11        |
| SDD Week 1 backend/data          | W1-01 through W1-15               |
| PRD persona restrictions         | W1-05, W1-06, W1-08, W1-09, W1-14 |
| SDD database and API conventions | W1-01, W1-08 through W1-12, W1-15 |
| Week 1 exit criteria             | W1-10, W1-12, W1-14               |
