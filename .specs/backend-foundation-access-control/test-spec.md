# TDD Test Specification

## Module: Backend Foundation, Identity, Tenancy, and Access Control

### TallyBakery — SDD Module 1 and Week 1 Backend/Data Scope

---

## 1. Strategy

Implementation follows a strict test-first sequence:

1. write the smallest failing tests for the next requirement;
2. present the tests and expected policy behavior for user/product confirmation;
3. implement only enough production code to pass;
4. refactor without changing contract behavior;
5. run the affected unit, integration, e2e, migration, and OpenAPI checks;
6. proceed only when the gate is green.

### Test layers

- **Unit tests** validate environment parsing, permission ceilings, effective
  permission calculation, status-transition rules, field redaction, DTO
  mapping, idempotency fingerprinting, and safe error translation.
- **Repository integration tests** run against real PostgreSQL, not an
  in-memory substitute, to prove foreign keys, unique constraints,
  transactions, indexes, numeric serialization, and tenant predicates.
- **Module integration tests** use Nest testing modules with the auth boundary
  stubbed only when the test is not about Better Auth itself.
- **Auth integration tests** use the selected real Better Auth adapter and test
  database to prove cookie/session behavior.
- **HTTP e2e tests** exercise the complete Nest request lifecycle and all
  persona boundaries.
- **OpenAPI contract tests** generate `/docs/openapi.json`, validate it against
  the OpenAPI schema, assert function-level documentation, and detect breaking
  drift.
- **Migration tests** apply Better Auth and application migrations in the
  documented order to an empty ephemeral database, run Drizzle checks, and
  execute seed twice.

No test may use a client-supplied tenant, role, or actor ID as authorization
proof. Authorization suites create at least two tenants, two branches, and all
five product personas so direct-ID tampering is exercised.

## 2. Proposed Test Locations

```text
apps/api/
├── src/
│   ├── auth/
│   │   ├── auth.integration.spec.ts
│   │   └── auth-config.spec.ts
│   ├── access-control/
│   │   ├── permission-catalogue.spec.ts
│   │   ├── authorization-policy.spec.ts
│   │   └── field-visibility-policy.spec.ts
│   ├── tenant/tenant.service.spec.ts
│   ├── branch/branch.service.spec.ts
│   ├── department/department.service.spec.ts
│   ├── staff/
│   │   ├── membership-policy.spec.ts
│   │   └── staff.service.spec.ts
│   ├── catalogue/catalogue.service.spec.ts
│   ├── supplier/supplier.service.spec.ts
│   ├── customer/customer.service.spec.ts
│   ├── idempotency/idempotency.service.spec.ts
│   ├── health/health.service.spec.ts
│   ├── config/environment.spec.ts
│   └── common/errors/error-mapping.spec.ts
├── test/
│   ├── helpers/
│   │   ├── database-test-context.ts
│   │   ├── auth-test-client.ts
│   │   └── persona-fixtures.ts
│   ├── integration/
│   │   ├── tenancy-schema.integration-spec.ts
│   │   ├── access-repositories.integration-spec.ts
│   │   ├── master-data-schema.integration-spec.ts
│   │   ├── audit-transactions.integration-spec.ts
│   │   ├── migrations.integration-spec.ts
│   │   └── seed.integration-spec.ts
│   ├── contract/openapi.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── onboarding.e2e-spec.ts
│   ├── authorization-matrix.e2e-spec.ts
│   ├── staff-access.e2e-spec.ts
│   ├── master-data.e2e-spec.ts
│   ├── health.e2e-spec.ts
│   └── app.e2e-spec.ts
packages/shared/
└── src/
    └── contracts/week-one-contracts.type-spec.ts
```

Exact file grouping may follow the final Nest module layout, but test IDs and
coverage obligations remain stable.

## 3. Test Environment and Fixtures

### PostgreSQL

- Use an isolated database or Neon test branch per test run.
- Use the direct/unpooled connection for migration setup and the pooled runtime
  connection for API tests.
- Reset by dropping the dedicated test database/schema or deleting the
  disposable branch, never by targeting a shared or production database.
- Run tests with the same PostgreSQL major version supported in deployment.

### Required fixture topology

```text
Tenant A
├── Branch A1
│   ├── Reception A1
│   ├── Production A1
│   ├── Dispatch A1
│   └── Store A1
├── Branch A2
└── Owner A, Manager A1, Reception A1, Production A1, Dispatch A1

Tenant B
├── Branch B1 and four departments
└── Owner B plus at least one scoped staff member
```

