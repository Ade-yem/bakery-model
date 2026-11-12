# TDD Test Specification: Tenant Subscription Billing & Flutterwave Integration

## Module: Tenant Subscription Billing & Payments

### Subsystem: TallyBakery Multi-Tenant Operations Platform

---

## 1. Strategy

This test specification enforces a strict test-first protocol for the subscription billing engine. All tests must be authored and verified prior to implementation.

The test suite covers five primary verification tiers:

1. **Unit Tests**:
   - `FlutterwaveService`: API request formatting, bearer authorization headers, response parsing, error wrapping, and timeout handling.
   - `SubscriptionsService`: Checkout session creation, deterministic `tx_ref` generation, zero-trust transaction verification, invoice state progression, and 7-day grace period calculations.
2. **Access Control & Ceiling Tests**:
   - Role ceiling enforcement ensuring `subscription:manage` and `subscription:read` can never be granted to non-owner roles.
3. **Webhook Security & Signature Tests**:
   - `FlutterwaveSignatureGuard`: Timing-safe `verif-hash` header verification, rejection of malformed/missing hashes, and idempotent event logging.
4. **Tenant Scope & Suspension Guards**:
   - Validating that `SUSPENDED` tenant status blocks operational mutations across factory modules while preserving owner billing recovery.
5. **End-to-End (E2E) Flow Tests**:
   - Simulated complete loop: Checkout initiation -> Mocked Flutterwave redirect -> Callback verification -> Webhook confirmation -> Subscription renewal -> Past-due grace expiration -> Operational lockout.

---

## 2. Proposed Test Locations

```text
apps/api/
├── src/
│   ├── subscriptions/
│   │   ├── subscriptions.service.spec.ts             # Checkout, verification, lifecycle logic
│   │   ├── flutterwave.service.spec.ts               # Flutterwave HTTP client and error mapping
│   │   └── subscriptions.controller.spec.ts          # Endpoint parameter validation and mapping
│   ├── webhooks/
│   │   ├── flutterwave-webhook.controller.spec.ts    # Webhook ingestion & background dispatch
│   │   └── flutterwave-signature.guard.spec.ts       # TimingSafeEqual signature verification
│   └── access-control/
│       └── subscription-permission-ceilings.spec.ts  # OWNER-only ceiling verification
└── test/
    └── subscriptions-e2e.spec.ts                     # Full checkout, verification & webhook flow
```

---

## 3. Test Suites and Scenarios

### 3.1 Unit: Flutterwave Client Service (`flutterwave.service.spec.ts`)

- **TEST-SUB-FLW-001 — Successful Checkout Session Creation**:
  - _Precondition_: Valid `FLW_SECRET_KEY` configured in environment.
  - _Input_: Payload with `tx_ref`, `amount: 15000`, `currency: 'NGN'`, `redirect_url`, `customer`.
  - _Expected_: Sends `POST /payments` with Bearer auth; returns parsed `data.link`.
- **TEST-SUB-FLW-002 — Flutterwave API Error Handling**:
  - _Precondition_: Flutterwave returns HTTP 400 or `{ status: 'error', message: 'Invalid currency' }`.
  - _Expected_: Throws typed `FlutterwaveApiError` with status code 400 and diagnostic message.
- **TEST-SUB-FLW-003 — Transaction Verification Query**:
  - _Precondition_: Valid transaction ID `987654`.
  - _Expected_: Sends `GET /transactions/987654/verify`; parses and returns verification details.
- **TEST-SUB-FLW-004 — Request Timeout Resilience**:
  - _Precondition_: Flutterwave server hangs longer than configured timeout.
  - _Expected_: Gracefully aborts and raises typed timeout exception.

---

### 3.2 Unit: Subscription Service & Lifecycle (`subscriptions.service.spec.ts`)

- **TEST-SUB-SVC-001 — Plan Catalog Retrieval**:
  - _Input_: Request for available plans for a tenant.
  - _Expected_: Returns all active plans matching tenant currency, ordered by price.
