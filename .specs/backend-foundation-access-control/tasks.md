# Tasks: Backend Foundation, Identity, Tenancy, and Access Control

## Module Overview

This checklist implements SDD Module 1 plus the backend/data portion of Week 1
using test-first delivery. It intentionally excludes the PRD’s procurement,
production, dispatch, and sales workflows until the secure foundation is
accepted.

- Requirements: [requirements.md](./requirements.md)
- Design: [design.md](./design.md)
- Test Spec: [test-spec.md](./test-spec.md)
- Product Requirements:
  [PRD](../../docs/Product%20Requirements%20Document_%20Shift-Based%20Invento....md)
- Architecture and Roadmap:
  [SDD](../../docs/tallybakery_software_design_document.md)
- Project Guidelines: [AGENTS.md](../../AGENTS.md)

> Under the test-first protocol, the named tests for a task are written in a
> failing state and confirmed with the user/product owner before production
> implementation begins. Every phase ends with a green verification gate.

## Task List

### 1. Baseline and Architecture Decisions

- [ ] 1.1 Re-run and record the current API build, lint, unit, e2e, Drizzle
      check, and OpenAPI baseline without changing behavior. Document which checks
      need a real PostgreSQL test database. (W1-14)
- [ ] 1.2 Inventory current routes, Swagger operations, environment variables,
      Drizzle tables/migrations, package exports, and test commands; verify the
      evidence table in `design.md` remains accurate. (W1-01, W1-10, W1-15)
- [ ] 1.3 Decide and record the Better Auth core version, Drizzle adapter,
      NestJS integration route, cookie/session policy, migration ownership/order,
      enabled verification/reset flows, and development delivery adapter. Do not
      add a speculative provider. (W1-02)
- [ ] 1.4 Build the minimal Better Auth compatibility spike and write
      `TEST-W1-AUTH-001`, `002`, `005`, `007`, and `008` before integrating domain
      modules. (W1-02)
- [ ] 1.5 Decide the Week 1 permission catalogue, immutable role ceilings,
      selector-header policy, UOM allowlist, decimal precision, cursor format, and
      production Swagger exposure policy. Record approved deviations in the spec.
      (W1-01, W1-06, W1-08, W1-15)
- [ ] 1.6 Confirm the planned test topology, error codes, role matrix, endpoint
      map, and Swagger documentation obligations with the user/product owner.

#### Phase 1 confirmation gate

- [ ] Better Auth compatibility is executable, not assumed.
- [ ] No unresolved decision changes the auth schema, role ceiling, endpoint
      contract, or tenant boundary.
- [ ] Baseline tests and the first failing implementation tests have been
      reviewed with the user.

### 2. Cross-Cutting Contracts and API Foundation

- [ ] 2.1 Write `TEST-W1-CONTRACT-001` through `008` for global validation,
      standard errors, decimal strings, pagination, and shared-package safety.
      (W1-01)
- [ ] 2.2 Define client-safe Week 1 enums and DTO contracts in
      `packages/shared`, keeping ORM, NestJS, auth internals, environment access,
      and Node-only APIs in `apps/api`. Build shared before validating consumers.
      (W1-01, W1-06, W1-07)
- [ ] 2.3 Enable a global `ValidationPipe` with transformation, whitelist, and
      unknown-field rejection; add route-param/query/header validation. (W1-01)
- [ ] 2.4 Implement the standard error DTO, domain error taxonomy, global safe
      exception filter, and database-constraint-to-conflict mapping. (W1-01,
      W1-12)
- [ ] 2.5 Implement request ID assignment/propagation and an immutable
      server-created request context carrier. (W1-12)
- [ ] 2.6 Implement cursor pagination utilities with default/max bounds and
      deterministic `(created_at, id)` ordering. (W1-01)
- [ ] 2.7 Extend typed configuration validation for auth, trusted origins,
      cookies, logging, timeouts, and database pool bounds. Write
      `TEST-W1-OPS-007` first. (W1-02, W1-12)
