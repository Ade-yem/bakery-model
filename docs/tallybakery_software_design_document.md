---
title: "TallyBakery"
subtitle: "Software Design Document | Shift-Based Inventory & Sales Reconciliation Platform"
author: "Engineering Design"
date: "29 October 2026"
lang: en
---

\newpage

## Contents

1. Purpose and scope
2. Product roles and authorization
3. Architecture overview
4. Module breakdown and feature inventory
5. Domain model and database design
6. Key workflows and state machines
7. Offline data and synchronization design
8. API design
9. Security, auditability, and privacy
10. Analytics, alerting, and AI design
11. Non-functional requirements and acceptance targets
12. Four-week implementation plan
13. Definition of done
14. Scope risks and decisions to close early
15. Suggested repository and deployment conventions
16. Reference documentation

\newpage

## Document Control

| Field | Value |
|---|---|
| Document version | 1.0 |
| Source | Product Requirements Document, version 1.0.0 |
| Status | Engineering baseline for implementation planning |
| Target delivery window | Four weeks for a compressed, feature-complete first release |
| Technology | React + Vite, NestJS, Neon PostgreSQL, Better Auth |

\newpage

## 1. Purpose and scope

This document translates the TallyBakery PRD into an implementation design. It defines the application architecture, feature modules, principal data structures, authorization model, operating workflows, offline synchronization approach, API boundaries, testing strategy, and a four-week implementation sequence.

TallyBakery is a multi-tenant, offline-first operating ledger for shift-based businesses, anchored on commercial bakeries. It must connect the events that happen across Procurement/Store, Production, Reception, and Packaging & Disbursement so that inventory, orders, payments, and shift closure can be reconciled to named people and devices.

### 1.1 Design goals

1. **Accountability by event:** record what happened, who performed it, when it was recorded, which branch/department/shift it belongs to, and the resulting stock or financial movement.
2. **Tenant and department isolation:** a staff member sees only the organization's and department's data permitted by their role.
3. **Offline continuity:** operational actions are durably recorded on a device during network loss and synchronized without duplicate posting or silent loss.
4. **Deterministic reconciliation:** cash and finished-stock variances are computed from recorded movements, not manually maintained balances.
5. **Immutable auditability:** finalized operational and financial events are corrected by compensating entries, not by editing history.
6. **Exception-first alerts:** routine activity is quiet; anomalies create incidents and trigger configured notifications.
7. **Progressive enhancement:** the web app remains usable on desktop and mobile, with an installable PWA shell and local operational storage.

### 1.2 Four-week delivery interpretation

The PRD originally describes a 16-week phased roadmap. Delivering every category in four weeks is therefore an aggressive compression. The schedule in this SDD aims for **functional breadth across all modules**, using a small team and thin, testable implementations. It does not imply that every external integration, predictive model, scale test, and compliance activity can be production-hardened in that same period.

The plan assumes three delivery functions working in parallel: frontend/PWA, backend/data, and shared product/QA/DevOps. If one person is implementing the product alone, the same sequence can be used, but four weeks should be treated as a prototype/controlled-pilot target rather than a reliable deadline for fully production-ready delivery.

### 1.3 Source requirements versus design decisions

The feature scope below is derived from the supplied PRD. Choices such as a shared item catalogue, Drizzle ORM, branch entities, API endpoint shapes, status decomposition, and offline conflict handling are engineering decisions introduced to make the PRD implementable. They should be treated as proposed defaults unless product owners approve alternatives.

---

## 2. Product roles and authorization

### 2.1 Roles from the PRD

| Role | Allowed responsibilities | Explicit restrictions |
|---|---|---|
| Business Owner / Super Admin | Tenant-wide visibility, branches, analytics, audit records, thresholds, subscriptions, incident review | No restriction within the tenant; must not gain access to another tenant |
| Shift / Branch Manager | Procurement, expenses, staff onboarding/scheduling, approvals, incident resolution, handover co-sign | Cannot edit/delete finalized operational history |
| Receptionist / Cashier | Customer orders, tender splits, customer credit/debt, push orders to disbursement | Cannot access production sheets, raw-material balances, or fulfillment controls |
| Production Supervisor | Raw-material consumption, batch outputs, waste/scrap, production transfers | Cannot access sales amounts, cash totals, or customer data |
| Packaging & Disbursement Officer | Accept production transfers, view pushed order queue, fulfill orders, count finished goods | Cannot access payment values, cash drawer totals, or procurement logs |

### 2.2 Role model

Authentication establishes the user's identity and session. Application authorization is a separate concern and is enforced in NestJS on every protected request.

Use tenant-scoped membership and role assignments rather than relying solely on a global role stored on the authentication user. Recommended concepts:

- `platform_role`: internal platform administration only, if a platform operator is required.
- `tenant_membership`: links an authenticated person to a tenant and carries the business-level role.
- `branch_membership` or permitted branch scopes: limits staff to assigned branches where relevant.
- `department_membership`: defines department access.
- `permission`: explicit actions such as `orders:create`, `orders:dispatch`, `production:create`, `transfer:accept`, `shift:seal`, `incidents:resolve`, and `reports:read`.

The backend resolves the active tenant and branch from authorized membership, not from an untrusted client-supplied `tenant_id`. The client may send an organization/branch selector, but the server must verify membership before using it.

### 2.3 Dynamic tenant role and department catalog

The system treats roles and departments as tenant configuration records that are seeded for each new tenant and remain editable after onboarding. The seed is a baseline, not a frozen code-level definition.

Design requirements:

- Every new tenant receives a default department catalog and default role catalog from a seed routine.
- The default catalog mirrors the bakery operating model: Reception, Production, Disbursement, and Store departments, plus the standard business roles for Owner, Manager, Receptionist, Production Supervisor, and Disbursement Officer.
- The tenant owner or admin may rename departments, deactivate or archive unused ones, add custom departments, and duplicate or adjust role permissions within the approved permission catalogue.
- The application validates role edits against the approved permission allowlist and tenant access scope, but the system never requires a code deployment to change a tenant’s business departments or role assignments.
- Role and department records remain tenant-scoped. No department or role data is shared across tenants, and tenant membership access is derived from the tenant-specific catalog.

This keeps the product extensible without weakening the security model: the system still enforces a fixed, approved permission vocabulary, while allowing the tenant to decide how those permissions are assigned to the business roles and departments it actually operates.

---

## 3. Architecture overview

### 3.1 High-level components

```text
React + Vite PWA
  Routes, role-aware UI, TanStack Query, Dexie/IndexedDB
  Service worker, local outbox, sync status
             |
             | HTTPS / JSON REST; Better Auth cookies
             v
NestJS API
  Auth integration, RBAC guards, DTO validation, rate limits
  Domain modules, transaction services, reconciliation engine
  Sync ingestion, incident rules, notification and analytics jobs
             |
             | Drizzle ORM / PostgreSQL driver
             v
Neon PostgreSQL
  Tenant data, auth tables, operational ledgers, audit trail
  Idempotency records, notification outbox, reporting queries
             |
             +--> Web Push / SMS / WhatsApp adapter
             +--> Optional LLM provider (insight narration only)
```

### 3.2 Recommended repository layout

Use a TypeScript pnpm workspace to keep the frontend, backend, and shared contracts in one repository while retaining deployable boundaries.