- **TEST-SUB-SVC-002 — Checkout Initiation & Pending Invoice Creation**:
  - _Input_: Owner requests checkout for plan `STARTER_MONTHLY`.
  - _Expected_: Inserts `subscription_invoices` with status `PENDING` and deterministic `tx_ref` matching `SUB-{tenantId}-{planCode}-{timestamp}`; calls Flutterwave checkout.
- **TEST-SUB-SVC-003 — Server-Side Verification Success**:
  - _Input_: `verifyTransaction(transactionId, txRef)` matching local pending invoice.
  - _Precondition_: Flutterwave returns status `'successful'`, matching amount and currency.
  - _Expected_: Atomically marks invoice `PAID`, updates `tenant_subscriptions` to `ACTIVE`, sets `currentPeriodEnd = now() + 30 days`, syncs `tenants.subscriptionTier`, and logs audit event.
- **TEST-SUB-SVC-004 — Verification Tamper Rejection (Amount/Currency Mismatch)**:
  - _Precondition_: Flutterwave returns amount less than invoice requirement or different currency.
  - _Expected_: Rejects activation, transitions invoice to `FAILED`, raises `PAYMENT_VERIFICATION_FAILED`, and emits security audit event.
- **TEST-SUB-SVC-005 — Grace Period Expiry & Soft Suspension**:
  - _Precondition_: Subscription renewal failed; tenant in `PAST_DUE` with `gracePeriodEnd < now()`.
  - _Expected_: Updates `tenant_subscriptions.status = 'SUSPENDED'` and `tenants.status = 'SUSPENDED'`.

---

### 3.3 Security: Access Control & Ceilings (`subscription-permission-ceilings.spec.ts`)

- **TEST-SUB-SEC-001 — Owner-Only Ceiling Verification**:
  - _Assertion_: `subscription:manage` and `subscription:read` exist in `ROLE_CEILINGS.OWNER`.
  - _Assertion_: Neither permission exists in `ROLE_CEILINGS.MANAGER`, `ROLE_CEILINGS.CASHIER`, `ROLE_CEILINGS.PRODUCTION_SUPERVISOR`, or `ROLE_CEILINGS.DISPATCH_OFFICER`.
- **TEST-SUB-SEC-002 — Non-Owner Role Assignment Rejection**:
  - _Input_: Attempt to create or update a dynamic role with `subscription:manage`.
  - _Expected_: Rejected with `ROLE_CEILINGS_EXCEEDED` / `ROLE_ASSIGNMENT_FORBIDDEN`.
- **TEST-SUB-SEC-003 — Route Authorization Protection**:
  - _Input_: User with `MANAGER` role invokes `POST /subscriptions/checkout`.
  - _Expected_: HTTP 403 Forbidden with `SCOPE_FORBIDDEN`.

---

### 3.4 Webhook Ingestion & Signature Verification (`flutterwave-webhook.controller.spec.ts`)

- **TEST-SUB-WHK-001 — Valid Signature Acceptance**:
  - _Input_: `POST /webhooks/flutterwave` with header `verif-hash` exactly matching `FLW_WEBHOOK_HASH`.
  - _Expected_: Responds HTTP 200 `{ status: 'acknowledged' }` immediately; persists record to `payment_webhook_events`.
- **TEST-SUB-WHK-002 — Invalid or Missing Signature Rejection**:
  - _Input_: Webhook request with invalid or omitted `verif-hash`.
  - _Expected_: HTTP 403 Forbidden; does not process event.
- **TEST-SUB-WHK-003 — Webhook Deduplication / Idempotency**:
  - _Input_: Duplicate webhook delivery with identical `event_id` and `tx_ref`.
  - _Expected_: Acknowledges HTTP 200 but ignores duplicate execution without double-crediting period.
