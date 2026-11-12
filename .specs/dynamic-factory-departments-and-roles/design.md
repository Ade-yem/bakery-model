# Design Document: Dynamic Factory Departments, Roles, and Department Scoping

## Module: Identity, Tenancy, and Organizational Access Control
### Subsystem: TallyBakery Multi-Tenant Factory Platform

---

## Overview

This engineering design addresses the rigidity in the current backend where department types are bound to a 4-value PostgreSQL enum (`departmentTypeEnum`) and roles exist merely as loose strings in `role_permissions` without metadata or department associations.

The redesigned architecture introduces:
1. **Unconstrained Department Types**: Migrating `departments.type` from an inflexible enum to an open string category (`varchar(100)`), permitting arbitrary factory floor zones.
2. **First-Class `tenant_roles` Entity**: A dedicated table storing role metadata (`code`, `name`, `description`, `isSystem`, `status`, timestamps) per tenant.
3. **Explicit `role_departments` Mapping**: A relational bridge defining department scoping per role (with support for global cross-department roles).
4. **Decoupled Template Seeder (`TenantTemplateSeederService`)**: Encapsulating the standard bakery baseline into an editable starter dataset seeded upon tenant onboarding.
5. **Staff Access & Guard Validation**: Updating `StaffService`, `TenantScopeGuard`, and `AccessControlService` to evaluate staff permissions and department access through the dynamic role catalog.

---

## Current Architecture and Evidence