```text
/apps
  /client                 React + Vite PWA
  /api                 NestJS REST API
/packages
  /contracts           Shared enums, API types, event contracts
  /domain              Shared pure calculations and validation helpers
  /config              Shared lint/TypeScript configuration
/docs                  SDD, API notes, runbooks
```

Avoid sharing ORM entities directly with the browser. Share stable DTOs, enums, and schema contracts only. The frontend and backend must be buildable and deployable independently.

### 3.3 Frontend design

- **React + Vite + TypeScript:** app shell and responsive role-based workflows.
- **React Router:** protected route groups and role/department navigation.
- **TanStack Query:** server state, cache invalidation, retry behavior, and online data loading.
- **Dexie over IndexedDB:** durable local operational data, mutation outbox, sync cursor, and device metadata.
- **React Hook Form + Zod (or equivalent):** validated operational forms; align schemas with shared contracts where practical.
- **vite-plugin-pwa / Workbox:** installability and caching of the app shell/static assets. Do not assume service-worker caching alone makes business mutations offline-safe.
- **UI state:** keep temporary UI state local; persist only data needed to resume offline work.

All important operational screens must render from local storage or a local-first repository layer while offline. The app should show network status, pending mutation count, last successful sync, per-record sync state, and conflicts that require intervention.

### 3.4 Backend design

- **NestJS REST API:** version under `/api/v1`; Better Auth routes under `/api/auth/*`.
- **Modules:** each business domain has a module, controller, service/use-case layer, and repository/data access layer.
- **Validation:** validate all incoming bodies/params; reject unknown or invalid enum values. Use DTO validation at the API boundary.
- **Transactions:** inventory, payment, order-state and shift-seal operations must update related ledger rows atomically.
- **Background work:** a database-backed job/outbox worker can claim queued work with row locks and retry it. This avoids requiring a separate queue product for the first release, while keeping provider calls out of request transactions.
- **API documentation:** publish OpenAPI/Swagger for `/api/v1`.

### 3.5 Database and persistence

- **Neon PostgreSQL:** system of record for all confirmed tenant data.
- **Drizzle ORM:** recommended for typed PostgreSQL access and controlled SQL/migrations; it is an implementation choice, not a PRD requirement.
- **Connections:** use the appropriate Neon connection string/pooling option for the deployed runtime; keep migration credentials separate from the runtime application role. Validate transaction behavior against the selected Neon driver before building ledger-critical services.
- **Auth tables:** Better Auth manages its own identity/session schema through its supported database adapter. Domain membership, roles, and operational records remain application-owned tables.
- **Migrations:** version-controlled; run in CI against an ephemeral/test database before deployment.

### 3.6 Better Auth integration

Use Better Auth for sign-up/sign-in, session management, password reset/email verification as configured, and the React session client. Integrate it with the NestJS API through a compatible NestJS adapter or the supported request-handler integration. The community `@thallesp/nestjs-better-auth` package is one available route; confirm compatibility with the selected NestJS adapter, Better Auth version, and runtime in Week 1 before committing to it.

Use secure, HTTP-only cookies where supported, configure trusted origins, and protect state-changing requests against cross-site request forgery according to Better Auth's deployment guidance. Do not store long-lived session tokens in browser localStorage. Offline operation uses a device's previously authenticated local session context only within an explicit policy; it must not create a new authenticated session while disconnected.

### 3.7 Key architectural decisions

| Decision | Proposed design | Reason |
|---|---|---|
| Domain persistence | PostgreSQL relational model + append-only business ledgers | Transactions and cross-department reconciliation require strong consistency |
| ORM | Drizzle ORM | Typed SQL and explicit transaction boundaries suit ledger-heavy workflows |
| Client offline store | Dexie/IndexedDB | Durable local records and an event outbox survive reloads |
| Sync contract | Client-generated event ID + per-device sequence + server idempotency record | Prevent duplicate mutations during retry/reconnect |
| Inventory truth | Append-only stock movements; cached balances derived from movements | Makes transfers, waste, fulfillment, and corrections auditable |
| Financial truth | Payment and expense ledgers; no floating-point money | Keeps cash reconciliation and split tenders deterministic |
| Notifications | Transactional outbox + provider adapters | Prevents a failed provider call from rolling back a committed shift seal |
| AI insights | Deterministic metrics first; optional LLM wording second | The model must not invent totals or make untraceable financial calculations |

---

## 4. Module breakdown and feature inventory

Feature labels: **P0** = required for a controlled first release; **P1** = first-release breadth with reduced sophistication; **P2** = only partly specified by the PRD and requires a follow-up product decision.

### Module 1. Identity, tenant, branch, and access control

**Purpose:** establish safe business isolation and staff access.

Features:
- Sign up/sign in, sign out, session lookup, password reset and email verification according to the configured Better Auth methods. (P0)
- Create tenant/business and initial owner membership. (P0)
- Branch creation and basic branch settings; the PRD's multi-branch analytics imply branches even though the core entity list does not explicitly define a `branches` table. (P0)
- Department setup with default Reception, Production, Disbursement, and Store types. (P0)
- Invite/create staff, activate/deactivate staff, assign tenant role, branch access, and department access. (P0)
- Server-side permission guards and tenant-scoped repository filters. (P0)
- Permission matrix test coverage, including cross-tenant and cross-department denial. (P0)
- Subscription tier/status metadata. Payment collection for subscription billing is underspecified and remains P2 pending a provider and commercial rules. (P2)

### Module 2. Master data and staff operations

**Purpose:** maintain operational records shared by departmental workflows.

Features:
- Product/item catalogue with SKU, name, category, unit of measure, active state, and selling price where applicable. (P0)
- Raw materials and finished goods represented consistently as inventory items distinguished by item type. (P0)
- Suppliers/vendors and receipt references. (P0)
- Customers with contact details, credit limit/ceiling, and outstanding receivable. (P0)
- Shift types, department assignment, staff allocation, basic schedules, and attendance check-in/check-out. (P1)
- Configurable alert thresholds and basic business settings. (P1)
- Configurable custom departments/roles/permissions builder. A safe fixed set of permissions with configurable assignments is the four-week version; arbitrary workflow/permission-builder functionality is P2. (P2)

### Module 3. Procurement, raw materials, and petty cash

**Purpose:** record incoming materials and operating cash outflow.

Features:
- Record procurement receipt: supplier, item, quantity, unit cost, reference, date, receiving user, branch, and optional notes/attachment. (P0)
- Post a stock movement for received materials in the same database transaction as the receipt. (P0)
- Record petty-cash expense: category, amount, reason, payee/reference, approval status, actor, and shift. (P0)
- Allow manager approval for expenses according to configured limits. (P1)
- Correct errors through a reversing/correcting entry, never by deleting a posted receipt or expense. (P0)

### Module 4. Production and yield tracking

**Purpose:** connect raw materials consumed to finished goods created.

Features:
- Create production batch against the active production shift. (P0)
- Record raw materials consumed and quantity/unit for each material line. (P0)
- Record output product, quantity, and SKU/size. (P0)
- Record scrap/waste and reason. (P0)
- Compute observed yield and compare it with configured/previous yield; log variation without blocking normal production. (P1)
- Submit a completed batch as a pending stock transfer to Disbursement. (P0)
- Preserve batch and material-use history in immutable posted records. (P0)

### Module 5. Inventory ledger and production transfer acceptance

**Purpose:** maintain auditable inventory quantities from events.