- **TEST-SUB-WHK-004 — Renewal Charge Completed Event (`charge.completed`)**:
  - _Input_: Webhook payload for successful recurring charge.
  - _Expected_: Triggers background verification, extends `currentPeriodEnd`, and logs renewal audit event.

---

### 3.5 Automated End-to-End (E2E) Test Suite (`subscriptions-e2e.spec.ts`)

- **TEST-SUB-E2E-001 — Plan Catalog & Current Subscription Discovery**:
  - _Step 1_: Authenticate as organization owner and call `GET /subscriptions/current`.
  - _Step 2_: Assert initial trial state (`TRIALING`), trial expiration timestamp, and default quota limits.
  - _Step 3_: Call `GET /subscriptions/plans`; assert returned plans match tenant currency and feature limits.
  - _Step 4_: Attempt to call `GET /subscriptions/plans` as non-owner role (`MANAGER`, `CASHIER`); assert proper role scoping rules.
- **TEST-SUB-E2E-002 — Plan Selection & Checkout Initiation**:
  - _Step 1_: Owner calls `POST /subscriptions/checkout` with `planId` and interval (`MONTHLY`).
  - _Step 2_: Assert creation of a pending record in `subscription_invoices` with unique deterministic `tx_ref` (`SUB-{tenantId}-{planCode}-{timestamp}`).
  - _Step 3_: Assert response returns valid Flutterwave checkout URL (`paymentLink`) and `tx_ref`.
- **TEST-SUB-E2E-003 — Payment Callback & Zero-Trust Verification Loop**:
  - _Step 1_: Simulate client receiving redirect from Flutterwave with `transaction_id=123456&tx_ref=SUB-...`.
  - _Step 2_: Client calls `GET /subscriptions/verify?transaction_id=123456&tx_ref=...`.
  - _Step 3_: Verify mock Flutterwave server receives verification call (`GET /transactions/123456/verify`).
  - _Step 4_: Assert invoice status updates to `PAID`, tenant status updates to `ACTIVE`, and audit ledger records `TENANT_SUBSCRIPTION_ACTIVATED`.
- **TEST-SUB-E2E-004 — Webhook Delivery & Recurring Subscription Renewal**:
  - _Step 1_: Simulate incoming Flutterwave webhook (`POST /webhooks/flutterwave`) with valid `verif-hash` header and `charge.completed` event.
  - _Step 2_: Assert immediate HTTP 200 `{ status: 'acknowledged' }` response within 5 seconds.
  - _Step 3_: Assert event is recorded in `payment_webhook_events` with status `PROCESSED`.
  - _Step 4_: Assert tenant's `currentPeriodEnd` is extended by 30 days and invoice history is updated.
- **TEST-SUB-E2E-005 — Subscription Renewal Failure & Grace Period Behavior**:
  - _Step 1_: Simulate subscription expiration / failed renewal webhook (`charge.failed`).
  - _Step 2_: Assert tenant transitions to `PAST_DUE` with `gracePeriodEnd = now() + 7 days`.
  - _Step 3_: Verify that operational mutations (creating catalog items, recording production batches, sealing shifts) continue to succeed during the grace period.
- **TEST-SUB-E2E-006 — Grace Period Expiration, Operational Lockout & Owner Reactivation**:
  - _Step 1_: Simulate time advancing past the 7-day grace period (`now() > gracePeriodEnd`).
  - _Step 2_: Trigger grace evaluation worker; assert `tenant_subscriptions.status = 'SUSPENDED'` and `tenants.status = 'SUSPENDED'`.
  - _Step 3_: Attempt operational mutation (`POST /catalog/items`, `POST /orders`); assert HTTP 403 `ACTIVE_TENANT_REQUIRED`.
  - _Step 4_: As owner, initiate recovery checkout (`POST /subscriptions/checkout`) and execute verification (`GET /subscriptions/verify`).
  - _Step 5_: Assert tenant transitions back to `ACTIVE` and operational mutations are restored immediately.
