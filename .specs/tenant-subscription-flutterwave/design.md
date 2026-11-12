# Design Document: Tenant Subscription Billing & Flutterwave Integration

## Module: Tenant Subscription Billing & Payments

### Subsystem: TallyBakery Multi-Tenant Operations Platform

---

## Overview

The Tenant Subscription Billing module provides an automated, multi-tenant billing infrastructure powered by Flutterwave. It enables tenant owners to subscribe to recurring plans (`STARTER`, `GROWTH`, `ENTERPRISE`), handles hosted checkout flows, verifies transactions using server-to-server zero-trust verification, processes asynchronous webhooks securely, and manages tenant lifecycle states (`TRIALING`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `CANCELED`).

This design strictly respects TallyBakery's architecture principles:

1. Multi-tenant isolation at database, service, and API boundaries.
2. Immutable role ceilings (only `OWNER` can access subscription endpoints).
3. Zero-trust transaction verification (no state change without direct Flutterwave API verification).
4. Timing-safe webhook ingestion with immediate HTTP 200 return and background event processing.
5. Soft operational degradation (7-day grace period with executive banners before write operations are blocked).

---

## Current Architecture and Evidence

| Concern                           | Existing implementation                                                                                                       | Design implication                                                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tenancy & Subscription Status** | `apps/api/src/database/schema/tenancy.schema.ts` (`tenants.subscriptionTier`, `tenants.subscriptionStatus`, `tenants.status`) | Extend schema with dedicated `tenant_subscriptions`, `subscription_plans`, and `subscription_invoices` tables; keep `tenants.subscriptionTier` and `tenants.subscriptionStatus` synchronized as fast-read denormalized projections.                  |
| **Access Control & Permissions**  | `apps/api/src/access-control/permissions.ts` (`VALID_PERMISSIONS`, `ROLE_CEILINGS`)                                           | Introduce `subscription:read` and `subscription:manage` permissions; place them strictly within `ROLE_CEILINGS.OWNER`. Non-owner roles are structurally blocked from viewing or mutating subscription contracts.                                     |
| **Tenant Boundary Guards**        | `apps/api/src/auth/guards/tenant-scope.guard.ts`                                                                              | Verify tenant active status; when `tenants.status === 'SUSPENDED'`, reject state-modifying requests (`POST`, `PUT`, `PATCH`, `DELETE`) with `ACTIVE_TENANT_REQUIRED`, while allowing owners to access `/subscriptions` endpoints to recover account. |
| **Audit Logging**                 | `apps/api/src/audit/audit.service.ts` (`audit_events` schema)                                                                 | Log immutable audit records for checkout creation, payment verification, tier changes, cancellations, and webhook activations.                                                                                                                       |
| **Idempotency**                   | `idempotency_records` schema                                                                                                  | Reuse idempotency mechanisms for checkout initiation and webhook replay protection.                                                                                                                                                                  |
| **Shared Contracts**              | `packages/shared/src/index.ts`                                                                                                | Export subscription enums (`SUBSCRIPTION_TIERS`, `SUBSCRIPTION_STATUSES`, `BILLING_INTERVALS`), DTOs, and error codes (`SUBSCRIPTION_EXPIRED`, `PAYMENT_VERIFICATION_FAILED`).                                                                       |

---

## Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (React / Vite)                     │
│  - Owner Billing Settings / Plan Selection UI                          │
│  - Grace Period Warning Banner & Expired Account Recovery Modal        │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ 1. POST /subscriptions/checkout │ 4. Redirect Callback
                   │    (planId, billingInterval)    │    /billing/callback?id=...
                   ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       NestJS API Boundary                              │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │ SubscriptionController│              │  FlutterwaveWebhookCtrl   │  │
│  │ (Session + TenantGuard│              │  (TimingSafeSignatureGuard│  │
│  │  + PermissionGuard)   │              │   No-Session Endpoint)    │  │
│  └───────────┬───────────┘              └─────────────┬─────────────┘  │
│              │                                        │                │
│              ▼                                        ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SubscriptionService                           │  │
│  │  - Manages subscription lifecycle (TRIALING, ACTIVE, PAST_DUE)    │  │
│  │  - Enforces 7-day grace period and soft tenant suspension        │  │
│  │  - Creates invoices & records audit events                       │  │
│  └───────────┬────────────────────────────────────────┬─────────────┘  │
│              │                                        │                │
│              ▼                                        ▼                │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │ FlutterwaveClient     │              │ Drizzle ORM Repository    │  │
│  │ (Universal v3/v4 SDK) │              │ - tenant_subscriptions    │  │
│  │ - /payments           │              │ - subscription_plans      │  │
│  │ - /transactions/verify│              │ - subscription_invoices   │  │
│  │ - /payment-plans      │              │ - payment_webhook_events  │  │
│  └───────────┬───────────┘              └─────────────┬─────────────┘  │
└──────────────┼────────────────────────────────────────┼────────────────┘
               │ 2. Create Hosted Checkout              │
               │ 5. Verify Transaction (GET)            │ PostgreSQL
               ▼                                        ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│     Flutterwave Services     │          │    TallyBakery Database      │
