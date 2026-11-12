# Tasks: Tenant Subscription Billing & Flutterwave Integration

## Module Overview

This task list implements the complete, production-ready tenant subscription billing engine using Flutterwave for TallyBakery. It covers plan catalogs, hosted checkout sessions, server-side zero-trust transaction verification, timing-safe webhook ingestion, lifecycle state machine (`TRIALING`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `CANCELED`), 7-day grace periods, and owner-only access controls.

- Requirements: [requirements.md](./requirements.md)
- Design: [design.md](./design.md)
- Test Spec: [test-spec.md](./test-spec.md)
- Flutterwave Skill Reference: [.agents/skills/flutterwave/SKILL.md](../../.agents/skills/flutterwave/SKILL.md)
- Project Guidelines: [AGENTS.md](../../AGENTS.md) & [guide.md](../../.agents/rules/guide.md)

> Under the strict test-first protocol (TDD), tests must be written, presented to the user for alignment, and verified passing at each step before progressing.

---

## Task List

### 1. Baseline and Architecture Decisions

- [ ] 1.1 Review existing `tenants` schema (`subscriptionTier`, `subscriptionStatus`) in `apps/api/src/database/schema/tenancy.schema.ts` and identify required schema extensions.
- [ ] 1.2 Verify Flutterwave API environment configuration (`FLW_SECRET_KEY`, `FLW_WEBHOOK_HASH`, `FLW_V3_BASE_URL`) in `apps/api/src/config/environment.ts`.
- [ ] 1.3 Add subscription permission definitions (`subscription:read`, `subscription:manage`) to `VALID_PERMISSIONS` and enforce immutable `ROLE_CEILINGS.OWNER` inclusion in `apps/api/src/access-control/permissions.ts`.
- [ ] 1.4 Write ceiling unit tests (`subscription-permission-ceilings.spec.ts`) asserting that non-owner roles cannot hold subscription permissions. **(User Confirmation Gate)**

### 2. Contracts and Data Models

- [ ] 2.1 Add shared subscription enums, DTOs, and error codes (`SUBSCRIPTION_TIERS`, `SUBSCRIPTION_STATUSES`, `BILLING_INTERVALS`, `CreateCheckoutDto`, `SubscriptionPlanDto`, `PAYMENT_VERIFICATION_FAILED`) in `packages/shared/src/index.ts`.
- [ ] 2.2 Author Drizzle ORM subscription database schema in `apps/api/src/database/schema/subscription.schema.ts`:
  - `subscription_plans` (catalog of plans, quotas, pricing)
  - `tenant_subscriptions` (current active subscription, periods, tokens)
  - `subscription_invoices` (billing transactions, `tx_ref`, amounts, receipts)
  - `payment_webhook_events` (idempotent webhook event ledger)
- [ ] 2.3 Export subscription schemas in `apps/api/src/database/schema/index.ts` and generate Drizzle database migration.
- [ ] 2.4 Seed starter subscription plans (`STARTER_MONTHLY`, `STARTER_YEARLY`, `GROWTH_MONTHLY`, `GROWTH_YEARLY`, `ENTERPRISE_MONTHLY`) for testing.

### 3. Service Layer and Business Logic (TDD)

- [ ] 3.1 Write unit tests for `FlutterwaveService` in `apps/api/src/subscriptions/flutterwave.service.spec.ts` covering checkout generation, verification queries, error wrapping, and timeouts.
- [ ] 3.2 Implement `FlutterwaveService` in `apps/api/src/subscriptions/flutterwave.service.ts` wrapping Flutterwave v3 Hosted Checkout (`POST /payments`) and verification (`GET /transactions/{id}/verify`) with comprehensive JSDocs.
- [ ] 3.3 Write unit tests for `SubscriptionsService` in `apps/api/src/subscriptions/subscriptions.service.spec.ts` covering checkout initiation, zero-trust verification, tamper detection, grace period calculation, and cancellation.
- [ ] 3.4 Implement `SubscriptionsService` in `apps/api/src/subscriptions/subscriptions.service.ts` integrating `FlutterwaveService`, `AuditService`, and subscription database repositories.
- [ ] 3.5 Run and verify 100% test pass rate for all subscription service unit tests.