Features:
- Append-only `inventory_movements` for receipt, production consumption, production output, transfer accepted, fulfillment, waste, adjustment, reversal, and correction events. (P0)
- Stock balance views by tenant, branch, location/department, item, and unit. (P0)
- Pending transfers queue for Disbursement. (P0)
- Disbursement records the physical received count and accepts/rejects or flags differences against the production-submitted count. (P0)
- Record intake discrepancy and create a manager incident when the accepted count differs. (P0)
- Closing physical count entry and expected-versus-counted stock calculation. (P0)
- Concurrency control when two devices attempt to accept a transfer or fulfill the same order. (P0)

### Module 6. Reception, orders, payments, and customer credit

**Purpose:** capture demand and payment evidence without automatically exposing unpushed orders to fulfillment staff.

Features:
- Create order, line items, quantities, unit prices, discounts if enabled, and total. (P0)
- Support split tender across cash, bank transfer, and customer credit/debt. (P0)
- Require a bank transaction reference/note for transfer payments. (P0)
- Require customer identity/contact for debt allocation; compute outstanding amount and aging. (P0)
- Keep an order in `PAID_PENDING_DISPATCH` (or approved-credit equivalent) until Reception explicitly pushes it to Disbursement. (P0)
- Prevent unpushed orders from appearing in the fulfillment queue. (P0)
- Cash tender adds to calculated drawer cash; bank transfer is tracked separately and must not inflate the physical cash drawer. (P0)
- Record voids, refunds, and corrections as compensating events. Detailed refund/payment-provider integration is not defined by the PRD and must be decided if needed. (P1/P2)
- Trigger debt-ceiling incident when customer receivable exceeds the configured ceiling. (P1)

### Module 7. Packaging and Disbursement fulfilment

**Purpose:** ensure goods physically leaving the business map to authorized orders.

Features:
- Role-limited live board containing only orders explicitly pushed by Reception. (P0)
- View order quantities and item descriptions without payment values. (P0)
- Mark order fulfilled and record fulfiller/time/device. (P0)
- Decrease finished stock in the same transaction as fulfillment. (P0)
- Prevent double fulfillment and reject fulfillment greater than available/authorized quantity unless an approved exception process is implemented. (P0)
- Optional partial fulfillment is a product decision; default implementation should require full fulfillment or record an explicit partial-fulfillment event. (P1)
- Department closing physical stock counts. (P0)

### Module 8. Shift lifecycle, handover, and reconciliation

**Purpose:** enforce a dual-signoff transition and quantify starting/closing differences.