Include raw materials, finished goods with prices, suppliers, and customers in
both tenants. IDs must be deliberately used in cross-tenant tampering tests.

## 4. Test Suites and Scenarios

### 4.1 Contracts, Validation, and Error Semantics

- **TEST-W1-CONTRACT-001 — Global whitelist validation**: Submit a valid DTO
  with an unknown property; expect HTTP 400 `VALIDATION_FAILED`, no service
  invocation, and a request ID.
- **TEST-W1-CONTRACT-002 — Parameter and query coercion**: Submit supported
  string representations for bounded numeric query fields; expect declared
  transformation, while malformed values fail with HTTP 400.
- **TEST-W1-CONTRACT-003 — Invalid UUID and enum**: Use malformed resource IDs
  and unknown enum values; expect safe validation details without SQL or stack
  data.
- **TEST-W1-CONTRACT-004 — Cursor bounds**: Omit limit, request 100, request
  101, and submit a malformed cursor; expect default 25, accepted maximum 100,
  and safe validation failures.
- **TEST-W1-CONTRACT-005 — Standard error mapping**: Force validation,
  authorization, conflict, dependency, and unexpected errors; expect the
  documented `{ code, message, requestId, details }` shape and HTTP status.
- **TEST-W1-CONTRACT-006 — Decimal string contract**: Create/read item price and
  customer credit ceiling values with four decimal places; expect exact strings
  with no floating-point conversion.
- **TEST-W1-CONTRACT-007 — Safe DTO mapping**: Map repository records containing
  internal fields; expect only declared caller-specific DTO properties.
- **TEST-W1-CONTRACT-008 — Shared contract boundary**: Compile shared contracts
  in client-safe mode; assert no Drizzle, NestJS, environment, `pg`, or auth
  server imports enter `packages/shared`.

### 4.2 Authentication and Sessions

- **TEST-W1-AUTH-001 — Proven adapter compatibility**: Boot the selected Better
  Auth + NestJS + Drizzle stack under ESM, create a user, and read a session;
  expect no adapter or request-body incompatibility.
- **TEST-W1-AUTH-002 — Cookie-backed session**: Sign in with valid credentials;
  expect a secure HTTP-only cookie and successful protected request without a
  long-lived response token intended for local storage.
- **TEST-W1-AUTH-003 — Invalid credentials**: Attempt sign-in with invalid
  credentials; expect a non-enumerating auth error and no credential logging.
- **TEST-W1-AUTH-004 — Expired/revoked session**: Expire or revoke the session,
  then call `/api/v1/me`; expect HTTP 401 before application repository access.
- **TEST-W1-AUTH-005 — Sign-out invalidation**: Sign out and reuse the prior
  cookie; expect protected access denied.
- **TEST-W1-AUTH-006 — Trusted-origin and CSRF policy**: Send state-changing
  auth requests from allowed and disallowed origins; expect the configured
  protection behavior.
- **TEST-W1-AUTH-007 — Auth/domain body coexistence**: Exercise an auth route
  requiring its native body handling and a domain route requiring Nest DTO
  validation in one app; both must pass their own contract.
- **TEST-W1-AUTH-008 — Production auth configuration**: Boot production config
  with missing secret, insecure cookie policy, or untrusted origin; expect
  startup failure without secret values in the error.
- **TEST-W1-AUTH-009 — Inactive membership**: Keep a valid auth session but
  suspend its selected tenant membership; expect protected tenant access denied
  immediately.

### 4.3 Tenant Onboarding, Branches, and Departments

- **TEST-W1-TENANCY-001 — Atomic owner onboarding**: Create a tenant; expect one
  tenant, active Owner membership, initial branch, four default departments,
  Owner permissions, idempotency result, and audit event in one commit.
- **TEST-W1-TENANCY-002 — Onboarding rollback**: Inject a failure while creating
  a default department or audit event; expect none of the onboarding rows to
  remain.
- **TEST-W1-TENANCY-003 — Identical onboarding retry**: Repeat the same request
  with the same idempotency key and fingerprint; expect the original result and
  no duplicate hierarchy.
- **TEST-W1-TENANCY-004 — Conflicting key reuse**: Reuse the onboarding key with
  a changed request; expect HTTP 409 `IDEMPOTENCY_KEY_REUSED` and no mutation.
- **TEST-W1-TENANCY-005 — Branch uniqueness**: Race two branch creates using the
  same code in one tenant; expect one success and one safe HTTP 409.