- [ ] 2.8 Run shared build, API build, lint, unit tests, and format check; do not
      proceed with unresolved contract drift.

#### Phase 2 confirmation gate

- [ ] Invalid input cannot reach a mutation service.
- [ ] Every error has a stable code and request ID without internal leakage.
- [ ] Shared contracts are browser-safe and compile in every consumer.

### 3. Authentication, Context, and Authorization

- [x] 3.1 Write the remaining auth tests `TEST-W1-AUTH-003`, `004`, `006`, and
      `009`, then integrate the selected Better Auth route/session verifier under
      `/api/auth/*`. (W1-02)
- [x] 3.2 Implement production-safe cookie, secret, trusted-origin, CSRF, and
      body-parser behavior proven by the auth integration suite. (W1-02)
- [x] 3.3 Write `TEST-W1-ACCESS-009`, `010`, and `014` through `016`; implement
      the versioned permission catalogue, role keys, immutable role ceilings, and
      field-visibility policies. (W1-06)
- [x] 3.4 Write `TEST-W1-ACCESS-011` through `013`; implement session guard,
      active-context resolution, selector verification, permission metadata, and
      permission/scope guards. (W1-06)
- [x] 3.5 Define `ActorContext` and controller parameter injection so services
      receive verified authority rather than raw identity fields from DTOs.
      (W1-06)
- [x] 3.6 Implement authorization-context refresh/invalidation and prove
      `TEST-W1-ACCESS-019`. (W1-06)
- [x] 3.7 Write `/me` tests `TEST-W1-ACCESS-017` and `018`; implement safe
      membership/scope/permission discovery and shared response contracts. (W1-07)
- [x] 3.8 Run auth, policy, context, `/me`, build, and lint gates.

#### Phase 3 confirmation gate

- [x] All protected routes deny by default.
- [x] Tenant/branch/department selectors are verified, never trusted.
- [x] Persona field-visibility tests pass before master-data endpoints are
      implemented.

### 4. Database Models, Migrations, and Repositories

- [ ] 4.1 Write `TEST-W1-DB-001` through `006` and the tenancy schema tests
      before changing Drizzle schemas. Use real PostgreSQL. (W1-10, W1-11)
- [ ] 4.2 Review and evolve the existing tenancy schema: constrain fixed role
      keys, preserve tenant-consistent composite foreign keys, and add only the
      indexes required by documented query paths. (W1-03 through W1-06, W1-10)
- [ ] 4.3 Add `catalog_items`, `suppliers`, `customers`, `audit_events`, and
      `idempotency_records` schema with numeric money, explicit status, uniqueness,
      and tenant-consistent relationships. (W1-08 through W1-11)
- [ ] 4.4 Generate a named Drizzle migration using JSON output, review SQL and
      snapshot, run `drizzle-kit check`, and confirm a second generation reports
      `no_changes`. Never use production `push`. (W1-10)
- [ ] 4.5 Document and test Better Auth migration order relative to application
      migrations. (W1-02, W1-10)
- [ ] 4.6 Implement one tenant-scoped repository per domain. Require verified
      scope input and include tenant predicates even after guard success. (W1-06)
- [ ] 4.7 Implement transaction-aware append-only audit and idempotency
      repositories without exposing them to controllers. (W1-03, W1-11)
- [ ] 4.8 Apply migrations to an empty ephemeral database and run schema,
      constraint, drift, and rollback tests. (W1-10, W1-14)

#### Phase 4 confirmation gate

- [ ] Empty-database migration and Drizzle history checks pass.
- [ ] Direct SQL cannot create cross-tenant parent/child relationships.
- [ ] Repository tests prove cross-tenant IDs return no records.
- [ ] No migration has been applied to production by this task.

### 5. Tenant, Branch, Department, Staff, and Role Services

- [ ] 5.1 Write `TEST-W1-TENANCY-001` through `004`; implement idempotent atomic
      tenant onboarding with Owner membership, initial branch, default departments,
      Owner scopes, all fixed-role permissions, and audit event. Add
      transaction/idempotency JSDoc. (W1-03)
