# Live API integration — current work

Implementation remains inside `apps/app`; dependencies, API, shared packages and marketing source are unchanged. The working branch is `codex/integrate-staff-api`, based on updated main. Earlier cleanup and the colleague's Procurement components are reconciled.

- [x] Read `docs/api` and compare with deployed OpenAPI and public health/session endpoints.
- [x] Cookie credential transport, safe errors, timeout/cancellation and explicit scope headers.
- [x] Same-origin Vite and Vercel proxy to the supplied Render API.
- [x] Real sign-in/session discovery, `/me`, logout, signup and separate business onboarding.
- [x] Server-validated workspace selection without client-created grants or auth tokens.
- [x] Authorized catalogue, supplier and customer directories and supported supplier/customer entry.
- [x] Preserve shared UI and Procurement components; exclude legacy fixtures from runtime.
- [x] Final contract, browser, typecheck, lint and production-build verification.
- [ ] Authenticated acceptance with a real test account and deployed frontend origin — no account provided.
- [ ] Team: transactional endpoints for batches, orders/payments, purchase orders, receipts, stock movements, shifts, handovers and sync.
- [ ] Team: full effective selected-tenant context, plan entitlements and password-reset delivery.

Verified on 2026-11-21: 222 tests across 32 files passed; TypeScript, Oxlint, production build, scoped formatting and whitespace checks passed. Isolated Chromium checks passed for sign-in/logout, server-validated selection, all four department directories, supplier/customer entry, failed writes with retained input, onboarding recovery without duplicate submission, and authentication layouts at 320/768/1024/1440 pixels. No uncaught page errors occurred. Public checks confirmed API readiness, anonymous session `null` and `/me` returning `401 AUTH_REQUIRED`. No live writes were made; authenticated acceptance remains unverified without a real test account.

See `src/features/api/README.md` for coverage, limits and sources.

## Previous cleanup record

# Cadence frontend checklist

All implementation changes stay inside `apps/app`. Marketing, dependency declarations and the root lockfile are unchanged.

## Approved runtime cleanup

- [x] Pull `frontend` and audit the current implementation before editing.
- [x] Remove runtime demo authentication, fixed credentials and incoming password verification.
- [x] Replace fabricated registration/reset success with awaited adapter outcomes.
- [x] Require explicit session identity, department assignments, plan modules and permissions; no fallback grants.
- [x] Remove seeded batches, tasks, orders, payments, transfers, suppliers, materials and receipts from runtime.
- [x] Replace fixed staff profiles, schedules, greetings, branch details and opening balances.
- [x] Prepare typed authentication, department snapshot, mutation and sync boundaries for team integration.
- [x] Preserve workflow components, exact calculations, validation, independent counts and role boundaries.
- [x] Preserve existing device records without loading or attributing them to live tenants.
- [x] Namespace new drafts by tenant, branch, staff, shift and workflow.
- [x] Remove unused starter graphics, icon sprite, Switzer fonts and unused background classes.
- [x] Keep all sample data in test-only fixtures; no preview route or runtime fallback.
- [x] Final typecheck, linter, production build, tests, formatting and browser verification.

## Staff workflow UI retained

- [x] Shared responsive shell, canonical routes, assigned navigation and sign-out error handling.
- [x] Production: assigned tasks, batch form/drafts, records, receiving results and history.
- [x] Reception: order entry, split tender validation, additional payments, explicit push, customers, credit and repayment ledger.
- [x] Disbursement: incoming counts, pushed-order fulfillment, multi-product stock validation and physical counts.
- [x] Procurement: supplier/material selection, multi-line receipts, exact totals, draft recovery, records and history.
- [x] Assigned profiles and schedules, including explicit empty schedule states.
- [x] Dual-person handover UI with signed-in incoming identity and preserved variance evidence.
- [x] Loading, unavailable, empty, error, denied, expired and plan-gated states.
- [x] Pending-work/conflict views accept actual scoped metadata; unknown status is not reported as zero.
- [x] Static app-shell offline caching retained; no operational/offline synchronization success is assumed.

## Live integration — status at previous cleanup