- **TEST-W1-TENANCY-006 — Same branch code across tenants**: Create the same
  code in Tenant A and B; expect both to succeed without data collision.
- **TEST-W1-TENANCY-007 — Cross-tenant department parent**: Attempt to create a
  Tenant A department using Branch B1; expect non-enumerating denial and no row.
- **TEST-W1-TENANCY-008 — Inactive parent assignment**: Deactivate a branch,
  then attempt department creation or staff assignment under it; expect an
  invalid-state conflict.
- **TEST-W1-TENANCY-009 — Manager scope administration**: Manager A1 may update
  Branch A1 but not Branch A2 or B1; expect success, scope denial, and
  non-enumerating denial respectively.
- **TEST-W1-TENANCY-010 — No public hard delete**: Verify Swagger and routing
  expose no DELETE operation for tenant, branch, or department records.

### 4.4 Staff Lifecycle and Authorization Matrix

- **TEST-W1-ACCESS-001 — Unique tenant membership**: Invite the same auth user
  twice into one tenant; expect one membership and a safe conflict. Invite the
  user to another tenant; expect a distinct membership.
- **TEST-W1-ACCESS-002 — Valid membership transitions**: Exercise every allowed
  `INVITED`, `ACTIVE`, `SUSPENDED`, and `INACTIVE` transition; expect only the
  defined state graph to succeed.
- **TEST-W1-ACCESS-003 — Invalid membership transition**: Attempt an undefined
  transition; expect HTTP 409 `INVALID_STATUS_TRANSITION` and no audit event for
  a nonexistent change.
- **TEST-W1-ACCESS-004 — Atomic scope replacement**: Replace role, branch, and
  department scopes; expect all relations plus one audit event committed
  together.
- **TEST-W1-ACCESS-005 — Scope replacement rollback**: Include one foreign or
  invalid department in a replacement; expect original access unchanged and no
  partial join rows.
- **TEST-W1-ACCESS-006 — Department requires assigned branch**: Assign
  Production A1 without Branch A1; expect validation failure.
- **TEST-W1-ACCESS-007 — Manager cannot escalate**: Manager A1 attempts to
  create an Owner, edit an Owner, grant `roles:manage`, or assign Branch A2;
  expect denial and no mutation.
- **TEST-W1-ACCESS-008 — Final Owner invariant**: Deactivate or demote the final
  active Owner concurrently from two requests; expect at least one Owner to
  remain and HTTP 409 `LAST_OWNER_REQUIRED` for the prohibited change.
- **TEST-W1-ACCESS-009 — Unknown permission rejected**: Insert or submit an
  unknown key; expect configuration/input failure and no effective grant.
- **TEST-W1-ACCESS-010 — Role ceiling enforced**: Attempt to grant price/customer
  permissions to Production or Dispatch roles; expect rejection even from
  an Owner.
- **TEST-W1-ACCESS-011 — Cross-tenant path tampering**: Persona A uses Tenant B
  membership, staff, branch, department, item, supplier, customer, and audit
  IDs in paths; every request returns 404 and reveals no Tenant B fields.
- **TEST-W1-ACCESS-012 — Cross-tenant body tampering**: Persona A submits Tenant
  B IDs in request bodies and filters; expect rejection or server replacement
  by verified context, never cross-tenant mutation.
- **TEST-W1-ACCESS-013 — Selector tampering**: Persona A changes tenant, branch,
  and department selector headers; expect context resolution to deny before
  domain service execution.
- **TEST-W1-ACCESS-014 — Production boundary**: Production persona can read
  permitted operational item fields but receives no customer, supplier,
  selling-price, sales, cash, or fulfillment data.
- **TEST-W1-ACCESS-015 — Reception boundary**: Reception persona receives
  finished-good prices and permitted customer fields but cannot access raw
  materials, suppliers, production data, or staff administration.
- **TEST-W1-ACCESS-016 — Dispatch boundary**: Dispatch persona receives
  permitted finished-good identity/UOM fields but no prices, customer contacts,
  payment values, raw materials, suppliers, or staff administration.
- **TEST-W1-ACCESS-017 — `/me` safe summary**: Each persona receives only its own
  memberships, scopes, role, and effective permissions, with no auth/session
  secrets.
- **TEST-W1-ACCESS-018 — No active workspace**: Authenticated user with only
  inactive memberships gets the documented `/me` result and cannot access
  tenant-bound routes.