| Concern | Existing Implementation | Design Implication |
|---|---|---|
| **Department Types** | `departmentTypeEnum` in [`tenancy.schema.ts`](file:///home/lanke/Documents/projects/bakery-model/apps/api/src/database/schema/tenancy.schema.ts#L22-L27) restricts types to 4 enum values. | Remove `departmentTypeEnum` constraint; use `varchar(100)` with recommended defaults (`PRODUCTION`, `STORE`, `DISPATCH`, `RECEPTION`, `CUSTOM`). |
| **Role Metadata** | No `roles` table. Roles exist only as strings in `role_permissions.role_key` and `tenant_memberships.role_key`. | Create `tenant_roles` table with tenant isolation, unique code constraints, display names, and descriptions. |
| **Role-Department Scope** | No role-to-department relationship exists in the database. | Introduce `role_departments` table mapping `(tenant_id, role_id, department_id)` with an `is_primary` flag. |
| **Role Customization & Ceilings** | `ROLE_CEILINGS` in [`permissions.ts`](file:///home/lanke/Documents/projects/bakery-model/apps/api/src/access-control/permissions.ts) restricts permissions strictly to 5 hardcoded role keys. | Transition from static role-name ceilings to template-based ceilings while keeping system safeguards (`OWNER` protection, `VALID_PERMISSIONS` check). |
| **Seeding Mechanism** | Seeding logic is hardcoded inside `onboardTenant` in [`tenants.service.ts`](file:///home/lanke/Documents/projects/bakery-model/apps/api/src/tenants/tenants.service.ts#L50-L124). | Extract into `TenantTemplateSeederService` that populates default records using the new `tenant_roles`, `departments`, and `role_departments` tables. |

---

## Architecture Diagram

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        HTTP Request (Express API)                      │
 │  Headers: x-tenant-id, x-branch-id, x-department-id, Session Cookie    │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                             Guard Pipeline                             │
 │  1. SessionGuard (Better-Auth user resolution)                         │
 │  2. TenantScopeGuard (Tenant active check & Branch/Dept scope match)   │
 │  3. PermissionGuard (@RequirePermission('roles:manage', etc.))         │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Service Layer & Domain Logic                      │
 │                                                                        │
 │  ┌──────────────────────┐  ┌─────────────────────┐  ┌───────────────┐ │
 │  │  DepartmentsService  │  │ AccessControlService│  │ StaffService  │ │
 │  │  - CRUD Departments │  │ - CRUD Tenant Roles │  │ - Assign      │ │
 │  │  - Category & Status │  │ - Role-Dept Mapping │  │   Role & Dept │ │
 │  │  - Branch scoping    │  │ - Permissions Mgmt  │  │   Ceilings    │ │
 │  └──────────┬───────────┘  └──────────┬──────────┘  └───────┬───────┘ │
 │             │                         │                     │         │
 │             └─────────────────────────┼─────────────────────┘         │
 │                                       ▼                               │
 │                       TenantTemplateSeederService                      │
 │                       (Seeds Baseline Bakery Profile)                 │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                       PostgreSQL Database Schema                       │
 │                                                                        │
 │  ┌───────────────┐        ┌────────────────┐        ┌──────────────┐   │
 │  │    tenants    │───────►│  tenant_roles  │───────►│role_permiss- │   │
 │  └───────┬───────┘        └───────┬────────┘        │    ions      │   │
 │          │                        │                 └──────────────┘   │
 │          ▼                        ▼                                    │
 │  ┌───────────────┐        ┌────────────────┐        ┌──────────────┐   │
 │  │   branches    │        │role_departments│◄───────┤ departments  │   │
 │  └───────┬───────┘        └────────────────┘        └──────────────┘   │
 │          │                                                  ▲          │
 │          └──────────────────────────────────────────────────┘          │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## Data and Identity Contracts

### 1. Database Schema (`tenancy.schema.ts`)

#### A. Updated `departments` Table
```typescript
export const departments = pgTable(
  'departments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    branchId: uuid('branch_id').notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(), // Unique per branch
    type: varchar('type', { length: 100 }).default('PRODUCTION').notNull(), // Open category
    description: text('description'),
    status: recordStatusEnum('status').default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    foreignKey({
      name: 'departments_tenant_branch_fk',
      columns: [table.tenantId, table.branchId],
      foreignColumns: [branches.tenantId, branches.id],
    }).onDelete('restrict'),
    unique('departments_tenant_id_id_unique').on(table.tenantId, table.id),
    unique('departments_branch_code_unique').on(table.tenantId, table.branchId, table.code),
    unique('departments_branch_name_unique').on(table.tenantId, table.branchId, table.name),
    index('departments_tenant_branch_status_idx').on(table.tenantId, table.branchId, table.status),
  ],
);
```

#### B. New `tenantRoles` Table
```typescript
export const tenantRoles = pgTable(
  'tenant_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    description: text('description'),
    isSystem: boolean('is_system').default(false).notNull(), // OWNER is protected
    status: recordStatusEnum('status').default('ACTIVE').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('tenant_roles_tenant_code_unique').on(table.tenantId, table.code),
    unique('tenant_roles_tenant_id_id_unique').on(table.tenantId, table.id),
    index('tenant_roles_tenant_status_idx').on(table.tenantId, table.status),
  ],
);
```

#### C. New `roleDepartments` Table
```typescript
export const roleDepartments = pgTable(
  'role_departments',
  {
    tenantId: uuid('tenant_id').notNull(),
    roleId: uuid('role_id').notNull(),
    departmentId: uuid('department_id').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.roleId, table.departmentId] }),
    foreignKey({
      name: 'role_departments_role_fk',
      columns: [table.tenantId, table.roleId],
      foreignColumns: [tenantRoles.tenantId, tenantRoles.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'role_departments_department_fk',
      columns: [table.tenantId, table.departmentId],
      foreignColumns: [departments.tenantId, departments.id],
    }).onDelete('cascade'),
    index('role_departments_department_idx').on(table.tenantId, table.departmentId),
  ],
);
```

---

## API & Service Boundaries

### 1. Departments API
- `GET /departments`: Lists all departments for the authenticated tenant.
- `POST /departments`: Creates a new department.
  - Body: `{ branchId: string, name: string, code: string, type?: string, description?: string }`
- `PATCH /departments/:departmentId`: Updates department details.
  - Body: `{ name?: string, code?: string, type?: string, description?: string, status?: 'ACTIVE' | 'INACTIVE' }`

### 2. Roles & Access Control API
- `GET /roles`: Lists all tenant roles, their descriptions, permissions, and associated departments.
- `POST /roles`: Creates a new custom role.
  - Body: `{ code: string, name: string, description?: string, permissions: string[], departmentIds?: string[] }`
- `PATCH /roles/:roleId`: Updates role title, description, permissions, and department associations.
  - Body: `{ name?: string, description?: string, permissions?: string[], departmentIds?: string[], status?: 'ACTIVE' | 'INACTIVE' }`
- `DELETE /roles/:roleId`: Deactivates a non-system role (`status = INACTIVE`). Rejects if `isSystem === true`.

### 3. Tenant Seeding (`TenantTemplateSeederService`)
Upon tenant registration (`POST /tenants/onboard`):
1. Creates tenant record and primary branch (`MAIN`).
2. Seeds default departments:
   - `Reception` (code: `REC`, type: `RECEPTION`)
   - `Production` (code: `PROD`, type: `PRODUCTION`)
   - `Dispatch` (code: `DISP`, type: `DISPATCH`)
   - `Store` (code: `STORE`, type: `STORE`)
3. Seeds default roles:
   - `OWNER` (code: `OWNER`, isSystem: true, Global scope)
   - `MANAGER` (code: `MANAGER`, Global scope)
   - `RECEPTIONIST` (code: `RECEPTIONIST`, scoped to `Reception`)
   - `PRODUCTION_SUPERVISOR` (code: `PRODUCTION_SUPERVISOR`, scoped to `Production`)
   - `DISPATCH_OFFICER` (code: `DISPATCH_OFFICER`, scoped to `Dispatch` and `Store`)
4. Links permissions and initial role departments.
5. Seeds the onboarding user as `OWNER` with global branch/department access.