│  - Hosted Payment Modal      │          │  - Multi-tenant schemas      │
│  - Card / Bank / MoMo rails  │          │  - Tamper-evident ledgers    │
│  - Recurring billing engine  ├──────────►  - Webhook idempotency table  │
└──────────────────────────────┘ 3. Webhook: charge.completed (verif-hash)
```

---

## Core Workflows & State Machines

### 1. Subscription Lifecycle State Machine

```text
    ┌──────────────┐
    │  TRIALING    │◄──────── (New Tenant Registration, e.g. 14 days)
    └──────┬───────┘
           │ Payment Successful
           ▼
    ┌──────────────┐
    │   ACTIVE     │◄─────────────────────────────┐
    └──────┬───────┘                              │ Payment
           │ Renewal Failed / Expired             │ Recovered
           ▼                                      │
    ┌──────────────┐                              │
    │  PAST_DUE    ├──────────────────────────────┘
    │(7-day grace) │
    └──────┬───────┘
           │ Grace Period Expired (> 7 Days)
           ▼
    ┌──────────────┐
    │  SUSPENDED   │ (Write operations blocked; Owner billing recovery active)
    └──────────────┘
           ▲
           │ Explicit Cancellation
    ┌──────┴───────┐
    │  CANCELED    │
    └──────────────┘