- **TEST-W1-ACCESS-019 — Permission refresh**: Remove a permission or suspend a
  membership between requests; the next request uses refreshed authority and
  is denied.

### 4.5 Master Data

- **TEST-W1-MASTER-001 — Item constraints**: Create valid raw material,
  finished good, and other items; reject unknown types, UOM codes, negative
  prices, invalid currency, and duplicate tenant SKU.
- **TEST-W1-MASTER-002 — Tenant-isolated item SKU**: Reuse an SKU in a second
  tenant; expect success and isolated reads.
- **TEST-W1-MASTER-003 — Item role projection**: Query the same finished good as
  Owner, Reception, Production, and Dispatch; assert exact allowed fields
  for each role.
- **TEST-W1-MASTER-004 — Item type filtering**: Reception cannot force raw
  materials into its result using filter manipulation; Production and
  Dispatch receive their permitted types only.
- **TEST-W1-MASTER-005 — Item deactivation**: Deactivate an item; default lists
  exclude it, authorized explicit status filters can find it, and no delete
  occurs.
- **TEST-W1-MASTER-006 — Supplier access**: Owner/Manager can create/read scoped
  suppliers; Reception, Production, and Dispatch receive denial.
- **TEST-W1-MASTER-007 — Customer access and redaction**: Owner/Manager and
  Reception receive their permitted customer fields; Production and
  Dispatch receive no customer/contact records.
- **TEST-W1-MASTER-008 — Customer credit precision**: Persist boundary and
  fractional credit ceilings; expect exact numeric storage and canonical
  decimal-string responses.
- **TEST-W1-MASTER-009 — No writable receivable balance**: Submit an
  `outstandingBalance` field; expect whitelist validation failure and no stored
  manual balance.
- **TEST-W1-MASTER-010 — Nullable reference uniqueness**: Multiple null external
  references are allowed; duplicate non-null references within one tenant
  conflict; the same reference in another tenant succeeds.
- **TEST-W1-MASTER-011 — Stable cursor pagination**: Page through records sharing
  timestamps; expect deterministic, non-duplicated `(created_at, id)` ordering.
- **TEST-W1-MASTER-012 — Search bounds**: Exercise normalized-name and exact
  reference/SKU filters; reject overlong or unsupported arbitrary filters.

### 4.6 Database, Migrations, Audit, and Seed

- **TEST-W1-DB-001 — Empty database migration**: Apply auth and application
  migrations in documented order to an empty database; expect all required
  tables, constraints, enums, and indexes.
- **TEST-W1-DB-002 — Drizzle history integrity**: Run `drizzle-kit check` and
  generation against the current schema; expect `ok` and `no_changes`.
- **TEST-W1-DB-003 — Tenant-consistent foreign keys**: Attempt direct SQL rows
  joining Tenant A children to Tenant B parents; expect database rejection.
- **TEST-W1-DB-004 — Transaction rollback**: Fail audit insertion inside a
  privileged mutation transaction; expect the business mutation rolled back.
- **TEST-W1-DB-005 — Append-only audit service**: Verify application repositories
  expose insert/read but no update/delete path for audit events; correction
  creates a linked follow-up event.
- **TEST-W1-DB-006 — Runtime/migration credential separation**: Validate runtime
  configuration does not require or expose the migration URL and migration
  tooling prefers the direct URL.
- **TEST-W1-DB-007 — Seed first run**: Seed an empty non-production database;
  expect the complete documented demo topology.
- **TEST-W1-DB-008 — Seed idempotency**: Run seed twice; expect stable record
  counts and IDs/external keys.
- **TEST-W1-DB-009 — Seed production refusal**: Run under production without an
  approved override; expect failure before any write.

### 4.7 Health, Logging, and Operational Safety

- **TEST-W1-OPS-001 — Liveness independent of DB**: Make PostgreSQL unavailable;
  `/health/live` remains 200 with no sensitive environment detail.
- **TEST-W1-OPS-002 — Readiness healthy**: With reachable current schema,
  `/health/ready` returns 200 within the configured timeout.
- **TEST-W1-OPS-003 — Readiness dependency failure**: With unreachable DB or
  missing essential schema, readiness returns 503
  `DEPENDENCY_UNAVAILABLE` and liveness remains healthy.
- **TEST-W1-OPS-004 — Request ID propagation**: Supply a valid request ID and
  omit one on another request; expect propagation in the first and generated
  UUID in the second, including errors and logs.