- [ ] 5.2 Write `TEST-W1-TENANCY-005` through `010`; implement branch and
      department services/controllers with scope checks, status transitions, and
      no hard-delete routes. (W1-04)
- [ ] 5.3 Write `TEST-W1-ACCESS-001` through `008`; implement staff invitation,
      membership transitions, atomic access replacement, Manager ceilings, and
      final-Owner concurrency protection. (W1-05)
- [ ] 5.4 Implement permission catalogue/read endpoints and Owner-only role
      permission replacement within immutable ceilings. (W1-06)
- [ ] 5.5 Add atomic audit writes for every privileged mutation and run
      `TEST-W1-DB-004` and `005`. (W1-11)
- [ ] 5.6 Add unit, repository integration, and HTTP tests for every service and
      endpoint before marking it complete.

#### Phase 5 confirmation gate

- [ ] Owner onboarding is retry-safe and all-or-nothing.
- [ ] Managers cannot escalate themselves or other staff.
- [ ] The final active Owner cannot be removed.
- [ ] Privileged changes cannot commit without audit evidence.

### 6. Master-Data Services and Field-Level Responses

- [ ] 6.1 Write `TEST-W1-MASTER-001` through `005`; implement item DTOs,
      repository, service, controller, status changes, filters, and role-specific
      response projections. (W1-08)
- [ ] 6.2 Write `TEST-W1-MASTER-006`; implement supplier DTOs, repository,
      service, controller, scoped permissions, and safe contact handling. (W1-09)
- [ ] 6.3 Write `TEST-W1-MASTER-007` through `010`; implement customer DTOs,
      repository, service, controller, credit precision, contact redaction, and no
      writable receivable balance. (W1-09)
- [ ] 6.4 Write `TEST-W1-MASTER-011` and `012`; verify stable pagination,
      allowlisted indexed filters, and input bounds across all master-data lists.
      (W1-08, W1-09)
- [ ] 6.5 Add transaction/policy JSDoc to public use-case functions where their
      field-redaction or state-transition behavior is not obvious. (W1-15)
- [ ] 6.6 Run exact persona projections against the same fixture records and
      inspect serialized responses for forbidden fields.

#### Phase 6 confirmation gate

- [ ] Production, Reception, and Dispatch boundaries match the PRD.
- [ ] Money remains exact decimal strings at the HTTP boundary.
- [ ] Master records deactivate without deletion and remain tenant-isolated.

### 7. Swagger/OpenAPI Documentation for Functions and Endpoints

- [ ] 7.1 Write `TEST-W1-DOCS-001` through `011` before adding endpoint
      decorators/models. Confirm the expected operation inventory and documentation
      examples with the user. (W1-15)
- [ ] 7.2 Replace the generic Swagger auth setup with the exact approved
      cookie/session scheme; retain bearer auth only if an implemented client flow
      uses it. (W1-02, W1-15)
- [ ] 7.3 Add domain tags and stable `operationId` values to every controller
      function. (W1-15)
- [ ] 7.4 Document every function’s summary, behavior, required permission,
      scope selectors, headers, parameters, request DTO, response DTO, status codes,
      and stable error codes. (W1-01, W1-15)
- [ ] 7.5 Define Swagger DTO models for UUIDs, enums, ISO timestamps, decimal
      strings, nullable fields, cursor pages, standard errors, and all caller-safe
      response projections. Do not register Drizzle models. (W1-15)
- [ ] 7.6 Add representative onboarding, access replacement, `/me`, master-data,
      validation, forbidden, not-found, idempotency, and conflict examples.
      (W1-15)
- [ ] 7.7 Add selector, request-ID, and idempotency header documentation exactly
      where required. (W1-15)
- [ ] 7.8 Integrate or link Better Auth’s supported version-accurate API
      documentation. Do not invent auth schemas. (W1-02, W1-15)
- [ ] 7.9 Document liveness and readiness separately, including the readiness
      503 dependency response. (W1-12, W1-15)
