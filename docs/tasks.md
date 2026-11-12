# Implementation Roadmap & Task Tracker (Backend & E2E)

This document tracks the phased implementation of TallyBakery across all modules defined in the [Software Design Document (SDD)](./tallybakery_software_design_document.md) and the [Product Requirements Document (PRD)](./Product%20Requirements%20Document_%20Shift-Based%20Invento....md).

> **Note:** Frontend and Marketing application tasks are tracked on a dedicated board ([TallyBakery Frontend & Marketing](https://github.com/users/Ade-yem/projects/3)). This roadmap focuses on Backend architecture, domain ledgers, security boundaries, and automated E2E test suites covering frontend client interactions.

---

## 4-Week Milestone Overview

| Phase / Week | Focus Area                                                       | Status                       | Key Deliverables                                                                                          |
| :----------- | :--------------------------------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Week 1**   | Foundation, Auth, Tenancy & Operational Skeleton                 | **Completed (Backend Core)** | Multi-tenancy, Better-Auth, Dynamic Departments & Roles, Master Data, Audit, E2E Scenarios                |
| **Week 2**   | Operational Workflows & Double-Entry Ledgers                     | **Pending**                  | Procurement, Production Yield, Transfer Acceptance, Order/Payment/Debt Ledgers, Automated Operational E2E |
| **Week 3**   | Shift Seals, Reconciliation Engine, Offline Sync & Incidents     | **Pending**                  | Shift Handover State Machine, Reconciliation, Offline Outbox & Sync, Incident Inbox, E2E Sync Replay      |
| **Week 4**   | Owner Analytics, Subscription Billing, Hardening & Pilot Release | **Pending**                  | Operational Analytics, Rule-Based Insights, Flutterwave Subscription Billing, Attendance & Pilot Runbook  |

---

## Week 1: Foundation, Auth, Tenancy & Operational Skeleton

**Goal:** Establish secure multi-tenant isolation, user identities, dynamic roles and departments, master data catalogs, audit foundations, shared contracts, and automated E2E boundary tests.

### Module 1: Identity, Tenant, Branch, and Access Control

- [x] Configure PostgreSQL database with Drizzle ORM (`drizzle-kit`, pooling/unpooled connections).
- [x] Integrate Better-Auth identity tables (`user`, `session`, `account`, `verification`) in API schema.
- [x] Multi-tenant isolation schema: `tenants`, `branches`, `departments`, `tenant_memberships`, `membership_branches`, `membership_departments`.
- [x] Dynamic department model: unconstrained custom categories (`varchar(100)`), unique branch codes, descriptions, and active/inactive status toggling.
- [x] First-class dynamic roles schema (`tenant_roles`) with unique tenant codes, names, descriptions, and system protection flags.
- [x] Explicit role-to-department association schema (`role_departments`) and membership scoping enforcement.
- [x] Fine-grained permission vocabulary (`VALID_PERMISSIONS`) and role ceiling boundaries.
- [x] Permanent protection for the system `OWNER` role and last-owner invariant checks.
- [x] Authentication & authorization guards: `SessionGuard`, `TenantScopeGuard`, `PermissionGuard`, `@CurrentActor()` decorator.
- [x] Automated baseline template seeder (`TenantTemplateSeederService`) provisioning starter departments and roles on onboarding.
- [x] Identity & scope discovery endpoint (`GET /me`).
- [ ] Automated E2E tests: Auth, session discovery & tenant boundary verification (Registration, login, `/me` recovery, cross-tenant header spoofing rejection).

### Module 2: Master Data & Staff Operations

- [x] Catalog schema and API (`catalog_items`): SKUs, categories, units of measure (UOM), and selling price controls.
- [x] Supplier directory schema and API (`suppliers`): external references, contact details, and audit logging.
- [x] Customer management schema and API (`customers`): contact info, currency, and credit ceiling controls.
- [x] Staff management API: staff invitations, role assignments, branch/department access updates, and ceiling validation.
- [x] Access control API: `GET /permissions`, `GET /roles`, `POST /roles`, `PATCH /roles/:roleId`, `DELETE /roles/:roleId`.
- [ ] Automated E2E tests: Master data & staff administration operations (item CRUD, credit ceiling limits, staff invite & role-department scope validation).
- [ ] Automated E2E tests: Dynamic department & role management flows (custom categories, soft deactivation, custom roles, and owner protection).

### Module 13: Audit, Security, Reliability & Administration (Foundation Layer)

- [x] Tamper-evident audit ledger (`audit_events`) capturing actor, action, subject ID, request ID, and metadata.
- [x] Centralized `AuditService` wired into sensitive tenant, catalog, supplier, and role operations.
- [x] Idempotency table schema (`idempotency_records`) with request fingerprinting and status caching.
- [x] Liveness and readiness health endpoints (`GET /health`, `GET /health/live`, `GET /health/ready`).
- [x] Global environment validation (`validateEnvironment`).

### Shared Contracts & DevOps

- [x] Monorepo TypeScript configuration with NodeNext module resolution.
- [x] Shared package (`@repo/shared`) publishing standard error taxonomy (`ERROR_CODES`), enums (`ROLE_KEYS`, `STATUS_KEYS`, `UOM_KEYS`), and DTO contracts.
- [x] Vitest unit test suite covering configuration, guards, services, role ceilings, and template seeding (100% pass rate).
- [x] Oxlint type-aware linting configured across workspace.

---

## Week 2: End-to-End Operating Workflows

**Goal:** Implement real material and financial movements from procurement through production, transfer acceptance, order billing, and dispatch fulfillment using transactional ledgers and automated E2E tests.

### Module 3: Procurement, Raw Materials, and Petty Cash

- [ ] Database schema for procurement receipts (`procurement_receipts`, `procurement_items`).
- [ ] Database schema for petty cash expenses (`petty_cash_expenses`).
- [ ] Atomic procurement receipt transaction: writes receipt, increments raw material stock movement, and logs audit event.
- [ ] Petty cash expense logging with categories, receipts, and shift linking.
- [ ] Manager expense approval workflow based on configured threshold limits.
- [ ] Compensating reversal entry paths for erroneous receipts/expenses (no hard deletes).

### Module 4: Production and Yield Tracking

- [ ] Database schema for production batches (`production_batches`, `production_batch_inputs`, `production_batch_outputs`, `production_batch_waste`).
- [ ] Batch recording API: links batch to active shift, decrements raw materials consumed, and logs finished goods output.
- [ ] Waste and scrap logging with categorical reasons.
- [ ] Real-time yield calculation comparing actual vs expected batch recipe output.
- [ ] Batch completion workflow: creates pending **Incoming Stock Transfer** queued for Dispatch acceptance.

### Module 5: Inventory Ledger and Production Transfer Acceptance

- [ ] Append-only double-entry inventory ledger (`inventory_movements`): receipts, consumption, outputs, transfers, fulfillment, adjustments.
- [ ] Materialized/derived stock balance queries by branch, department, and item SKU.
- [ ] Pending stock transfer queue API for Dispatch.
- [ ] Transfer acceptance transaction: records physical received count, flags differences, and triggers intake discrepancy incidents if counts mismatch.
- [ ] Concurrency control and row locks preventing double acceptance or race conditions across devices.

### Module 6: Reception, Orders, Payments, and Customer Credit

- [ ] Database schema for customer orders (`orders`, `order_items`) and payments (`order_payments`).
- [ ] Order creation and pricing calculation API supporting line items, quantities, and discounts.
- [ ] Split tender payment processing: cash drawer accumulation, bank transfer tracking with transaction references, customer credit ledger.
- [ ] Customer debt ledger: receivable balances, credit limit validation, and overdue tracking.
- [ ] Order status state machine: orders remain in `PAID_PENDING_DISPATCH` until explicitly pushed.
- [ ] Manual **[Push to Dispatch]** action making orders visible to the fulfillment queue.
- [ ] Compensating void and refund transactions.

### Module 7: Packaging and Dispatch Fulfilment

- [ ] Live dispatch fulfillment queue API (filtered strictly to pushed orders, hiding monetary amounts).
- [ ] Atomic order fulfillment transaction: decrements finished inventory, stamps fulfillment actor/time/device, and updates order status to `FULFILLED`.
- [ ] Idempotency protection preventing double fulfillment.
- [ ] Department closing physical stock count entry.
- [ ] Automated E2E tests: Procurement-to-Production-to-Dispatch operational flows (simulating client requests through procurement, batch output, transfer acceptance, order billing, push to dispatch, and atomic fulfillment).

---

## Week 3: Shift Seals, Reconciliation, Offline Outbox & Incidents

**Goal:** Implement the dual-signoff shift rollover engine, deterministic reconciliation, offline-first IndexedDB persistence, client outbox sync, and exception alerting.

### Module 8: Shift Lifecycle, Handover, and Reconciliation Engine

- [ ] Shift lifecycle schema (`shifts`, `shift_counts`, `shift_reconciliations`).
- [ ] Shift opening: record opening cash float, opening physical stock counts, and lead attribution.
- [ ] Outgoing shift lead draft submission: closing drawer cash count, physical shelf count, and mandatory notes for non-zero variance.
- [ ] Incoming shift lead review and co-sign workflow.
- [ ] Deterministic Stock Reconciliation calculation: `Expected = Opening + Accepted Transfers - Fulfilled Orders`; `Variance = Counted - Expected`.
- [ ] Deterministic Cash Reconciliation calculation: `Expected = Opening Float + Cash Tenders - Approved Expenses`; `Variance = Counted - Expected`.
- [ ] Shift seal transaction: closes shift, records dual signatures, generates discrepancy incident if `Variance ≠ 0`, and queues notifications.

### Module 9: Incident and Notification Management

- [ ] Incident tracking schema (`incidents`, `incident_resolutions`) supporting stock shrinkage, cash deficit, transfer discrepancies, and credit breaches.
- [ ] Automated incident trigger rules evaluated on shift sealing and transfer acceptance.
- [ ] In-app incident inbox and resolution tracking (assignment, notes, closure).
- [ ] Notification outbox worker with retry mechanisms.
- [ ] Delivery adapters: Web Push and SMS/WhatsApp provider integration interfaces.

### Module 10: Client IndexedDB Persistence & Synchronization Protocol

- [ ] Two-way synchronization endpoints (`POST /sync/batch`, `GET /sync/changes`).
- [ ] Server-side event deduplication, canonical ordering, and aggregate version validation.
- [ ] Conflict detection logic preventing silent overwrites of competing physical counts or payments.
- [ ] Automated E2E tests: Shift seals, reconciliation engine & offline sync replay (simulating offline client event queues, idempotency on reconnection, and conflict detection).

---

## Week 4: Owner Analytics, Insights, Attendance & Pilot Release

**Goal:** Deliver owner operational visibility, rules-based executive insight generation, shift scheduling/attendance, end-to-end regression testing, and deployment runbooks.

### Module 11: Owner Dashboards and Operational Analytics

- [ ] High-level executive KPI queries: gross sales, realized cash vs transfers vs receivables, production batch counts, and shrinkage variance.
- [ ] Analytical filtering by date ranges, branches, departments, and shift leads.
- [ ] Raw material consumption vs output yield trend analysis.
- [ ] Product sales velocity and hourly demand curves.
- [ ] Customer debt aging buckets (0–7, 8–14, 15–30, 30+ days).
- [ ] Shift variance heatmaps by branch, department, and shift type.

### Module 12: AI and Rules-Based Executive Insights

- [ ] Automated anomaly and trend detection engine (yield drops, frequent stockouts, debtor concentration).
- [ ] Deterministic insight generation with traceable metric windows and supporting data values.
- [ ] Optional LLM-assisted executive summaries grounded exclusively in computed aggregates (feature-flagged).
- [ ] User dismissal and acknowledgement tracking (`POST /insights/:id/dismiss`).

### Module 2 & 13: Attendance, Operational Hardening & Pilot Release

- [ ] Basic staff attendance tracking (clock-in, clock-out, shift scheduling).
- [ ] PostgreSQL connection pool tuning, query indexing, and egress optimization for high-throughput sync.
- [ ] End-to-end integration test suite exercising the complete factory lifecycle (Procurement → Production → Transfer → Order → Dispatch → Shift Seal → Sync).
- [ ] Production deployment runbook, database backup/restore procedures, and error telemetry wiring.

### Module 14: Tenant Subscription Billing & Flutterwave Integration

- [x] Database schema for subscriptions, billing plans, payment transactions, and webhook event logs (`subscription_plans`, `tenant_subscriptions`, `subscription_invoices`, `payment_webhook_events`).
- [x] Subscription lifecycle state machine (`TRIALING`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `CANCELED`) with 7-day grace period logic.
- [x] Flutterwave client integration module (v3 hosted checkout, bearer authentication, parameter mapping, error handling).
- [x] Subscription checkout initiation API (`POST /subscriptions/checkout`) returning Flutterwave hosted payment URL with unique deterministic `tx_ref`.
- [x] Server-side zero-trust transaction verification handler (`GET /subscriptions/verify`) verifying payment amount, currency, and status against Flutterwave API before state activation.
- [x] Secure Flutterwave webhook endpoint (`POST /webhooks/flutterwave`) with constant-time `verif-hash` header signature verification, immediate HTTP 200 acknowledgement, and asynchronous event processing (`charge.completed`, `subscription.cancelled`).
- [x] Owner-only access control and ceiling validation (`subscription:read`, `subscription:manage`) preventing non-owner roles from accessing billing.
- [x] Soft operational write restriction in `TenantScopeGuard` for `SUSPENDED` tenants with billing recovery exemption.
- [x] Automated E2E & integration tests: Flutterwave subscription checkout, webhook signature verification, transaction verification replay, and tenant suspension enforcement.