- **TEST-W1-OPS-005 — Log redaction**: Exercise auth, customer, supplier, and
  unexpected-error paths; assert no cookie, authorization, password, token,
  bank, or complete contact payload appears in captured logs.
- **TEST-W1-OPS-006 — Unexpected error safety**: Throw an internal exception;
  expect generic HTTP 500 `INTERNAL_ERROR`, request ID, and no stack/SQL in the
  response.
- **TEST-W1-OPS-007 — Invalid startup configuration**: Test every required
  configuration group and numeric bound; expect deterministic safe startup
  failure.

### 4.8 Swagger/OpenAPI Function Documentation

- **TEST-W1-DOCS-001 — OpenAPI endpoints available**: `/docs` serves Swagger UI
  and `/docs/openapi.json` returns a valid OpenAPI document in the configured
  environment.
- **TEST-W1-DOCS-002 — Expected function inventory**: Assert every endpoint in
  the design endpoint map exists with the expected method, path, domain tag,
  and stable `operationId`.
- **TEST-W1-DOCS-003 — Protected operation metadata**: Every protected
  controller function declares the approved auth scheme, required permission,
  and scope/selector requirements.
- **TEST-W1-DOCS-004 — Request/response models**: Every mutation has an explicit
  request schema and every operation has explicit success and standard-error
  response schemas with no accidental anonymous object or ORM model.
- **TEST-W1-DOCS-005 — Parameters and special types**: Cursor limits, filters,
  selector headers, idempotency keys, UUIDs, enums, ISO timestamps, nullable
  fields, and decimal strings are accurately represented.
- **TEST-W1-DOCS-006 — Examples**: Onboarding, access replacement, `/me`, item,
  supplier, customer, validation, forbidden, and conflict contracts include
  representative examples.
- **TEST-W1-DOCS-007 — Field secrecy in schema**: OpenAPI components contain no
  password hash, token, cookie, database connection, internal audit payload,
  or forbidden ORM-only property.
- **TEST-W1-DOCS-008 — Auth documentation accuracy**: Better Auth routes are
  sourced from supported generated documentation or linked separately; tests
  ensure no hand-authored stale auth schema is presented as authoritative.
- **TEST-W1-DOCS-009 — Health documentation**: Liveness and readiness document
  distinct success/failure behavior and readiness’s 503 dependency response.
- **TEST-W1-DOCS-010 — Semantic drift gate**: Compare the generated document to
  the reviewed contract; fail on removed operations, narrowed/changed required
  inputs, removed responses, or missing security metadata unless explicitly
  approved.
- **TEST-W1-DOCS-011 — Service function JSDoc gate**: Static review verifies
  public use-case functions owning transactions, idempotency, transitions, or
  redaction rules include concise invariant/side-effect JSDoc.

### 4.9 End-to-End Week 1 Acceptance

- **TEST-W1-E2E-001 — Owner journey**: Authenticate, onboard Tenant A, read
  `/me`, create Branch A2, administer departments/staff/roles, create all master
  data, and read audit evidence; expect only Tenant A results.
- **TEST-W1-E2E-002 — Manager journey**: Authenticate Manager A1, read `/me`,
  manage allowed staff/master data in A1, and fail every A2/B1 escalation.
- **TEST-W1-E2E-003 — Department persona journeys**: Authenticate Reception,
  Production, and Dispatch users and verify their exact allowed endpoints,
  item projections, and forbidden resources.
- **TEST-W1-E2E-004 — Migration-seed-health loop**: Start from empty PostgreSQL,
  migrate, seed, boot API, verify readiness, authenticate every persona, and
  validate OpenAPI.
- **TEST-W1-E2E-005 — Direct-ID attack matrix**: For every resource type, replace
  valid IDs with another tenant’s IDs across path, query, body, and headers;
  expect zero cross-tenant data or mutations.

## 5. Coverage and Release Policy

- Every acceptance criterion must map to at least one named test before its
  implementation task begins.
- Permission matrix and cross-tenant suites are release-blocking regardless of
  aggregate coverage percentage.
- No skipped security, migration, or OpenAPI contract test is allowed without a
  documented owner, reason, and expiry.
- Unit coverage targets do not replace behavior coverage. Critical policy,
  status transition, redaction, and transaction branches require direct tests.
- A live external email provider is not required for Week 1 if not selected,
  but its absence must be explicit and development delivery must not be called
  production-ready.
- Product outcome KPIs such as shrinkage reduction are not software test cases
  for this module.
