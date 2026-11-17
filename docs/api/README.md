# TallyBakery REST API Documentation

Welcome to the TallyBakery REST API documentation. TallyBakery is a multi-tenant, offline-first operations and reconciliation platform designed for shift-based commercial bakeries and food manufacturing facilities.

The API exposes endpoints for identity management, business onboarding, physical branch tracking, dynamic factory departments, role-based access control with hard ceilings, master catalog items, customer credit limits, supplier records, audit ledgers, and Flutterwave subscription billing.

---

## 1. Base URL & Versioning

The API uses URI path versioning with an `api/v1` prefix for all operational business routes, while authentication endpoints adhere to the Better-Auth standard `/api/auth` path prefix.

| Environment                   | Base URL                                  |
| :---------------------------- | :---------------------------------------- |
| **Local Development**         | `http://localhost:3000`                   |
| **API Root**                  | `http://localhost:3000/api/v1`            |
| **Authentication Engine**     | `http://localhost:3000/api/auth`          |
| **Interactive Swagger UI**    | `http://localhost:3000/docs`              |
| **OpenAPI 3.0 Specification** | `http://localhost:3000/docs/openapi.json` |

---

## 2. Authentication & Session Management

TallyBakery uses cookie-based session authentication powered by Better-Auth.

- **Session Cookie**: `better-auth.session_token` (HTTP-only, Secure in production, SameSite=Lax/Strict).
- State-changing endpoints require requests to originate from trusted origins (`TRUSTED_ORIGINS`).
- When making cross-origin requests, include `credentials: 'include'` (browser fetch) or forward the `Cookie` header (mobile/server clients).

---

## 3. Multi-Tenancy & Context Headers

Protected endpoints are guarded by `TenantScopeGuard`. Every operational request resolves an `ActorContext` derived from the user's active tenant membership and optional scope selector headers:

| Header            | Format | Description                                                                                                        |
| :---------------- | :----- | :----------------------------------------------------------------------------------------------------------------- |
| `x-tenant-id`     | UUID   | Resolves which tenant organization the request operates within. Required if the user belongs to multiple bakeries. |
| `x-branch-id`     | UUID   | Optional branch selector. Must be within the caller's assigned branches (or caller is `OWNER`).                    |
| `x-department-id` | UUID   | Optional department selector. Must be an `ACTIVE` department and authorized for the caller's role.                 |

If headers are omitted, the API defaults to the user's primary active membership and assigned branches.

---

## 4. Standard Error Taxonomy

Errors conform to the `@repo/shared` contract and return a consistent JSON payload:

```json
{
  "code": "ACTIVE_TENANT_REQUIRED",
  "message": "No active tenant membership found for caller",
  "requestId": "req_01h8x9p3...",
  "details": {}
}
```

### Standard Error Codes

| Error Code                  | HTTP Status | Meaning                                                                                      |
| :-------------------------- | :---------- | :------------------------------------------------------------------------------------------- |
| `AUTH_REQUIRED`             | 401         | Missing or invalid session token. User must sign in.                                         |
| `ACTIVE_TENANT_REQUIRED`    | 403         | Caller does not possess an active membership in the specified tenant.                        |
| `SCOPE_FORBIDDEN`           | 403         | Branch or department selector is outside the caller's authorized scope.                      |
| `ROLE_ASSIGNMENT_FORBIDDEN` | 403         | Assigned custom permissions exceed the role ceiling, or role is unauthorized for department. |
| `LAST_OWNER_REQUIRED`       | 400 / 403   | Invariant breach: Cannot deactivate or delete the last active `OWNER` of a tenant.           |
| `CONFLICT`                  | 409         | Unique constraint violation (e.g. duplicate branch code, role code, or item SKU).            |
| `RESOURCE_NOT_FOUND`        | 404         | Entity ID does not exist within the caller's tenant boundary.                                |
| `VALIDATION_FAILED`         | 400         | Payload failed schema validation (class-validator / DTO constraint).                         |

---

## 5. Module Index

Detailed endpoint references with request and response payloads with examples are available in [endpoints.md](./endpoints.md):

1. **[General & Health](./endpoints.md#1-general--health)**: API greeting and liveness/readiness probes.
2. **[Identity & Scope Discovery](./endpoints.md#2-identity--me)**: User profile, memberships, and active context.
3. **[Tenants & Onboarding](./endpoints.md#3-tenants--onboarding)**: Business onboarding, default department & role seeding.
4. **[Branches](./endpoints.md#4-branches)**: Physical bakery locations and timezone settings.
5. **[Departments](./endpoints.md#5-departments)**: Reception, Production, Dispatch, Store, and custom departments.
6. **[Staff Administration](./endpoints.md#6-staff-administration)**: Invitations, role/department assignments, status, and removal.
7. **[Access Control & Roles](./endpoints.md#7-access-control--roles)**: Permission discovery, custom role creation, cloning, and department mapping.
8. **[Catalog Items](./endpoints.md#8-catalog-items)**: Raw materials, finished goods, and packaging items.
9. **[Customers](./endpoints.md#9-customers)**: Customer profiles, contact details, and credit ceilings.
10. **[Suppliers](./endpoints.md#10-suppliers)**: Raw material vendors and contact references.
11. **[Audit Logs](./endpoints.md#11-audit-logs)**: Append-only chronological operational audit trail.
12. **[Subscriptions & Billing](./endpoints.md#12-subscriptions--billing)**: Plans, Flutterwave checkout, verification, and invoices.
13. **[Webhooks](./endpoints.md#13-webhooks)**: Flutterwave asynchronous event webhook ingestion.