### 4. API & Integration Boundary

- [ ] 4.1 Write controller unit and integration tests for `SubscriptionsController` (`GET /subscriptions/plans`, `GET /subscriptions/current`, `POST /subscriptions/checkout`, `GET /subscriptions/verify`, `POST /subscriptions/cancel`).
- [ ] 4.2 Implement `SubscriptionsController` with `@RequirePermission`, `SessionGuard`, `TenantScopeGuard`, and input validation DTOs.
- [ ] 4.3 Write tests for `FlutterwaveSignatureGuard` verifying `verif-hash` with `crypto.timingSafeEqual`.
- [ ] 4.4 Implement `FlutterwaveWebhookController` (`POST /webhooks/flutterwave`) delivering immediate HTTP 200 acknowledgement, raw payload persistence in `payment_webhook_events`, and asynchronous event processing.
- [ ] 4.5 Update `TenantScopeGuard` to block operational writes (`POST`, `PUT`, `PATCH`, `DELETE`) with `ACTIVE_TENANT_REQUIRED` when `tenants.status === 'SUSPENDED'`, while exempting subscription recovery routes.

### 5. Automated End-to-End (E2E) Test Suite (Client Flows & Lifecycle)

- [ ] 5.1 E2E Test (`TEST-SUB-E2E-001`): Owner subscription status and plan catalog discovery flow (`GET /subscriptions/current`, `GET /subscriptions/plans`), asserting currency matching, plan allowances, and non-owner access rejection.
- [ ] 5.2 E2E Test (`TEST-SUB-E2E-002`): Checkout initiation and Flutterwave hosted URL generation flow (`POST /subscriptions/checkout`), asserting pending invoice creation and collision-proof `tx_ref`.
- [ ] 5.3 E2E Test (`TEST-SUB-E2E-003`): Client payment callback and server-to-server zero-trust verification flow (`GET /subscriptions/verify`), asserting atomic transition to `ACTIVE`, invoice settlement, and audit logging.
- [ ] 5.4 E2E Test (`TEST-SUB-E2E-004`): Flutterwave webhook ingestion and recurring renewal flow (`POST /webhooks/flutterwave`), asserting timing-safe signature check, immediate HTTP 200 acknowledgement, and period extension.
- [ ] 5.5 E2E Test (`TEST-SUB-E2E-005`): Subscription renewal failure and 7-day grace period behavior, asserting that operational factory writes remain permitted while tenant is in `PAST_DUE`.
- [ ] 5.6 E2E Test (`TEST-SUB-E2E-006`): Grace period expiration, operational mutation lockout (asserting `ACTIVE_TENANT_REQUIRED` on catalog, production, dispatch, and shifts), and one-click owner reactivation checkout flow.

### 6. Workspace Verification, CI Checks & Documentation

- [ ] 6.1 Execute the complete automated E2E test suite in `apps/api/test/subscriptions-e2e.spec.ts` ensuring all scenarios pass with zero failures.
- [ ] 6.2 Execute full workspace validation: `pnpm --filter @repo/shared build`, `pnpm --filter @repo/api test`, `pnpm --filter @repo/api lint`, `pnpm lint`.
- [ ] 6.3 Update `docs/tasks.md` and architecture documentation with verified E2E outcomes.

---

## Acceptance Gate

The subscription module is considered complete and production-ready only when:

1. 100% of unit, integration, and security ceiling tests pass with zero failures.
2. An owner can initiate a checkout, complete payment in Flutterwave sandbox, and have their account automatically verified and activated server-side.
3. Webhook calls with invalid `verif-hash` are rejected with HTTP 403, and valid events are acknowledged within 5 seconds and processed idempotently.
4. Non-owner staff are strictly prevented from viewing or modifying subscription billing.
5. Soft tenant suspension correctly prevents operational writes while preserving owner billing recovery.
