# TallyBakery Endpoints Reference

This document provides complete request and response specifications with realistic examples for every endpoint exposed by the TallyBakery REST API.

---

## 1. General & Health

### `GET /api/v1`

Returns root service welcome message and confirmation that the API process is running.

- **Authentication**: None
- **Permission**: None
- **Response (200 OK)**:

```text
Hello there 🤗, This is TalleyBakery API service. Welcome 🫡
```

---

### `GET /health/live`

Process liveness probe for container orchestrators (Kubernetes/Podman/Docker).

- **Authentication**: None
- **Permission**: None
- **Response (200 OK)**:

```json
{
  "status": "ok",
  "uptime": 1245.32
}
```

---

### `GET /health/ready`

Database connectivity and readiness probe.

- **Authentication**: None
- **Permission**: None
- **Response (200 OK)**:

```json
{
  "status": "ready",
  "database": "connected"
}
```

- **Error Response (500 Internal Server Error)**:

```json
{
  "status": "error",
  "database": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

---

## 2. Identity & /me

### `GET /api/v1/me`

Resolves the authenticated user identity, active tenant memberships, assigned roles, and effective permission keys.

- **Authentication**: Session Cookie (`better-auth.session_token`)
- **Headers**:
  - `Cookie: better-auth.session_token=<token>`
- **Response (200 OK)**:

```json
{
  "user": {
    "id": "usr_99f8c12a-3341-45bc-a10e-09c3140134a1",
    "email": "owner@artisansourdough.com",
    "name": "Jane Baker"
  },
  "memberships": [
    {
      "id": "mem_55a1234e-0012-45bc-b210-998877665544",
      "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
      "role": "OWNER",
      "status": "ACTIVE"
    }
  ],
  "activeContext": {
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "membershipId": "mem_55a1234e-0012-45bc-b210-998877665544",
    "role": "OWNER",
    "permissions": [
      "tenants:read",
      "tenants:manage",
      "branches:read",
      "branches:manage",
      "departments:read",
      "departments:manage",
      "staff:read",
      "staff:manage",
      "roles:read",
      "roles:manage",
      "items:read",
      "items:manage",
      "customers:read",
      "customers:manage",
      "suppliers:read",
      "suppliers:manage",
      "audit:read"
    ]
  }
}
```

- **Error Response (401 Unauthorized)**:

```json
{
  "code": "AUTH_REQUIRED",
  "message": "Authentication is required",
  "requestId": "req_01h8x9p3...",
  "details": {}
}
```

---

## 3. Tenants & Onboarding

### `POST /api/v1/tenants`

Onboards a new bakery business. Provisions primary branch, seeds baseline departments (`Reception`, `Production`, `Dispatch`, `Store`), default roles (`OWNER`, `MANAGER`, `RECEPTIONIST`, `PRODUCTION_SUPERVISOR`, `DISPATCH_OFFICER`), and creates `OWNER` membership.

- **Authentication**: Session Cookie
- **Permission**: Any authenticated user
- **Request Body**:

```json
{
  "name": "Artisan Sourdough Bakery",
  "branchName": "Downtown Flagship",
  "departmentName": "Bakehouse Floor"
}
```

- **Response (201 Created)**:

```json
{
  "tenant": {
    "id": "ten_77b3456f-1122-45bc-c321-112233445566",
    "name": "Artisan Sourdough Bakery",
    "status": "ACTIVE",
    "subscriptionTier": "STANDARD",
    "subscriptionStatus": "ACTIVE",
    "defaultCurrency": "USD",
    "settings": {},
    "createdAt": "2026-11-12T13:00:00.000Z",
    "updatedAt": "2026-11-12T13:00:00.000Z"
  },
  "branch": {
    "id": "br_123e4567-e89b-12d3-a456-426614174000",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "name": "Downtown Flagship",
    "code": "MAIN",
    "timezone": "UTC",
    "status": "ACTIVE",
    "createdAt": "2026-11-12T13:00:00.000Z",
    "updatedAt": "2026-11-12T13:00:00.000Z"
  },
  "departments": [
    {
      "id": "dept_rec_001",
      "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
      "branchId": "br_123e4567-e89b-12d3-a456-426614174000",
      "name": "Reception",
      "code": "REC",
      "type": "RECEPTION",
      "description": "Customer order entry & cash collection",
      "status": "ACTIVE"
    },
    {
      "id": "dept_prod_002",
      "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
      "branchId": "br_123e4567-e89b-12d3-a456-426614174000",
      "name": "Production",
      "code": "PROD",
      "type": "PRODUCTION",
      "description": "Bakehouse & manufacturing floor",
      "status": "ACTIVE"
    },
    {
      "id": "dept_disp_003",
      "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
      "branchId": "br_123e4567-e89b-12d3-a456-426614174000",
      "name": "Dispatch",
      "code": "DISP",
      "type": "DISPATCH",
      "description": "Finished goods fulfillment & staging",
      "status": "ACTIVE"
    },
    {
      "id": "dept_store_004",
      "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
      "branchId": "br_123e4567-e89b-12d3-a456-426614174000",
      "name": "Store",
      "code": "STORE",
      "type": "STORE",
      "description": "Raw materials & packaging warehouse",
      "status": "ACTIVE"
    }
  ],
  "membership": {
    "id": "mem_55a1234e-0012-45bc-b210-998877665544",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "authUserId": "usr_99f8c12a-3341-45bc-a10e-09c3140134a1",
    "displayName": "Jane Baker",
    "roleKey": "OWNER",
    "status": "ACTIVE"
  }
}
```

---

## 4. Branches

### `GET /api/v1/branches`

Lists all physical branch locations in the tenant.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `branches:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "br_123e4567-e89b-12d3-a456-426614174000",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "name": "Downtown Flagship",
    "code": "MAIN",
    "timezone": "UTC",
    "status": "ACTIVE",
    "createdAt": "2026-11-12T13:00:00.000Z",
    "updatedAt": "2026-11-12T13:00:00.000Z"
  }
]
```

---

### `POST /api/v1/branches`

Creates an additional branch location.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `branches:manage`
- **Request Body**:

```json
{
  "name": "Airport Kiosk",
  "code": "AIR1",
  "timezone": "Africa/Lagos"
}
```

- **Response (201 Created)**:

```json
{
  "id": "br_987fcba9-1122-3344-5566-778899aabbcc",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "name": "Airport Kiosk",
  "code": "AIR1",
  "timezone": "Africa/Lagos",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T13:15:00.000Z",
  "updatedAt": "2026-11-12T13:15:00.000Z"
}
```

- **Error Response (409 Conflict)**:

```json
{
  "statusCode": 409,
  "message": "Branch code already exists",
  "error": "Conflict"
}
```

---

## 5. Departments

### `GET /api/v1/departments`

Lists all departments across branches in the tenant.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `departments:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "dept_rec_001",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "branchId": "br_123e4567-e89b-12d3-a456-426614174000",
    "name": "Reception",
    "code": "REC",
    "type": "RECEPTION",
    "description": "Customer order entry & cash collection",
    "status": "ACTIVE"
  }
]
```

---

### `POST /api/v1/departments`

Creates a new department within a branch.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `departments:manage`
- **Request Body**:

```json
{
  "branchId": "br_987fcba9-1122-3344-5566-778899aabbcc",
  "name": "Specialty Pastry Lab",
  "code": "PASTRY",
  "type": "PRODUCTION",
  "description": "Specialty pastry & artisan confection floor"
}
```

- **Response (201 Created)**:

```json
{
  "id": "dept_pastry_999",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "branchId": "br_987fcba9-1122-3344-5566-778899aabbcc",
  "name": "Specialty Pastry Lab",
  "code": "PASTRY",
  "type": "PRODUCTION",
  "description": "Specialty pastry & artisan confection floor",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T13:20:00.000Z",
  "updatedAt": "2026-11-12T13:20:00.000Z"
}
```

---

### `PATCH /api/v1/departments/:departmentId`

Updates department metadata or operational status (`ACTIVE` / `INACTIVE`).

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `departments:manage`
- **Request Body**:

```json
{
  "status": "INACTIVE"
}
```

- **Response (200 OK)**:

```json
{
  "id": "dept_pastry_999",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "name": "Specialty Pastry Lab",
  "code": "PASTRY",
  "status": "INACTIVE",
  "updatedAt": "2026-11-12T13:25:00.000Z"
}
```

---

## 6. Staff Administration

### `GET /api/v1/staff`

Lists all staff memberships in the tenant.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `staff:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "mem_55a1234e-0012-45bc-b210-998877665544",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "authUserId": "usr_99f8c12a-3341-45bc-a10e-09c3140134a1",
    "displayName": "Jane Baker",
    "roleKey": "OWNER",
    "status": "ACTIVE"
  }
]
```

---

### `POST /api/v1/staff`

Invites or adds a staff member with designated role, branch access, and department access.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `staff:manage`
- **Request Body**:

```json
{
  "authUserId": "usr_cashier_12345",
  "displayName": "Bolu Cashier",
  "roleKey": "RECEPTIONIST",
  "branchIds": ["br_123e4567-e89b-12d3-a456-426614174000"],
  "departmentIds": ["dept_rec_001"],
  "status": "ACTIVE"
}
```

- **Response (201 Created)**:

```json
{
  "id": "mem_cashier_777",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "authUserId": "usr_cashier_12345",
  "displayName": "Bolu Cashier",
  "roleKey": "RECEPTIONIST",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T13:30:00.000Z",
  "updatedAt": "2026-11-12T13:30:00.000Z"
}
```

- **Error Response (400 Bad Request)**:

```json
{
  "statusCode": 400,
  "message": "Cannot assign inactive department to membership: Specialty Pastry Lab",
  "error": "Bad Request"
}
```

---

### `PUT /api/v1/staff/:membershipId/access`

Updates role and branch/department scope assignments with role ceiling validation.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `staff:manage`
- **Request Body**:

```json
{
  "roleKey": "RECEPTIONIST",
  "customPermissions": ["tenants:delete"]
}
```

- **Error Response (403 Forbidden - Role Ceiling Breach)**:

```json
{
  "statusCode": 403,
  "message": "Custom permissions exceed role ceiling: tenants:delete",
  "error": "Forbidden"
}
```

- **Response (200 OK - Valid Update)**:

```json
{
  "id": "mem_cashier_777",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "roleKey": "MANAGER",
  "status": "ACTIVE",
  "updatedAt": "2026-11-12T13:35:00.000Z"
}
```

---

### `PATCH /api/v1/staff/:membershipId/status`

Updates operational status (`ACTIVE`, `SUSPENDED`, `INACTIVE`) with last-owner invariant protection.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `staff:manage`
- **Request Body**:

```json
{
  "status": "INACTIVE"
}
```

- **Response (200 OK)**:

```json
{
  "id": "mem_cashier_777",
  "status": "INACTIVE",
  "updatedAt": "2026-11-12T13:40:00.000Z"
}
```

- **Error Response (400 Bad Request - Last Owner Protection)**:

```json
{
  "statusCode": 400,
  "message": "Cannot deactivate the last active OWNER of the tenant",
  "error": "Bad Request"
}
```

---

### `DELETE /api/v1/staff/:membershipId`

Removes staff membership and cleans up all scope associations atomically.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `staff:manage`
- **Response (200 OK)**:

```json
{
  "id": "mem_cashier_777",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "displayName": "Bolu Cashier",
  "roleKey": "RECEPTIONIST",
  "status": "INACTIVE"
}
```

- **Error Response (400 Bad Request - Last Owner Protection)**:

```json
{
  "statusCode": 400,
  "message": "Cannot remove the last active OWNER of the tenant",
  "error": "Bad Request"
}
```

---

## 7. Access Control & Roles

### `GET /api/v1/permissions`

Returns all canonical fine-grained permission keys supported by the system.

- **Authentication**: Session Cookie
- **Permission**: `roles:read`
- **Response (200 OK)**:

```json
{
  "permissions": [
    "tenants:read",
    "tenants:manage",
    "branches:read",
    "branches:manage",
    "departments:read",
    "departments:manage",
    "staff:read",
    "staff:manage",
    "roles:read",
    "roles:manage",
    "items:read",
    "items:manage",
    "customers:read",
    "customers:manage",
    "suppliers:read",
    "suppliers:manage",
    "audit:read",
    "subscription:read",
    "subscription:manage"
  ]
}
```

---

### `GET /api/v1/roles`

Lists tenant roles with assigned department scopes and permissions.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `roles:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "role_owner_01",
    "code": "OWNER",
    "name": "Super Admin (Owner)",
    "description": "Full organization authority",
    "isSystem": true,
    "status": "ACTIVE",
    "departments": [],
    "permissions": ["tenants:read", "tenants:manage", "staff:manage"]
  },
  {
    "id": "role_rec_02",
    "code": "RECEPTIONIST",
    "name": "Receptionist (Cashier)",
    "description": "Order billing and customer receipts",
    "isSystem": false,
    "status": "ACTIVE",
    "departments": ["dept_rec_001"],
    "permissions": ["customers:read", "orders:read", "orders:create"]
  }
]
```

---

### `POST /api/v1/roles`

Creates a custom dynamic role within the tenant.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `roles:manage`
- **Request Body**:

```json
{
  "code": "HEAD_BAKER",
  "name": "Head Artisan Baker",
  "description": "Oversees oven schedules, mixing batches, and recipe yield",
  "departmentIds": ["dept_prod_002"],
  "permissions": ["items:read", "items:manage"]
}
```

- **Response (201 Created)**:

```json
{
  "id": "role_hb_001",
  "code": "HEAD_BAKER",
  "name": "Head Artisan Baker",
  "isSystem": false,
  "status": "ACTIVE"
}
```

---

### `POST /api/v1/roles/clone`

Clones an existing role's permissions and department mappings into a new role.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `roles:manage`
- **Request Body**:

```json
{
  "sourceRoleKey": "PRODUCTION_SUPERVISOR",
  "newRoleKey": "PASTRY_LEAD",
  "newRoleName": "Pastry Kitchen Lead",
  "permissions": ["items:read"]
}
```

- **Response (201 Created)**:

```json
{
  "id": "role_pastry_lead",
  "code": "PASTRY_LEAD",
  "name": "Pastry Kitchen Lead",
  "isSystem": false
}
```

---

## 8. Catalog Items

### `GET /api/v1/items`

Lists all inventory items (raw materials, finished goods, packaging) for the tenant.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `items:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "item_flour_001",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "itemType": "RAW_MATERIAL",
    "sku": "FLOUR-WHEAT-50KG",
    "name": "Premium Golden Wheat Flour 50kg",
    "category": "Dry Ingredients",
    "uom": "BAG",
    "sellingPrice": null,
    "currency": "USD",
    "status": "ACTIVE"
  }
]
```

---

### `POST /api/v1/items`

Creates a new catalog inventory item.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `items:manage`
- **Request Body**:

```json
{
  "itemType": "FINISHED_GOOD",
  "sku": "BREAD-SOURDOUGH-BATARD",
  "name": "Artisan Sourdough Batard 800g",
  "category": "Loaves",
  "uom": "EACH",
  "sellingPrice": "6.5000",
  "currency": "USD"
}
```

- **Response (201 Created)**:

```json
{
  "id": "item_sourdough_800g",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "itemType": "FINISHED_GOOD",
  "sku": "BREAD-SOURDOUGH-BATARD",
  "name": "Artisan Sourdough Batard 800g",
  "category": "Loaves",
  "uom": "EACH",
  "sellingPrice": "6.5000",
  "currency": "USD",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T13:45:00.000Z",
  "updatedAt": "2026-11-12T13:45:00.000Z"
}
```

- **Error Response (409 Conflict)**:

```json
{
  "statusCode": 409,
  "message": "Item SKU already exists",
  "error": "Conflict"
}
```

---

## 9. Customers

### `GET /api/v1/customers`

Lists all registered trade and wholesale customers.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `customers:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "cust_cafe_01",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "displayName": "Sunrise Cafe & Bistro",
    "externalReference": "CUST-REF-001",
    "phone": "+2348012345678",
    "email": "procurement@sunrisecafe.com",
    "creditCeiling": "5000.0000",
    "currency": "USD",
    "status": "ACTIVE"
  }
]
```

---

### `POST /api/v1/customers`

Creates a customer profile with credit ceiling boundaries.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `customers:manage`
- **Request Body**:

```json
{
  "displayName": "Sunrise Cafe & Bistro",
  "externalReference": "CUST-REF-001",
  "phone": "+2348012345678",
  "email": "procurement@sunrisecafe.com",
  "creditCeiling": "5000.0000",
  "currency": "USD"
}
```

- **Response (201 Created)**:

```json
{
  "id": "cust_cafe_01",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "displayName": "Sunrise Cafe & Bistro",
  "normalizedName": "sunrise cafe & bistro",
  "externalReference": "CUST-REF-001",
  "phone": "+2348012345678",
  "email": "procurement@sunrisecafe.com",
  "creditCeiling": "5000.0000",
  "currency": "USD",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T13:50:00.000Z",
  "updatedAt": "2026-11-12T13:50:00.000Z"
}
```

---

## 10. Suppliers

### `GET /api/v1/suppliers`

Lists raw material and consumables suppliers.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `suppliers:read`
- **Response (200 OK)**:

```json
[
  {
    "id": "supp_mill_01",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "name": "Golden Grain Milling Co.",
    "externalReference": "SUPP-MILL-01",
    "contactName": "David Miller",
    "contactPhone": "+2348098765432",
    "contactEmail": "sales@goldengrain.com",
    "status": "ACTIVE"
  }
]
```

---

### `POST /api/v1/suppliers`

Creates a supplier profile.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `suppliers:manage`
- **Request Body**:

```json
{
  "name": "Golden Grain Milling Co.",
  "externalReference": "SUPP-MILL-01",
  "contactName": "David Miller",
  "contactPhone": "+2348098765432",
  "contactEmail": "sales@goldengrain.com"
}
```

- **Response (201 Created)**:

```json
{
  "id": "supp_mill_01",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "name": "Golden Grain Milling Co.",
  "normalizedName": "golden grain milling co.",
  "externalReference": "SUPP-MILL-01",
  "contactName": "David Miller",
  "contactPhone": "+2348098765432",
  "contactEmail": "sales@goldengrain.com",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T13:55:00.000Z",
  "updatedAt": "2026-11-12T13:55:00.000Z"
}
```

---

## 11. Audit Logs

### `GET /api/v1/audit-events`

Queries chronological immutable audit log events.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `audit:read`
- **Query Parameters**:
  - `limit`: number (optional, default `50`)
- **Response (200 OK)**:

```json
[
  {
    "id": "aud_01h8x9p3...",
    "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
    "actorAuthUserId": "usr_99f8c12a-3341-45bc-a10e-09c3140134a1",
    "actorMembershipId": "mem_55a1234e-0012-45bc-b210-998877665544",
    "action": "catalog:create",
    "subjectType": "catalog_item",
    "subjectId": "item_sourdough_800g",
    "requestId": "req_internal",
    "summary": {
      "sku": "BREAD-SOURDOUGH-BATARD",
      "name": "Artisan Sourdough Batard 800g"
    },
    "createdAt": "2026-11-12T13:45:00.000Z"
  }
]
```

---

## 12. Subscriptions & Billing

### `GET /api/v1/subscriptions/plans`

Lists active subscription pricing plans.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `subscription:read`
- **Query Parameters**:
  - `currency`: ISO code (optional, e.g. `NGN`, `USD`)
- **Response (200 OK)**:

```json
[
  {
    "id": "plan_starter_monthly",
    "code": "STARTER_MONTHLY",
    "name": "Starter Plan (Monthly)",
    "tier": "STANDARD",
    "billingInterval": "MONTHLY",
    "amount": "25000.00",
    "currency": "NGN",
    "isActive": true
  }
]
```

---

### `POST /api/v1/subscriptions/checkout`

Initiates a Flutterwave hosted checkout session for subscription billing.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `subscription:manage`
- **Request Body**:

```json
{
  "planId": "plan_starter_monthly",
  "redirectUrl": "https://app.tallybakery.com/settings/billing/return"
}
```

- **Response (201 Created)**:

```json
{
  "checkoutUrl": "https://checkout.flutterwave.com/v3/hosted/pay/fb89a9c...",
  "txRef": "sub_tx_123e4567-e89b-12d3-a456-426614174000_1731415200000"
}
```

---

### `GET /api/v1/subscriptions/verify`

Server-side zero-trust transaction verification against Flutterwave API.

- **Authentication**: Session Cookie
- **Header**: `x-tenant-id: <tenant-uuid>`
- **Permission**: `subscription:manage`
- **Query Parameters**:
  - `transactionId`: Flutterwave transaction ID
  - `txRef`: Local transaction reference
- **Response (200 OK)**:

```json
{
  "id": "sub_active_001",
  "tenantId": "ten_77b3456f-1122-45bc-c321-112233445566",
  "planId": "plan_starter_monthly",
  "status": "ACTIVE",
  "currentPeriodStart": "2026-11-12T14:00:00.000Z",
  "currentPeriodEnd": "2026-12-12T14:00:00.000Z",
  "cancelAtPeriodEnd": false
}
```

---

## 13. Webhooks

### `POST /api/v1/webhooks/flutterwave`

Receives asynchronous payment and subscription lifecycle events from Flutterwave. Verifies `verif-hash` header signature with constant-time equality.

- **Authentication**: Webhook Signature (`verif-hash` header)
- **Header**: `verif-hash: <FLUTTERWAVE_SECRET_HASH>`
- **Request Body (Flutterwave Webhook Payload)**:

```json
{
  "event": "charge.completed",
  "data": {
    "id": 12345678,
    "tx_ref": "sub_tx_123e4567-e89b-12d3-a456-426614174000_1731415200000",
    "flw_ref": "FLW_MOCK_1234",
    "amount": 25000,
    "currency": "NGN",
    "status": "successful"
  }
}
```

- **Response (200 OK)**:

```json
{
  "received": true
}
```

- **Error Response (401 Unauthorized - Invalid Signature)**:

```json
{
  "code": "INVALID_WEBHOOK_SIGNATURE",
  "message": "Invalid Flutterwave webhook signature hash"
}
```