- [ ] Authenticated session, sign-in, registration, password reset and logout adapter.
- [ ] Server-enforced tenant, branch, department, role and field-level authorization.
- [ ] Role-scoped catalogues, records, schedules, shift identity and verified opening balances.
- [ ] Atomic/idempotent orders, payments, receipts, acceptance, fulfillment and repayment endpoints.
- [ ] Canonical handover sealing, distinct authorized signers and discrepancy outcomes.
- [ ] Durable production repository/outbox, persisted event IDs and concurrency versions.
- [ ] Authenticated sync, server acknowledgements, retained conflicts and shared-device/logout policy.
- [ ] Approved migration/archive policy for legacy unscoped browser evidence.
- [ ] End-to-end acceptance against actual team services.

There are no development credentials. At the time of cleanup, sign-in and protected workspaces were unavailable pending adapters. The current integration status is recorded at the top of this file; live transactional operations remain pending team contracts. See `src/features/integration/README.md` for the handoff.

## 2. Super Admin

- [ ] Platform overview
- [ ] Businesses list
- [ ] Business details and account status
- [ ] Subscription plans list
- [ ] Create/edit plan, modules and limits
- [ ] Subscriptions list
- [ ] Subscription details and renewal history
- [ ] Client Admin accounts
- [ ] Platform settings
- [ ] Platform audit and activity

## 3. Client Admin

- [ ] Business overview
- [ ] Business profile
- [ ] Branches list and details — conditional on MVP and entitlement
- [ ] Create/edit branch — conditional on MVP and entitlement
- [ ] Departments list
- [ ] Create/edit department
- [ ] Department duties, modules and permission configuration
- [ ] Staff list
- [ ] Staff profile and create/edit forms
- [ ] Staff department and role assignments
- [ ] Roles and permissions
- [ ] Shift schedule
- [ ] Shift creation and staff assignments
- [ ] Rotation configuration and conflict review
- [ ] Business settings
- [ ] Reports
- [ ] Business records and activity history

## 4. Operational modules — confirm release scope and contracts

- [ ] Product/item catalogue
- [ ] Stock balances
- [ ] Inventory movement history
- [ ] Suppliers
- [ ] Procurement receipts and entry
- [ ] Petty-cash expenses and approval
- [ ] Production batches and entry
- [ ] Incoming transfers and physical acceptance
- [ ] Customers
- [ ] Orders list and order entry
- [ ] Split payment recording
- [ ] Manual push to Disbursement
- [ ] Customer credit and repayment history
- [ ] Fulfillment queue and confirmation
- [ ] Shift opening balances
- [ ] Closing counts and outgoing handover
- [ ] Incoming handover review and co-sign
- [ ] Reconciliation details
- [ ] Incidents and discrepancy resolution
- [ ] Attendance
- [ ] Owner analytics
- [ ] Source-backed insights
- [ ] Sync queue
- [ ] Conflict review

## Verification results

Verified on 21 November 2026 using Node 22.23.1 and the installed pnpm (package-manager auto-install disabled for the protected home directory).

- [x] `pnpm --filter @repo/app exec tsc -b` — passed.
- [x] `pnpm --filter @repo/app lint` — passed with no warnings.
- [x] `pnpm --filter @repo/app test` — 25 files / 163 tests passed; no skipped tests.
- [x] `pnpm --filter @repo/app build` — passed (includes TypeScript build).
- [x] Prettier check for changed/new app text files and `git diff --check` — passed.
- [x] Runtime import graph excludes test fixtures, removed mock modules and the read-only legacy recovery parser.
- [x] Built JavaScript excludes the former demo credentials, staff identities, named seed records and fixed branch data.
- [x] Isolated Chromium: auth unavailable states and no horizontal overflow at 320/768/1024/1440 pixels; all four department page groups with test-only adapters; empty catalogues; stock opening values; loading errors; retained input after rejected submission; unchanged retry IDs; rejected sign-in/registration/password reset without fabricated success. No uncaught page errors observed.
- [x] Changes remain within `apps/app`; marketing, dependency manifests and root lockfile are unchanged.

Browser tests used isolated test adapters, not live team services. Live API integration and operational offline synchronization remain unchecked above. No deployment was performed. Publication of this cleanup is recorded in Git history.

`CHECKLIST.md` is explicitly included in this cleanup commit so progress tracking is available remotely; root ignore configuration is unchanged.