- [ ] 7.10 Generate and validate `/docs/openapi.json` in CI; add semantic
      contract drift detection and secret/internal-field assertions. (W1-14,
      W1-15)

#### Phase 7 confirmation gate

- [ ] Every exposed API function appears exactly once with a stable operation
      ID and correct tag.
- [ ] Every protected operation declares auth, permission, and scope behavior.
- [ ] Request/response/error schemas and examples match runtime tests.
- [ ] OpenAPI contains no ORM internals, secrets, or forbidden fields.

### 8. Health, Logging, Seed, and CI

- [ ] 8.1 Write `TEST-W1-OPS-001` through `003`; implement independent liveness
      and bounded database/schema readiness endpoints. (W1-12)
- [ ] 8.2 Write `TEST-W1-OPS-004` through `006`; implement structured request
      logging, redaction, latency/status logging, and safe unexpected-error
      telemetry. (W1-12)
- [ ] 8.3 If NestJS Observe is selected for this environment, use the documented
      linking flow and keep credentials out of source control; otherwise retain the
      structured logging boundary and mark Observe as not configured. (W1-12)
- [ ] 8.4 Write `TEST-W1-DB-007` through `009`; implement the idempotent
      non-production demo seed and production refusal. (W1-13)
- [ ] 8.5 Add CI jobs for shared build, API build, lint, unit, integration, e2e,
      migration-from-empty, Drizzle history, seed idempotency, and OpenAPI
      validation. (W1-14)
- [ ] 8.6 Update `.env.example`, API README, secret policy, migration order,
      local setup, test database setup, seed usage, health probes, and Swagger URLs.
      (W1-10 through W1-15)

#### Phase 8 confirmation gate

- [ ] Database outage fails readiness but not liveness.
- [ ] Captured logs contain no protected credentials or sensitive payloads.
- [ ] Seed is repeatable and refuses production.
- [ ] CI reproduces the Week 1 backend gate from a clean checkout/database.

### 9. End-to-End Verification and Handoff

- [ ] 9.1 Run `TEST-W1-E2E-001` through `005` against a clean migrated and
      seeded test database. (W1-14)
- [ ] 9.2 Run the complete direct-ID attack matrix across path, query, body, and
      selector headers for every resource type. (W1-06, W1-14)
- [ ] 9.3 Authenticate Owner, Manager, Reception, Production, and Dispatch
      personas and compare `/me`, endpoint access, and field projections with the
      approved permission matrix. (W1-07, W1-14)
- [ ] 9.4 Generate the final OpenAPI document, run semantic validation, and
      review Swagger UI function documentation against implemented behavior.
      (W1-15)
- [ ] 9.5 Run API and shared builds, lint, formatting check, unit, integration,
      e2e, migration, seed, health, and documentation checks. Record exact commands
      and results. (W1-14)
- [ ] 9.6 Document deferred integrations and decisions explicitly: production
      email delivery, RLS, custom role builder, branch catalogue overrides,
      attendance, frontend/PWA, and Week 2 workflows.
- [ ] 9.7 Present the Week 1 acceptance evidence and any open exceptions to the
      user/product owner before declaring the module complete.

## Acceptance Gate

The Week 1 backend is ready for Week 2 only when this loop is verified:

```text
Clean PostgreSQL/Neon test branch
  -> auth migrations + application migrations
  -> deterministic seed
  -> API boots with validated configuration
  -> liveness + readiness pass
  -> every persona authenticates
  -> /me returns correct scopes and permissions
  -> Owner/Manager perform only allowed administration
  -> departmental personas receive only allowed resources and fields
  -> cross-tenant/path/query/body/header tampering is denied
  -> privileged changes have atomic audit evidence
  -> Swagger documents every function and endpoint accurately
  -> build, lint, unit, integration, e2e, migration, and OpenAPI gates pass
```

No skipped cross-tenant, permission, field-leakage, migration, or Swagger
contract test may be waived without a documented owner, reason, and expiry.