```

### 2. Hosted Checkout & Verification Flow

1. **Initiate**: Owner sends `POST /subscriptions/checkout` with `planId` and `interval` (`MONTHLY` | `YEARLY`).
2. **Invoice Generation**: System inserts pending record into `subscription_invoices` with generated `tx_ref`:
   `SUB-${tenantId.slice(0, 8)}-${plan.code}-${Date.now()}`.
3. **Flutterwave Payment Session**: System calls Flutterwave `POST /payments` via `FlutterwaveClient`:
   - `tx_ref`: Unique reference.
   - `amount`: Plan price.
   - `currency`: Plan currency (NGN, GHS, KES, USD).
   - `redirect_url`: `${CLIENT_BASE_URL}/settings/billing/callback`.
   - `customer`: `{ email: owner.email, name: owner.name }`.
   - `meta`: `{ tenantId, planId, invoiceId }`.
4. **Redirect**: System returns `{ paymentLink, txRef }` to client. Client opens Flutterwave modal or redirects user.
5. **Callback & Zero-Trust Verification**:
   - User completes payment; Flutterwave redirects back to `redirect_url?transaction_id=123456&tx_ref=...`.
   - Client calls `GET /subscriptions/verify?transaction_id=123456&tx_ref=...`.
   - Backend calls Flutterwave `GET /transactions/123456/verify`.
   - Backend validates:
     - `response.status === 'successful'`
     - `response.data.tx_ref === invoice.txRef`
     - `response.data.amount >= invoice.amount`
     - `response.data.currency === invoice.currency`
   - Upon successful verification:
     - Atomically updates `subscription_invoices.status = 'PAID'`.
     - Updates/creates `tenant_subscriptions` with `status = 'ACTIVE'`, `currentPeriodStart = now()`, `currentPeriodEnd = now() + interval`.
     - Syncs `tenants.subscriptionTier` and `tenants.subscriptionStatus`.
     - Logs audit record `TENANT_SUBSCRIPTION_ACTIVATED`.

### 3. Asynchronous Webhook Processing Flow

1. Flutterwave dispatches webhook to `POST /webhooks/flutterwave`.
2. **Signature Check**: `FlutterwaveSignatureGuard` verifies incoming `verif-hash` header using `crypto.timingSafeEqual`:
   ```ts
   const secretHash = process.env.FLW_WEBHOOK_HASH;
   const incomingHash = req.headers['verif-hash'];
   // timingSafeEqual check...
   ```
3. **Fast Acknowledgement**: The controller immediately records the raw payload in `payment_webhook_events` with status `RECEIVED` and returns HTTP `200 { status: 'acknowledged' }` within milliseconds (well under Flutterwave's 60-second limit).
4. **Background / Immediate Processor**:
   - Checks if `event.id` or `data.tx_ref` has already been processed (`status === 'PROCESSED'`). If yes, exits cleanly.
   - For `charge.completed`:
     - Verifies transaction against Flutterwave API.
     - Extends `currentPeriodEnd`.
     - Marks invoice as `PAID`.
     - Updates `payment_webhook_events.status = 'PROCESSED'`.
   - For `subscription.cancelled`:
     - Updates status to `CANCELED`.

---

## Data and Identity Contracts (Database Schemas)

The database models are implemented using Drizzle ORM in `apps/api/src/database/schema/subscription.schema.ts`:

### 1. `subscription_plans`

```ts
export const billingIntervalEnum = pgEnum('billing_interval', ['MONTHLY', 'YEARLY']);
export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'STARTER',
  'GROWTH',
  'ENTERPRISE',
]);

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. 'STARTER_MONTHLY'
  name: varchar('name', { length: 100 }).notNull(),
  tier: subscriptionTierEnum('tier').notNull(),
  description: text('description'),
  priceAmount: numeric('price_amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(), // NGN, USD, etc.
  interval: billingIntervalEnum('interval').notNull(),
  maxBranches: integer('max_branches').default(1).notNull(),
  maxStaff: integer('max_staff').default(10).notNull(),
  flwPlanId: varchar('flw_plan_id', { length: 100 }), // optional Flutterwave recurring payment plan ID
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 2. `tenant_subscriptions`

```ts
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'SUSPENDED',
  'CANCELED',
]);

export const tenantSubscriptions = pgTable('tenant_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
  status: subscriptionStatusEnum('status').default('TRIALING').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  gracePeriodEnd: timestamp('grace_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  flwSubscriptionId: varchar('flw_subscription_id', { length: 100 }),
  flwCustomerToken: varchar('flw_customer_token', { length: 100 }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 3. `subscription_invoices`

```ts
export const invoiceStatusEnum = pgEnum('subscription_invoice_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]);

export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => tenantSubscriptions.id, {
    onDelete: 'set null',
  }),
  planId: uuid('plan_id')
    .notNull()
    .references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: invoiceStatusEnum('status').default('PENDING').notNull(),
  txRef: varchar('tx_ref', { length: 100 }).notNull().unique(),
  flwRef: varchar('flw_ref', { length: 100 }),
  flwTransactionId: varchar('flw_transaction_id', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 4. `payment_webhook_events`

```ts
export const webhookEventStatusEnum = pgEnum('webhook_event_status', [
  'RECEIVED',
  'PROCESSED',
  'FAILED',
  'IGNORED',
]);

export const paymentWebhookEvents = pgTable('payment_webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: varchar('provider', { length: 30 }).default('FLUTTERWAVE').notNull(),
  eventId: varchar('event_id', { length: 120 }), // provider unique event identifier
  eventType: varchar('event_type', { length: 100 }).notNull(), // e.g. 'charge.completed'
  txRef: varchar('tx_ref', { length: 100 }),
  status: webhookEventStatusEnum('status').default('RECEIVED').notNull(),
  payload: jsonb('payload').notNull(),
  errorMessage: text('error_message'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

---

## API & Service Boundaries

### 1. Subscription Management API (`/subscriptions`)

All endpoints are protected by `SessionGuard`, `TenantScopeGuard`, and `@RequirePermission`:

- `GET /subscriptions/plans`
  - Permission: `subscription:read` (or public authenticated)
  - Returns: `ApiResponse<SubscriptionPlanDto[]>`
- `GET /subscriptions/current`
  - Permission: `subscription:read`
  - Returns: Current subscription state, plan quotas, expiration date, grace period countdown.
- `POST /subscriptions/checkout`
  - Permission: `subscription:manage` (Owner ceiling only)
  - Body: `{ planId: string, interval: 'MONTHLY' | 'YEARLY' }`
  - Returns: `{ paymentLink: string, txRef: string, invoiceId: string }`
- `GET /subscriptions/verify`
  - Permission: `subscription:manage`
  - Query: `?transaction_id=12345&tx_ref=SUB-...`
  - Returns: `ApiResponse<SubscriptionSummaryDto>`
- `GET /subscriptions/invoices`
  - Permission: `subscription:read`
  - Query: Cursor pagination params (`limit`, `cursor`)
  - Returns: `CursorPage<SubscriptionInvoiceDto>`
- `POST /subscriptions/cancel`
  - Permission: `subscription:manage`
  - Body: `{ reason?: string }`
  - Transitions `cancelAtPeriodEnd = true`.

### 2. Flutterwave Webhook Ingestion (`/webhooks/flutterwave`)

- `POST /webhooks/flutterwave`
  - Auth: `FlutterwaveSignatureGuard` verifying `req.headers['verif-hash']` against `process.env.FLW_WEBHOOK_HASH`.
  - Body: Raw Flutterwave JSON payload.
  - Returns: `200 { status: 'acknowledged' }` immediately.

---

## Flutterwave Client Integration Standard

The integration encapsulates Flutterwave API calls into a clean NestJS provider (`FlutterwaveService` / `FlutterwaveClient`):

- Base URL configurable: defaults to `https://api.flutterwave.com/v3`.
- Authenticates using Bearer Token header (`Authorization: Bearer ${process.env.FLW_SECRET_KEY}`).
- Includes request timeouts (10 seconds) and retry configuration.
- Native error wrapping into `FlutterwaveApiError` with status codes and diagnostics.
- Idempotency via unique `tx_ref`.

---

## Security & Resilience Checklist

1. **Constant-Time Verification**: `crypto.timingSafeEqual` prevents timing attack vulnerabilities on the webhook secret hash.
2. **Double Verification**: Never update tenant subscription status based solely on webhook or redirect payload. Always call `GET /transactions/{id}/verify`.
3. **Role Ceiling Enforced**: Non-owner roles (Manager, Cashier, Dispatch, Production) are blocked at the router level from creating checkouts or viewing invoice balances.
4. **Multi-Tenant Scoping**: All invoice and subscription queries strictly filter on `actor.tenantId`.
5. **No PCI-DSS Exposure**: Card credentials never touch the TallyBakery API server.
