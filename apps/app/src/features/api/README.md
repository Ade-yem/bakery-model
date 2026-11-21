# Cadence API integration

API origin: `https://cadence-api-4gni.onrender.com`.

The application uses cookie authentication through same-origin `/api` requests. Vite development/production-serving proxies and the Vercel rewrite forward these requests to the supplied Render API. Cookie credentials are included; tokens returned by Better Auth are discarded rather than stored or copied into authorization headers. The static offline worker never caches API/authentication requests.

Development uses the supplied API by default. To use another approved backend locally, set `CADENCE_API_ORIGIN` in an ignored app environment file. This server-side proxy setting is not a browser credential. No manifest or lockfile changes are required.

## Connected journeys

- Email/password sign-in, verified cookie session discovery, `/api/v1/me`, server sign-out and account registration.
- Registration and business creation are separate operations. The authenticated setup page posts the actual business name to `/api/v1/tenants`; it does not claim a business was created after identity signup alone. An uncertain write is not retried automatically.
- Active branch/department discovery and server-validated workspace selection. Remembered selectors contain IDs only and are revalidated against the current identity, active membership, directory and scope guard. They cannot authenticate a user or grant permissions.
- Department-appropriate item directories. Production and Procurement see raw-material catalogue fields; Reception and Dispatch see finished goods. Prices are shown only in Reception with the explicit price-read permission.
- Procurement supplier directory/creation and Reception customer directory/creation, gated by the actual canonical permission keys. Contact fields require their field-level permission; requests never fetch other departments' private directories.
- Loading, empty, denied, expired, unavailable, conflict and unconfirmed-result states. Inputs remain in failed forms; writes are never automatically retried. Decimal API amounts remain strings in these read-only directories.

The updated main branch's shared UI package and Procurement presentation/domain components are preserved. Runtime preview routes and seed fallback remain removed. Legacy Procurement persistence/fixtures are isolated under its tests and cannot enter the production bundle.

## Verified API limits and team handoff

Checked the local `docs/api` reference and the deployed `/docs/openapi.json` before implementation:

- There are no deployed batch, order/payment, purchase-order, receipt/stock-movement, shift/schedule, handover or operational sync endpoints. Their existing frontend workflow components remain available for later adapters; canonical pages show unavailable states and do not manufacture records, balances, approvals or acknowledgements.
- The current `/me` response supplies a primary active context and canonical baseline permissions, but no complete selected-tenant effective grants or assigned branch/department list. The frontend supports its primary active tenant and validates each selected scope through the server. Switching among multiple tenant memberships needs an API that resolves the selected tenant's effective context; no client-side role-to-permission grants are invented.
- `/me` does not supply tenant names or subscription/plan module state. Unknown names remain absent, subscription status is `UNKNOWN`, and no operational entitlements are granted by default. These gates need the team's authoritative context endpoint before transactional workflows are enabled.
- Password-reset email delivery is not configured by the current backend auth service and is absent from the supplied endpoint reference. The reset form explicitly remains unavailable; no reset email is simulated and no undocumented write endpoint is called.
- The deployed frontend origin must be included in Better Auth's trusted origins. The proxy preserves the browser's `Origin`; it does not impersonate the API origin or bypass CSRF checks. Direct cross-site authentication is not assumed to work with the deployed Lax/Strict cookies.

No live test account exists. Verification uses contract tests, isolated browser response interception and public health/anonymous-session/OpenAPI reads. No account, tenant, invitation, email, payment or operational record is created on the live service during these tests. A real account/tenant and the deployed frontend URL are still needed for authenticated release acceptance.

## Contract sources

- Repository: `docs/api/README.md`, `docs/api/auth-endpoints.md`, `docs/api/endpoints.md`.
- Deployed endpoint inventory: https://cadence-api-4gni.onrender.com/docs/openapi.json
- Better Auth cookie/account behavior: https://better-auth.com/docs/basic-usage
- Password reset requires configured delivery: https://better-auth.com/docs/authentication/email-password#request-password-reset
- Vite proxy: https://vite.dev/config/server-options#server-proxy
- Vercel external rewrites: https://vercel.com/docs/routing/rewrites

Authoritative validation, authorization, scope checks and ledger/idempotency rules remain on the API. The client validates response shapes and context boundaries before displaying data; it never imports API implementation or database code.