Features:
- Open shift with branch, department, shift type, outgoing lead, opening cash float (where applicable), opening physical stock counts, and timestamps. (P0)
- Outgoing lead submits draft closing counts and mandatory note for non-zero variance. (P0)
- Incoming lead independently reviews the counts and co-signs, or flags variance. (P0)
- Shift state machine, audit of transitions, and no editing/deleting finalized shifts. (P0)
- Stock reconciliation formula: `expected stock = opening stock + accepted production transfers - fulfilled orders` (include all applicable stock movements such as approved adjustments/waste if they are in that department's ledger). `stock variance = physical count - expected stock`. (P0)
- Cash reconciliation formula: `expected cash = opening float + cash tenders - approved petty-cash outflow`; `cash variance = counted cash - expected cash`. (P0)
- Balanced closure if variance is zero; unbalanced closure allowed with reason, incoming co-sign, recorded deficiency, and incident creation. (P0)
- Department-level shift seals for Reception and Disbursement; manager/owner can view branch roll-up. (P0)
- Offline draft/signature captured locally and reconciled on sync. A local offline seal is marked `SEALED_PENDING_SYNC` until the server has validated event order, permissions, and conflicts. (P0)

### Module 9. Incident and notification management

**Purpose:** alert only on meaningful exceptions and maintain a complete resolution trail.

Features:
- Incident ledger with type, severity, related shift/transfer/customer, variance values, evidence, status, assigned manager, resolution note, and timestamps. (P0)
- Rules for stock shrinkage, unaccounted surplus, cash deficit, production transfer discrepancy, and debt-ceiling breach. (P0/P1 per channel)
- In-app incident inbox. (P0)
- Web Push for critical/high incidents where supported and permission is granted. (P1)
- SMS/WhatsApp through provider adapters; concrete provider, credentials, templates, and cost limits must be configured. (P1; external setup dependency)
- Retryable notification outbox and delivery status; provider failure must not undo the ledger event. (P0)
- Daily executive summary via WhatsApp. Start with a deterministic summary assembled from known aggregates; add LLM wording only after data-quality checks. (P1)
- Incident acknowledgement, assignment, resolution comment, and closed status. (P0)

### Module 10. Offline-first PWA and synchronization

**Purpose:** preserve permitted operational work during connectivity loss and reconcile it safely when online.

Features:
- Installable app shell with cached static assets and offline route fallback. (P0)
- IndexedDB local cache for permitted catalogue data, open shift context, local drafts, and committed-but-unsynced mutations. (P0)
- Append-only client outbox with `client_event_id`, device ID/fingerprint, per-device sequence number, tenant/branch/department, actor, client timestamp, schema version, and payload. (P0)
- Retry sync when connectivity returns or the user triggers sync; rely on browser background sync only as an enhancement, not a guarantee. (P0)
- Server idempotency: duplicate `client_event_id` returns the original result and must not apply the mutation twice. (P0)
- Pull server acknowledgement and canonical records; mark outbox items `SYNCED`, `CONFLICT`, or `RETRYABLE_ERROR`. (P0)
- Conflict review UI; never silently overwrite competing physical counts, payment records, or sealed shifts. (P0)
- Deterministic ordering and version checks per aggregate; final shift handover becomes the canonical boundary only after validation, not merely because its client timestamp is later. (P0)
- Explicit stale-session/offline policy, device revocation, storage quota handling, and logout behavior. (P0)

### Module 11. Owner dashboards and operational analytics

**Purpose:** expose cross-department integrity and operating performance to owner/manager roles.

Features:
- Overview cards for sales, cash received, verified transfers, receivables, production output, current stock, open/unbalanced shifts, and unresolved incidents. (P1)
- Date, branch, department, product, and shift filters where applicable. (P1)
- Raw material consumed versus finished output and yield trends. (P1)
- Product-level sales velocity and demand by hour/day. (P1)
- Realized inflow (cash + verified transfers) versus outstanding customer debt. (P1)
- Debt aging buckets: 0–7, 8–14, 15–30, and 30+ days. (P1)
- Procurement versus operating petty-cash expenditure. (P1)
- Attendance and shift allocation summary. (P1)
- Variance heatmap/report by shift type, branch, department, and staff ID subject to access permissions and minimum-data safeguards. (P1)

### Module 12. AI and rules-based executive insights

**Purpose:** turn trusted aggregates into short, actionable explanations without making the model the source of financial truth.

Features:
- Compute metrics in SQL/domain services: yield changes, low-stock patterns, stockout frequency, debt concentration, and variance trends. (P1)
- Generate deterministic threshold/rule-based insight records first; each insight includes metric window, supporting values, calculation version, and generated timestamp. (P1)
- Optional LLM rewrites approved metrics into readable summaries. Input should contain aggregates rather than unnecessary personal data; model output must not create new totals, recommend unapproved financial transactions, or mutate operational records. (P1)
- Track generated insights and user dismissals/acknowledgements. (P1)
- True predictive demand modelling is not sufficiently specified/trained in the PRD; treat the initial “predictive stocking” recommendation as a transparent historical-frequency heuristic, not a validated forecasting model. (P2)

### Module 13. Audit, security, reliability, and administration

**Purpose:** make the system defensible and diagnosable.

Features:
- Append-only audit events for sensitive actions and state transitions. (P0)
- Actor attribution: tenant, user, branch/department, device fingerprint, client timestamp, server timestamp, and request/event ID. (P0)
- Tenant isolation in guards, repositories, and PostgreSQL Row-Level Security where correctly supported by the deployment model. (P0)
- Application runtime DB role without `BYPASSRLS`; use transaction-local tenant context if policies depend on session settings. Test connection-pool reuse to avoid tenant context leakage. (P0)
- No update/delete privilege for the runtime role on finalized ledger tables; corrections through compensating entries. Separate migration role from runtime role. (P0)
- Rate limiting on authentication and sensitive writes, secure headers, CORS allowlist, secret management, and structured logs with redaction. (P0)
- Health/readiness checks, error reporting, database migration pipeline, backups/restore procedure, and basic request/queue metrics. (P0)
- Subscription payment processing and platform-wide administration are not sufficiently specified for a payment-provider build; record tenant tier/status in this release and resolve billing policy separately. (P2)

---

## 5. Domain model and database design

### 5.1 Data modelling principles

- Every operational record must be tenant-scoped and, where relevant, branch-, department-, shift-, and actor-scoped.
- Use UUIDs or equivalent non-guessable identifiers for public record IDs.
- Store money in `NUMERIC`/decimal types with an explicit currency code; never use JavaScript floating-point as the authoritative amount calculation. At API boundaries, serialize decimals consistently (for example as decimal strings).
- Store quantities with explicit units. Use integer quantities for indivisible finished units and an appropriate decimal precision for weighed raw materials.
- Store both `client_timestamp` and server-generated timestamps. Client time is useful evidence, but it is not trusted as canonical ordering by itself.
- Use append-only stock and financial movements. Summary balances may be cached/materialized for speed, but they must be reproducible from the ledger.
- Use foreign keys, unique constraints, and indexes to prevent duplicate business events and keep common reads bounded.

### 5.2 Core entities

| Entity / table | Main purpose and important fields |
|---|---|
| `tenants` | Business account, name, status, subscription tier/status, default currency, settings, created time |
| `branches` | Tenant branch/location, name/code, timezone, status |
| `departments` | Tenant/branch scope, type (`RECEPTION`, `PRODUCTION`, `DISBURSEMENT`, `STORE`), name, status |
| `staff_profiles` / `tenant_memberships` | Better Auth user ID, tenant ID, role/status, display name, permitted branches/departments |
| `role_permissions` | Role-to-permission assignments; only approved permission keys may be assigned |
| `catalog_items` | Tenant item/SKU, item type (`RAW_MATERIAL`, `FINISHED_GOOD`, `OTHER`), name, UOM, active flag, price and category where applicable |
| `suppliers` | Vendor identity and contact/reference fields |
| `customers` | Customer identity/contact, credit ceiling, status |
| `procurement_receipts`, `procurement_lines` | Supplier receipt header and item quantities, unit cost, receipt reference, actor/shift |
| `cash_expenses` | Category, amount/currency, reason, payee/reference, approval state, actor/shift |
| `production_batches`, `batch_materials`, `batch_outputs` | Batch header, raw material use, finished output, waste, observed yield, status |
| `stock_transfers`, `stock_transfer_lines` | Production-submitted output, Disbursement physical accepted quantity, discrepancy and acceptance metadata |
| `inventory_movements` | Append-only signed quantity movement by item, branch/location, source event, actor, client/server time |
| `inventory_balances` | Derived/cached quantity per item and stock location; rebuildable from `inventory_movements` |
| `shifts` | Branch/department/type, assigned leads, opening/closing timestamps, state, version, variance summary |
| `shift_counts`, `handover_signatures` | Counted cash/stock, outgoing submission, incoming confirmation, comments, device/time metadata |
| `orders`, `order_items` | Customer order, Reception shift, status, total/currency, push/fulfillment timestamps |
| `payments` | One row per tender component: `CASH`, `TRANSFER`, or `DEBT`, amount, reference, customer, actor/shift |
| `customer_ledger_entries` | Append-only debt charge, repayment, credit adjustment, reversal and balance history |
| `attendance_events` / `shift_assignments` | Staff check-in/out and planned assignments |
| `incidents` | Type/severity, related entity, variance values, status, owner, resolution evidence |
| `notification_outbox` | Provider, destination reference, payload template/version, retry count, delivery status |
| `audit_events` | Sensitive action, actor/device, subject, before/after hashes or safe summary, timestamps, request ID |
| `processed_client_events` | Unique idempotency record for accepted/rejected client events and resulting server entity IDs |
| `insight_records` | Metric window, values/source references, rule/version, optional generated narrative, status |
| Better Auth tables | User identity, sessions, accounts, verification and configured plugin tables managed through Better Auth migrations |

### 5.3 Critical relationships

- `tenant -> branches -> departments -> shifts`
- `tenant -> users/memberships -> role and branch/department scopes`
- `catalog_item -> procurement_lines / batch_materials / batch_outputs / order_items / inventory_movements`
- `production_batch -> stock_transfer -> accepted stock movement`
- `order -> order_items + payments + customer_ledger_entries + fulfillment movements`
- `shift -> opening/closing counts + handover signatures + related operational events`
- `shift/transfer/customer -> incidents -> notification_outbox`

### 5.4 Constraints and indexes

At minimum:

- Unique `(tenant_id, branch_id, sku)` for active catalogue identifiers where SKU is mandatory.
- Unique `client_event_id` within the idempotency scope, typically tenant/device/event ID.
- Unique source movement key, such as `(source_type, source_id, movement_type, item_id)`, where that movement is expected only once.
- Indexes for `(tenant_id, branch_id, status, created_at)`, shift lookup, order fulfillment queue, open incidents, debt aging, and stock by item/location.
- A constraint or transaction-level guard preventing more than one active `OPEN` shift for the same department/shift context if that is the agreed business rule.
- Prevent negative inventory where policy requires it; if operational exceptions permit negative stock, require explicit approval and an incident rather than silently bypassing the constraint.
- Use database transactions and row locks/version fields for concurrent transfer acceptance, fulfillment, and shift sealing.

### 5.5 Ledger rules

1. A posted procurement receipt inserts its receipt lines and inbound stock movement in one transaction.
2. A production batch posts raw-material consumption and creates a pending transfer. Finished stock becomes available to Disbursement only after its transfer is accepted.
3. Transfer acceptance records the physical accepted quantity, discrepancy, and resulting movement atomically.
4. An order's fulfillment and finished-stock deduction commit together. The endpoint must be idempotent.
5. Cash drawer expected balance is derived from opening float + cash tenders - approved cash expenses - other explicit cash movements. Bank transfers must not enter the physical cash drawer formula.
6. Customer debt is a separate receivable ledger. A tender row of type `DEBT` represents the unpaid portion, not cash received.
7. Corrections create reversal/adjustment rows with a reason and link to the original record. They do not erase the original record.

---

## 6. Key workflows and state machines

### 6.1 Production to disbursement

1. Production supervisor records material usage, output by SKU/size, scrap/waste and notes.
2. Backend validates that the user's role and active shift allow the entry.
3. Within one transaction, the system records the batch, raw-material consumption movements, outputs, and pending stock transfer. Output is not yet treated as available Disbursement stock.
4. Disbursement sees the pending transfer and independently counts received units.
5. Acceptance creates the available finished-stock movement. A mismatch records the difference and creates an incident; the intake flow continues unless a separately configured safety rule blocks it.

### 6.2 Order, payment, dispatch, fulfillment

1. Reception creates an order and line items.
2. Payment rows record each split tender. Transfer requires a transaction reference; debt requires a customer record.
3. The order is eligible for dispatch when the payment/credit policy is satisfied. The default PRD-aligned flow is `PAID_PENDING_DISPATCH` or `CREDIT_APPROVED_PENDING_DISPATCH`.
4. Reception manually presses **Push to Disbursement**. Only then does the order appear in the fulfillment queue.
5. Disbursement marks the order fulfilled. The server verifies it was pushed, is not already fulfilled, and stock remains available. Order state and inventory movement commit atomically.
6. If an action was created offline, the UI labels it pending sync until the server acknowledges the canonical result.

Recommended order status and payment status are separate:

- Order status: `DRAFT`, `PENDING_SETTLEMENT`, `PAID_PENDING_DISPATCH`, `CREDIT_APPROVED_PENDING_DISPATCH`, `PUSHED`, `FULFILLED`, `CANCELLED`.
- Payment status: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `CREDIT_OUTSTANDING`, `REFUNDED` (where refunds are implemented).

The separate statuses avoid treating an order with a debt component as though the money had been received in full.

### 6.3 Shift handover

1. Outgoing lead submits closing cash/stock counts and variance notes.
2. Incoming lead independently performs the physical audit and reviews the submitted figures.
3. When balanced, the shift is closed as `BALANCED` after both signatures.
4. When unbalanced, a reason is mandatory, incoming lead acknowledges/co-signs the deficiency, the shift closes as `UNBALANCED`, and an incident is committed.
5. In online mode, the backend validates and seals the canonical shift. In offline mode, the device records a local signature/seal event and marks it `SEALED_PENDING_SYNC`; server acceptance waits for sync validation and conflict checks.
6. The server writes the seal, final variance snapshot, audit event, incident (if required), and notification-outbox rows in one transaction. Provider sends occur after commit.

### 6.4 Shift state machine

```text
OPEN ──> DRAFT_HANDOVER ──> AWAITING_INCOMING_SIGNOFF
                                  │
                       ┌──────────┴──────────┐
                       ▼                     ▼
                  BALANCED               UNBALANCED
                       │                     │
                       └── FINAL / IMMUTABLE ┘

Offline local path: local pending event -> SEALED_PENDING_SYNC -> server BALANCED / UNBALANCED / CONFLICT
```

A finalized shift cannot be reopened by editing the row. If a correction is allowed by an authorized manager, create a linked correction or adjustment event and preserve the original seal.

---

## 7. Offline data and synchronization design

### 7.1 Local storage layout

Suggested IndexedDB stores:

- `catalog_cache`: item/SKU data the device is authorized to use.
- `customer_cache`: only customers/fields needed by the signed-in role and permitted offline policy.
- `active_shift_cache`: active shift and last acknowledged canonical version.
- `local_records`: locally created drafts and unacknowledged business records.
- `outbox`: immutable client mutation events.
- `sync_state`: last server cursor, device sequence, last successful sync, and migration version.
- `conflicts`: server response and user-actionable difference details.

Avoid caching payment values, customer debt, or raw-material data on devices whose role cannot read those fields. Encrypting local storage is not uniformly available across browsers; use device access controls, minimize cached sensitive data, expire offline authorization, and clearly document residual device-loss risk.

### 7.2 Outbox event contract

Each mutation contains:

```json
{
  "client_event_id": "uuid",
  "device_id": "stable-random-device-id",
  "device_sequence": 1042,
  "tenant_id": "server-authorized-tenant-context",
  "branch_id": "branch-id",
  "department_id": "department-id-or-null",
  "actor_user_id": "authenticated-user-id",
  "aggregate_type": "order|batch|shift|transfer|expense",
  "aggregate_id": "client-or-server-id",
  "base_version": 7,
  "event_type": "ORDER_PUSHED",
  "client_timestamp": "ISO-8601",
  "schema_version": 1,
  "payload": {}
}
```

The server must derive/verify actor and tenant permissions from the authenticated session and membership, not trust identity fields in this payload. Client-provided IDs and timestamps are evidence and idempotency metadata, not authorization proofs.

### 7.3 Sync protocol

1. Client submits a bounded batch of outbox events to `POST /api/v1/sync/batch`.
2. Server authenticates the device's user/session, checks active membership and permissions, validates schemas, and processes events in deterministic order per aggregate/device sequence.
3. Server checks `client_event_id`. If already processed, return the stored original outcome without repeating side effects.
4. Valid events apply inside database transactions; successful events write idempotency outcome, business rows, ledger movements, and audit rows atomically.
5. Conflicting events return a structured `CONFLICT` result and do not silently mutate canonical records. Non-conflicting events in the batch may still succeed; each event has its own outcome.
6. Client acknowledges accepted results, pulls server changes since its last cursor, updates local canonical data, and leaves unresolved conflicts visible.
7. Retryable infrastructure failures use exponential backoff with jitter; validation and authorization failures are not retried indefinitely.

### 7.4 Conflict policy

- **Duplicate submission:** idempotency key returns original result.
- **Same order fulfilled twice:** one succeeds; second resolves to existing fulfillment or `CONFLICT`, never deducts stock twice.
- **Two competing physical counts or handovers:** both evidence records are retained; the server canonicalizes according to validated aggregate version/event rules and opens a conflict/incident if they cannot be reconciled deterministically.
- **Out-of-stock race:** server transaction locks/validates balance and applies the configured negative-stock policy.
- **Expired user/device access:** stop new sync writes until re-authentication; locally queued events remain on-device and are not discarded.
- **Schema version mismatch:** server returns an upgrade-required response; client retains the events and must not reinterpret payload silently.

The PRD's goal of zero data loss should be measured as **no accepted local event is silently dropped**. It cannot mean that every conflicting offline action is automatically accepted as canonical; irreconcilable events require review.

---

## 8. API design

### 8.1 API conventions

- Base path: `/api/v1` for domain APIs; `/api/auth/*` for Better Auth.
- JSON requests/responses, ISO-8601 UTC timestamps, decimal strings for authoritative monetary amounts, and explicit pagination for lists.
- Use `Idempotency-Key` for critical online mutations and `client_event_id` for offline sync events.
- Standard error shape: `{ "code": "STOCK_INSUFFICIENT", "message": "...", "requestId": "...", "details": {} }`.
- Never return fields that the caller's role is not permitted to see; field-level permissions matter as much as route-level permissions.
- Use optimistic concurrency through a `version` or `If-Match` token for mutable non-ledger configuration and shift state transitions.

### 8.2 Core endpoint map

| Domain | Endpoint | Purpose |
|---|---|---|
| Session | Better Auth `/api/auth/*` | Sign-in/up/out, session and account flows |
| Current user | `GET /api/v1/me` | User, tenant memberships, active scopes and permission summary |
| Tenant/branch | `POST /tenants`, `GET /tenants/current`, `GET/POST /branches` | Initial tenant setup and branch administration |
| Staff/access | `GET/POST /staff`, `PATCH /staff/:id/status`, `PUT /staff/:id/access` | Staff onboarding and permitted access assignment |
| Master data | `GET/POST /items`, `GET/POST /suppliers`, `GET/POST /customers` | Catalogue, vendors, customers |
| Procurement | `POST /procurement/receipts`, `GET /procurement/receipts`, `POST /expenses`, `POST /expenses/:id/approve` | Receipt and expense capture/approval |
| Production | `POST /production/batches`, `GET /production/batches`, `POST /production/batches/:id/submit` | Batch and yield recording; create pending transfer |
| Transfers | `GET /transfers/pending`, `POST /transfers/:id/accept`, `POST /transfers/:id/flag` | Disbursement acceptance/discrepancy |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/push`, `POST /orders/:id/fulfill`, `POST /orders/:id/cancel` | Order lifecycle and handoff to fulfillment |
| Payments/debt | `POST /orders/:id/payments`, `GET /customers/:id/ledger`, `POST /customers/:id/repayments` | Split tenders and receivable ledger |
| Shifts | `POST /shifts/open`, `POST /shifts/:id/draft-handover`, `POST /shifts/:id/co-sign`, `POST /shifts/:id/seal`, `GET /shifts/:id/reconciliation` | Shift lifecycle and reconciliation |
| Inventory | `GET /inventory/balances`, `GET /inventory/movements`, `POST /inventory/adjustments` | Current balance, audit history, approved adjustments |
| Incidents | `GET /incidents`, `POST /incidents/:id/acknowledge`, `POST /incidents/:id/resolve` | Exception queue and resolution |
| Sync | `POST /sync/batch`, `GET /sync/changes?cursor=...`, `GET /sync/status` | Outbox ingestion and canonical change pull |
| Analytics | `GET /analytics/overview`, `GET /analytics/yield`, `GET /analytics/debts`, `GET /analytics/variance`, `GET /analytics/attendance` | Owner/manager reports |
| Insights | `GET /insights`, `POST /insights/:id/dismiss` | Rule-based/AI-generated executive insights |
| Health | `GET /health/live`, `GET /health/ready` | Process liveness and dependency readiness |

This is an endpoint baseline, not a complete OpenAPI schema. Exact DTOs, response bodies, filtering, and pagination should be defined during Week 1 and versioned in the shared contracts package.

### 8.3 Critical transactional boundaries

Use one database transaction for each of the following operations:

- Procurement receipt + receipt lines + stock movement + audit event.
- Production batch + raw-material movement + output records + pending transfer + audit event.
- Transfer acceptance + accepted stock movement + discrepancy incident when needed + audit event.
- Order payment posting + payment ledger/receivable change + order/payment status change + incident if ceiling exceeded.
- Fulfillment + inventory decrement + order status transition + audit event.
- Shift seal + final counts + variance snapshot + audit event + incident and notification-outbox creation.
- Sync event outcome + business mutation + resulting audit/ledger rows.

External provider calls (SMS, WhatsApp, Web Push, email, LLM) must not happen inside a transaction that locks operational rows. Queue the job after the relevant record commits.

---

## 9. Security, auditability, and privacy

### 9.1 Authentication and sessions

- Better Auth is the identity/session authority.
- Configure production secret, trusted origins, secure cookies, password/session policy, and mail delivery for verification/reset flows that are enabled.
- Keep auth routes and normal JSON routes compatible with request body parsing; test this early because Better Auth handlers may need raw-body handling and adapter-specific setup.
- Protect sensitive state-changing endpoints against CSRF and enforce HTTPS in production.
- Rate-limit authentication, invites, PIN/password checks if used, and repeated failed write attempts.

### 9.2 Authorization

- Deny by default. Every controller/service entry point must define required permissions.
- Enforce tenant, branch, and department scope in NestJS guards and repositories.
- Do not expose payment amount fields to Disbursement or production data to Reception through either API response or cached client state.
- Use database Row-Level Security as defense in depth where the Neon connection model supports the chosen session context safely. With pooled connections, set tenant context transaction-locally and test for cross-request context leakage. The app-layer scope checks remain mandatory.
- Test tenant isolation by attempting to read/write another tenant's IDs directly in URLs and payloads.

### 9.3 Immutable data

For posted inventory, payment, shift seal, production, and expense records:

- Restrict the runtime database role from `UPDATE`/`DELETE` on finalized ledger tables where feasible.
- Let migration/maintenance access use a separate role and credentials not present in the runtime service.
- Apply corrections through compensating records that refer to the original record and carry a reason, actor, and timestamp.
- Treat user deactivation as a status change, not deletion of identity or audit history.
- Audit privileged access and configuration changes, including threshold/role changes.

### 9.4 Device and offline security

- Assign a random app device ID; do not treat a browser fingerprint as strong identity or authentication.
- Record the requested device fingerprint/ID as audit metadata. Avoid collecting invasive fingerprint data without a product/legal reason.
- Define maximum offline session age and sensitive-cache lifetime. On logout or device revocation, delete accessible local caches and queued sensitive data according to policy; never pretend already exported/copied browser data can be remotely erased.
- Apply least-privilege caching by department and minimize cached customer/contact fields.

### 9.5 Reliability and observability

- Structured JSON logs with request ID, tenant ID, actor ID where appropriate, module, result, latency, and error code. Do not log passwords, session tokens, bank details, or unnecessary customer information.
- Metrics: request latency/error rates, DB latency, transaction retries, sync queue size/age, conflict rate, notification delivery lag, open incident count, and reconciliation failures.
- Alert on repeated DB connection failures, dead-lettered notifications, sync backlog, and server-side 5xx spikes.
- Provide a tested database backup/restore plan and deployment rollback strategy before general rollout.

---

## 10. Analytics, alerting, and AI design

### 10.1 Calculation source of truth

Analytics must read committed ledgers/approved aggregates, not client-side estimates. Define formula versions and time windows, branch timezone, and inclusivity of start/end dates. Totals must reconcile to source transactions and support drill-down to the underlying records for authorized roles.

### 10.2 Initial insight rules

Begin with deterministic rules:

- Yield change by product/shift over a defined lookback window.
- Frequency of stockouts or low-stock events by product and weekday/time.
- Current debt as a share of sales and weekly change.
- Concentration of debt across the largest customer balances.
- Rate and magnitude of stock/cash variance by branch, shift type, and department.

Each insight stores its supporting aggregate values, date window, generation rule/version, and data timestamp. The narrative layer can phrase metrics but cannot change numbers or trigger operational writes. If the underlying data volume is too low, return “insufficient data” rather than a confident recommendation.

### 10.3 Notification delivery

- Incident and notification-outbox rows are created inside the same transaction that seals the shift or accepts the discrepant transfer.
- A worker claims pending outbox rows, calls the channel adapter, and records success/failure/attempt count/provider ID.
- Use bounded retries with backoff and a dead-letter/error state for repeated permanent failures.
- Respect user channel preferences and provider rules. The PRD's SMS/WhatsApp destination/provider, opt-in, templates, and operating budget are not yet specified; these must be configured before those channels can be accepted as release criteria.
- Alert target: under 30 seconds from online unbalanced shift closure to owner/manager notification. For an offline closure, this timing starts after the event reaches the server and is successfully sealed.

---

## 11. Non-functional requirements and acceptance targets

| Area | Acceptance target for the first release |
|---|---|
| Tenant isolation | Automated tests prove cross-tenant reads/writes are denied through both API and DB policies where configured |
| Department isolation | Each persona sees only allowed screens, fields, APIs, and offline cache data |
| Idempotency | Replaying the same client event does not duplicate stock, payment, order, or incident side effects |
| Offline durability | Local mutation persists across reload/restart; reconnect sync reports accepted/conflict/error explicitly; no event disappears silently |
| Reconciliation | Known test fixture balances calculate exact expected cash/stock and variances |
| Shift sealing | Both required signoffs and mandatory unbalanced explanation are enforced server-side |
| Alerts | Online critical variance generates an incident and queued notification; delivery attempts and failures are observable |
| Performance | Paginated operational list endpoints; indexes for high-traffic filters; baseline load test for concurrent order, sync, and shift-close traffic |
| Accessibility/usability | Keyboard-operable desktop flows, readable contrast, mobile-friendly forms, clear offline/pending/conflict states |
| Auditability | Posted events are not silently mutated/deleted; correction records link to originals |
| Recoverability | Migration, backup, restore, and rollback steps documented and rehearsed on a non-production environment |
| Four-week scope | Every module has an end-to-end acceptance test or is explicitly marked as a known deferred integration |

The PRD's KPI targets (85% shrinkage reduction within 30 days, handover under four minutes, zero data loss, discrepancy alert under 30 seconds) are product outcome targets. They cannot be proven solely by software tests; shrinkage reduction in particular requires real operational baseline and deployment data.

---

## 12. Four-week implementation plan

### Working assumptions

- Small team: frontend/PWA engineer, backend/data engineer, and shared QA/product/DevOps capacity.
- One branch and one tenant can be seeded for demos, but the data model and authorization tests are tenant/branch-aware from the start.
- All core workflow categories are implemented in a narrow, usable form; advanced forecasting and billing are simplified or deferred as noted.
- Provider credentials for email, Web Push, SMS/WhatsApp, and any LLM are available when integration work starts. If not, implement provider adapters with sandbox/mock tests and label live delivery as blocked by configuration.
- Daily integration occurs on a shared development environment. No team member builds a module in isolation until the final week.

### Week 1 — Foundation, auth, tenancy, and operational skeleton

**Goal:** secure application skeleton with schema, user scopes, master data, PWA shell, CI, and deployable development environment.

**Frontend/PWA**
- Set up React/Vite/TypeScript, route structure, responsive layout, role-aware navigation, form primitives, loading/error/empty states.
- Register PWA shell and manifest; create network-state/sync-status indicators.
- Build sign-in and session-aware routing using Better Auth client.
- Define local repository interfaces so operational screens can later use IndexedDB without rewriting every component.

**Backend/data**
- Set up NestJS modules, `/api/v1`, DTO validation, OpenAPI, logging, config validation, health/readiness endpoints.
- Spike Better Auth + NestJS + Neon connection and cookie/session flow; select adapter/version and commit working example before feature development.
- Configure Neon dev/test branches or databases, Drizzle schema/migrations, separate migration/runtime credentials.
- Implement tenant, branch, department, membership, role/permission, staff, item, supplier, and customer schema/API.
- Implement service-level tenancy scoping and permission guards; write cross-tenant/department denial tests immediately.

**Shared QA/DevOps**
- Establish formatting/lint/typecheck/test commands and CI for both apps.
- Configure `.env.example`, secrets policy, seeded demo tenant/users/items, and preview deployment.
- Agree API DTO/status conventions and use the shared contracts package.

**Exit criteria**
- Owner and each departmental persona can sign in and land on an authorized workspace.
- A staff member cannot access another tenant's data or forbidden department APIs by changing IDs manually.
- Schema migrations run from a clean test database and API health checks pass.

### Week 2 — End-to-end operating workflows

**Goal:** real procurement-to-production-to-order-to-fulfillment movement using transactional inventory and payment ledgers.

**Frontend/PWA**
- Build item/customer/supplier screens, procurement and expense forms, production batch form, pending transfer board, Reception order/cart/payment form, manual push-to-disbursement action, and fulfillment queue.
- Implement cash/transfer/debt split tender interface with field validation.
- Build local draft persistence for long forms and low-connectivity recovery where feasible.

**Backend/data**
- Implement procurement receipt + raw-material movements + audit event transaction.
- Implement expense posting/approval and cash-expense ledger.
- Implement production batch, material consumption, output, waste, and pending stock transfer.
- Implement transfer acceptance with count difference incident.
- Implement order/payment/debt ledger, manual push workflow, and atomic fulfillment/stock deduction.
- Add row locks/version checks and idempotency for critical online mutations.

**Shared QA**
- Write integration fixtures for stock in, stock consumed, output transferred, transfer accepted, order paid/pushed/fulfilled, split tenders, and customer credit.
- Verify that transfer and fulfillment retries do not double-adjust inventory.
- Run department-field-level permission checks, especially monetary values in Disbursement.

**Exit criteria**
- A seeded scenario can run from procurement receipt through production and order fulfillment with correctly reconciled ledger movements.
- Reception must push an order before it appears in Disbursement.
- Production/Disbursement cannot see customer payment amounts or cash totals.

### Week 3 — Shift seals, reconciliation, offline outbox, and incidents

**Goal:** the accountability core works online and recovers safely from an offline interval.

**Frontend/PWA**
- Implement opening/closing counts, outgoing draft handover, incoming review/co-sign, mandatory variance explanation, and incident inbox.
- Add Dexie stores for authorized cache, local records, outbox, sync state, and conflicts.
- Implement online/offline banner, pending sync counts, retry control, per-event sync status, and conflict-resolution UI.
- Make key workflows operate against local repositories when the network is unavailable.

**Backend/data**
- Implement shift state machine and stock/cash reconciliation in tested domain services.
- Implement shift sealing transaction that writes final counts, signatures, variance summary, audit event, incidents, and notification-outbox records.
- Implement `/sync/batch` and `/sync/changes`, per-event idempotency, aggregate versions, retryable errors, and conflicts.
- Implement outbox worker plus in-app alert and first delivery adapter (Web Push if deployment supports it; SMS/WhatsApp adapter interface and sandbox tests).
- Add database-level protections for posted ledger tables and compensating-entry paths.

**Shared QA**
- Test airplane-mode create/reload/reconnect/replay for each critical event category.
- Test duplicate/out-of-order events, expired session, two devices accepting one transfer, competing handovers, insufficient stock, and provider outage.
- Measure online shift-seal-to-notification latency in a controlled test.

**Exit criteria**
- A local event remains persisted while offline and receives an explicit server outcome after reconnect.
- Duplicate sync is safe; conflicts remain visible and do not silently change canonical balances.
- Balanced shifts close quietly; unbalanced shifts can close with the required reason/co-sign and create an incident.

### Week 4 — Owner analytics, insights, attendance, hardening, and pilot release

**Goal:** deliver owner visibility, core executive summaries, baseline insight rules, and a testable pilot release.

**Frontend/PWA**
- Build owner/manager overview, date/branch filters, debt-aging view, yield/product velocity views, expense overview, attendance summary, and variance report/heatmap.
- Build incident assignment/resolution views and role/threshold settings.
- Finish offline-state UX, responsive/mobile checks, empty states, and accessible keyboard flows.

**Backend/data**
- Implement aggregate/report queries and ensure every metric reconciles to underlying ledgers.
- Implement rule-based insights (yield decline, stockout frequency, debt trend/concentration, variance trend) with stored supporting values and time windows.
- Add optional LLM narrative adapter only if a provider is configured; gate it behind a feature flag and never delegate calculation or writes to the model.
- Implement attendance check-in/out and basic shift assignment.
- Finish Web Push and SMS/WhatsApp adapter configuration, notification retries, audit search, health checks, indexes, and operational limits.
- Add basic role/permission assignment UI; leave arbitrary custom permission-builder and paid subscription billing as explicit follow-up scope unless already specified.

**Shared QA/DevOps**
- Run E2E journeys for every persona and the complete bakery shift scenario.
- Run tenant isolation, permission leakage, mutation replay, offline reconnect, transactional consistency, and concurrency regression suites.
- Run baseline load test against simultaneous sales/order actions, sync batch ingestion, and shift closure; tune the slowest SQL paths and connection pool settings.
- Configure production-like environment variables, migrations, backup/restore checklist, monitoring/error reporting, rollback, seed/demo data, and pilot runbook.
- Conduct a short user acceptance session using realistic stock/cash scenarios and a recorded defect triage list.

**Exit criteria**
- Owner can inspect stock, sales, cash/transfer/debt, yield, debt aging, variance, attendance, and unresolved incidents within their authorized scope.
- Insights provide traceable source values and do not invent financial numbers.
- Core E2E tests pass on the deployed preview; unresolved external integrations are marked clearly rather than simulated as live delivery.
- A pilot operator can complete the workflow and understand whether each event is synced, pending, or in conflict.

### Weekly milestone summary

| Week | Milestone | Main dependencies | Release gate |
|---|---|---|---|
| 1 | Secure deployable foundation | Auth adapter, schema, roles | Cross-tenant/department tests pass |
| 2 | Core operating ledger | Item catalogue, transaction services | Procurement-production-order-fulfillment flow reconciles |
| 3 | Shift integrity and offline recovery | Stable domain contracts from Week 2 | Seal, idempotency, offline sync and conflict tests pass |
| 4 | Executive visibility and pilot | Committed ledgers and shift data | End-to-end acceptance, monitoring and rollback ready |

---

## 13. Definition of done

A feature is not complete merely because a form submits. It is done when:

1. The user can complete the authorized flow on desktop and mobile.
2. Server validation and role/tenant checks enforce the same rules as the UI.
3. Critical mutations use transactions and are safe under retry/concurrency.
4. Ledger/audit side effects are present and correction behavior is defined.
5. The offline behavior is implemented or the feature is explicitly marked online-only with a user-facing explanation.
6. Unit tests cover calculations/state transitions; integration tests cover database consistency; E2E tests cover the relevant persona flow.
7. Loading, empty, validation-error, API-error, offline, pending-sync, and conflict states are handled.
8. API and schema changes are documented and migrated through CI.
9. Sensitive data is not leaked through logs, payloads, dashboards, or local cache.
10. Acceptance criteria are demonstrated on a shared environment before the feature is marked complete.

---

## 14. Scope risks and decisions to close early

| Risk / open decision | Why it matters | Recommended resolution |
|---|---|---|
| Four-week schedule vs. original 16-week roadmap | Offline sync, immutable ledgers, analytics, alerts, and AI are each substantial | Use a small team, daily integration, and a feature-complete-but-thin target; schedule a post-pilot hardening phase |
| Better Auth NestJS adapter/runtime | Integration libraries and body-parser handling are version/runtime sensitive | Run a Day 1 spike with the selected NestJS HTTP adapter, Better Auth version, cookie/CORS flow, and Neon adapter; pin tested versions |
| Neon pooling and transactions | Ledger-critical operations need reliable multi-statement atomicity | Validate driver/pool setup and transaction semantics early; use a migration role separate from runtime role |
| Offline dual signoff | Two disconnected devices cannot know each other's newest event | Store local evidence, surface pending-sync status, and finalize canonical server status only after validation; preserve conflict evidence |
| Branch and stock-location detail | PRD includes branch analytics but entity model omits Branch | Add `branches` and explicit inventory location/department dimensions in schema |
| User/role terminology | “Super Admin” could mean platform operator or tenant owner | Keep platform operator and business owner separate; apply business roles per tenant |
| Order/payment statuses | PRD uses both `DRAFT/PUSHED/FULFILLED` and `PAID_PENDING_DISPATCH` | Separate order status from payment status and confirm credit eligibility rules |
| Cash and transfer semantics | Only cash changes the physical drawer | Keep cash and bank transfers distinct; define “verified transfer” evidence and manual verification responsibility |
| SMS/WhatsApp provider | No provider, consent rule, or credentials are specified | Choose provider, test destination/template, set retry/cost limits, and define delivery SLA |
| AI provider and privacy | Provider, data residency, budget and model are unspecified | Ship deterministic insights first; add LLM narration behind feature flag after privacy review |
| Subscription billing/custom role builder | Mentioned at goal/roadmap level, not fully specified | Build tenant tier/status and safe role assignment; scope payment checkout and arbitrary permission builder separately |
| Refunds, partial fulfillment, unit conversions | The PRD does not define edge-case policies fully | Decide rules before these paths are exposed in production; use explicit compensating events |

---

## 15. Suggested repository and deployment conventions

### Environments

- **Local:** local frontend/backend, Neon development branch or isolated dev database, seeded demo dataset, provider mocks.
- **Preview/staging:** production-like auth cookie settings, separate Neon branch/database, real or sandbox notification providers, synthetic data only.
- **Production:** separate Neon branch/database and credentials, HTTPS, trusted origins, alerting, backups, provider secrets, migration/rollback procedure.

### Configuration examples

```text
NODE_ENV=
WEB_ORIGIN=
API_ORIGIN=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
DATABASE_URL=          # application runtime connection
DIRECT_DATABASE_URL=  # migration/admin connection if required by the chosen driver
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
SMS_PROVIDER_*
WHATSAPP_PROVIDER_*
LLM_API_KEY=
```

Do not commit actual secret values. The exact environment variables depend on chosen providers and the Better Auth/Neon driver configuration.

### Deployment checklist

- Build/typecheck/lint and test both apps.
- Apply reviewed migrations using migration credentials.
- Verify runtime role permissions and tenant RLS policies.
- Verify Better Auth trusted origins, secure cookies, CSRF controls and session expiry.
- Verify service-worker caching excludes sensitive API responses and authentication endpoints.
- Verify backup, restore, health/readiness checks, error reporting and notification-worker operation.
- Run a smoke test for sign-in, order lifecycle, inventory ledger, shift seal, incident alert, sync idempotency, and tenant isolation.

---

## 16. Reference documentation

### Product source

- TallyBakery, *Product Requirements Document: Shift-Based Inventory & Sales Reconciliation Platform*, version 1.0.0, supplied for this task.

### Technical references reviewed

- Better Auth, Installation: https://better-auth.com/docs/installation
- Better Auth, Database concepts: https://better-auth.com/docs/concepts/database
- Better Auth, PostgreSQL adapter: https://better-auth.com/docs/adapters/postgresql
- Better Auth, Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
- Better Auth, NestJS integration: https://better-auth.com/docs/integrations/nestjs
- NestJS, Guards: https://docs.nestjs.com/guards
- Vite PWA documentation: https://vite-pwa-org.netlify.app/guide/
- Neon documentation: https://neon.tech/docs

Integration libraries, Better Auth adapter APIs, browser PWA capabilities, and Neon connection options change over time. Pin versions and confirm the selected implementation path during the Week 1 integration spike rather than relying on unpinned examples.

---

**End of document**
