# Live API integration

Scope: `apps/app` only, on `codex/integrate-staff-api`, based on updated main. Preserve the pushed cleanup and colleague Procurement UI; keep dependency manifests, marketing, API and shared packages unchanged.

1. Reconcile the staff cleanup with shared UI package changes and the new Procurement screens. Remove active preview routes and seed fallbacks.
2. Add a typed fetch client with safe errors, cancellation, explicit scope headers and cookie credentials. Proxy `/api` to the supplied Render origin in development and deployment so sessions are first-party.
3. Wire sign-in, session discovery, logout, account registration and business onboarding to documented endpoints. Resolve identity from `/me`; never invent permissions, assignments or subscriptions.
4. Let authenticated staff select a server-validated branch/department context. Wire authorized item, supplier and customer directories and supported create forms. Keep unsupported stock/order/production/PO/receipt/handover/schedule operations explicitly unavailable while retaining workflow components.
5. Verify transport and response mapping with contract tests, browser tests using isolated intercepted responses, public health/session/CORS checks, typecheck, lint and production build.

Endpoint coverage was checked against `docs/api` and the deployed OpenAPI specification. No live test account exists; no live account, tenant, message, payment or operational record will be created for verification.

Team dependencies: missing operational endpoints; effective assigned branch/department context and selected-tenant `/me` behavior; password-reset delivery is not configured by the current backend; deployed frontend origin must be trusted by Better Auth.

Track progress and verification in `apps/app/CHECKLIST.md`.
