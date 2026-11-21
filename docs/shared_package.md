# Shared Package (`@repo/shared`)

## Overview

The `@repo/shared` package contains client-safe TypeScript types, DTO contracts, enum definitions, error codes, and pagination models shared across the TallyBakery workspace (`apps/app`, `apps/marketing`, `apps/api`, etc.).

### Invariant & Boundary Rules

1. **Browser and Client Safe**: No server-only dependencies, ORM internals (such as Drizzle table definitions), Node.js system libraries, database drivers (`pg`), or environment/secret access logic must enter `packages/shared`.
2. **Deterministic & Strongly Typed**: All contracts define explicit string unions, enums, and typed structures to guarantee contract symmetry between the NestJS backend and the Vite/React frontend.

---

## Exported Members & Usage Guide

### 1. Standard Error Taxonomy

#### `ERROR_CODES` & `ErrorCode`
- **Definition**: Constant dictionary and union type containing all stable Week 1 error codes.
- **Where to use**:
  - **API**: In exception filters, controllers, and domain services when throwing `HttpException` or building error responses.
  - **Client**: In API clients, interceptors, and error handlers to handle specific error conditions programmatically (e.g. checking `res.code === ERROR_CODES.AUTH_REQUIRED` to trigger redirect to sign in).
- **Codes included**:
  - `VALIDATION_FAILED`: Request payload failed schema or type validation.
  - `AUTH_REQUIRED`: Unauthenticated access to a protected route.
  - `SESSION_INVALID`: Session expired, revoked, or invalid.
  - `ACTIVE_TENANT_REQUIRED`: Tenant scope header or selection is missing.
  - `SCOPE_FORBIDDEN`: User lacks access to the requested branch, department, or role boundary.
  - `RESOURCE_NOT_FOUND`: The requested entity does not exist within the caller's tenant boundary.
  - `CONFLICT`: Unique constraint or entity state violation.
  - `IDEMPOTENCY_KEY_REUSED`: An idempotency key was re-used with mismatched request parameters.
  - `INVALID_STATUS_TRANSITION`: State machine transition is disallowed (e.g., modifying an archived record).
  - `LAST_OWNER_REQUIRED`: Attempted to remove or suspend the final active Owner of a tenant.
  - `ROLE_ASSIGNMENT_FORBIDDEN`: Attempted role escalation (e.g., Manager assigning Owner).
  - `UNKNOWN_PERMISSION`: Unrecognized permission requested or checked.
  - `DEPENDENCY_UNAVAILABLE`: External dependency / database service unavailable.
  - `INTERNAL_ERROR`: Unexpected internal server exception.

#### `StandardErrorResponse`
- **Definition**: Envelope for all non-2xx responses returned by the API.
  ```ts
  interface StandardErrorResponse {
    code: string;
    message: string;
    requestId: string;
    details?: Record<string, unknown> | Array<unknown>;
  }
  ```
- **Where to use**:
  - **API**: Implemented by `GlobalExceptionFilter` in `apps/api`.
  - **Client**: Used by API fetch utilities to parse and type error payloads.

---

### 2. Cursor Pagination Contracts

#### `CursorPageMeta`, `CursorPage<T>`, and `CursorPaginationParams`
- **Definition**: Types and models for bounded cursor-based pagination.
  ```ts
  interface CursorPageMeta {
    limit: number;
    nextCursor: string | null;
  }

  interface CursorPage<T> {
    data: T[];
    page: CursorPageMeta;
  }

  interface CursorPaginationParams {
    limit?: number;
    cursor?: string;
  }
  ```
- **Where to use**:
  - **API**: Query DTOs extending `CursorPaginationParams` and controllers returning `CursorPage<T>`.
  - **Client**: Infinite-scroll hooks, paginated table components, and React Query fetchers.

---

### 3. Role and Status Enums

#### `ROLE_KEYS` & `RoleKey`
- **Definition**: Fixed system roles defining access tiers.
  - `OWNER`: Full tenant administration, role permission configuration, and branch management.
  - `MANAGER`: Branch management and staff access up to Manager ceiling (cannot elevate to Owner).
  - `CASHIER`: Sales, customer orders, and cash register flows.
  - `PRODUCTION`: Bakery production operations; restricted from seeing financial and sales data.
  - `RECEPTION`: Finished-goods reception and transfer acceptance.
  - `DISPATCH`: Raw materials and stock distribution; restricted from financial figures.
- **Where to use**:
  - **API**: Route guards (`RolesGuard`), authorization metadata decorators, and membership services.
  - **Client**: Role-based rendering, route guards, and navigation menu filtering.

#### `STATUS_KEYS` & `StatusKey`
- **Definition**: Entity lifecycle status values:
  - `ACTIVE`: Normal operating state.
  - `INACTIVE`: Deactivated / soft-disabled (no hard deletes).
  - `SUSPENDED`: Suspended tenancy or membership.
  - `INVITED`: Pending staff membership invitation.
- **Where to use**:
  - Status filters in API queries, repository predicates, and UI badge/status chips.

---

### 4. Unit of Measure Allowlist

#### `UOM_KEYS` & `UomKey`
- **Definition**: Approved units of measure for raw materials and items:
  - `EACH`, `GRAM`, `KILOGRAM`, `MILLILITRE`, `LITRE`, `BAG`.
- **Where to use**:
  - Item catalog creation DTOs, recipe formulations, and inventory movement forms.

---

### 5. DTOs and Data Envelopes

#### `UserDto`
- **Definition**: Safe public projection of a user record:
  ```ts
  interface UserDto {
    id: string;
    name: string;
    email: string;
  }
  ```
- **Where to use**:
  - Shared identity representation between `/api/auth` or `/me` endpoints and the frontend user header/profile.

#### `ApiResponse<T>`
- **Definition**: Legacy/general response envelope:
  ```ts
  interface ApiResponse<T> {
    data: T;
    message: string;
    error: string | null;
    success: boolean;
  }
  ```
- **Where to use**:
  - Standard unary responses and action endpoints.

---

## Building and Consuming

To build the shared package:
```bash
pnpm --filter @repo/shared build
```

To import in API or Client apps:
```ts
import {
  ERROR_CODES,
  StandardErrorResponse,
  ROLE_KEYS,
  CursorPage,
} from '@repo/shared';
```
