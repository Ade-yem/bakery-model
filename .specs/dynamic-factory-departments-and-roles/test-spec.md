# TDD Test Specification: Dynamic Factory Departments and Roles

## Module: Identity, Tenancy, and Organizational Access Control
### Subsystem: TallyBakery Multi-Tenant Factory Platform

---

## 1. Strategy

Under the strict Test-Driven Development (TDD) protocol, all unit and integration tests must be written first and confirmed before any implementation code is written.

The test strategy covers:
1. **Schema & Contract Validation**: Verifying that custom department types, role codes, and role-department join tables adhere to structural constraints.
2. **Service Layer Logic**: Testing department management, custom role creation, role-to-department scoping, and tenant template seeding.
3. **Security & Boundary Enforcement**: Ensuring that `OWNER` system roles cannot be deleted, cross-tenant header spoofing is rejected, and staff assignments respect role-department ceilings.

---

## 2. Proposed Test Locations

```text
apps/api/
├── src/
│   ├── departments/
│   │   ├── departments.service.spec.ts          # Department CRUD, custom types, deactivation
│   │   └── departments.controller.spec.ts       # Endpoint validation & guards
│   ├── access-control/
│   │   ├── access-control.service.spec.ts       # Dynamic roles, role-department mapping, permissions
│   │   └── access-control.controller.spec.ts    # Roles endpoints
│   ├── staff/
│   │   └── staff.service.spec.ts                # Role & department assignment enforcement
│   └── tenants/
│       ├── tenants.service.spec.ts              # Onboarding orchestration
│       └── tenant-template-seeder.service.spec.ts # Starter baseline seeding tests
└── test/
    └── dynamic-roles-departments.e2e-spec.ts    # Full HTTP integration flow
```

---

## 3. Test Suites and Scenarios

### 3.1 Department Management Tests (`TEST-DFDR-DEPT-###`)

- **TEST-DFDR-DEPT-001 — Create department with custom factory category**:
  - *Input*: `branchId`, `name: "Oven Bay 1"`, `code: "OB-01"`, `type: "BAKING"`
  - *Precondition*: Authenticated actor with `departments:manage`.
  - *Assertion*: Department created successfully; returned type matches `"BAKING"`; status is `"ACTIVE"`.

- **TEST-DFDR-DEPT-002 — Duplicate department code or name in same branch**:
  - *Input*: Department payload with code already present in the branch.
  - *Assertion*: Throws `ConflictException` (`CONFLICT`).

- **TEST-DFDR-DEPT-003 — Cross-tenant branch department creation**:
  - *Input*: Attempt to create department providing a `branchId` belonging to another tenant.
  - *Assertion*: Throws `NotFoundException` (`RESOURCE_NOT_FOUND`).

- **TEST-DFDR-DEPT-004 — Update department metadata and status**:
  - *Input*: `PATCH /departments/:id` with new name, description, and `status: "INACTIVE"`.
  - *Assertion*: Updates persist; inactive department is omitted from active operational selections.

---

### 3.2 Dynamic Role Management Tests (`TEST-DFDR-ROLE-###`)

- **TEST-DFDR-ROLE-001 — Create custom tenant role with metadata and permissions**:
  - *Input*: `code: "QUALITY_INSPECTOR"`, `name: "Quality Assurance Lead"`, `permissions: ["items:read", "departments:read"]`.
  - *Assertion*: Role record inserted in `tenant_roles`; permissions mapped in `role_permissions`.

- **TEST-DFDR-ROLE-002 — Reject custom role with unknown permissions**:
  - *Input*: Role payload containing permission `"system:nuke"`.
  - *Assertion*: Throws `BadRequestException` (`UNKNOWN_PERMISSION`).

- **TEST-DFDR-ROLE-003 — Duplicate role code in tenant**:
  - *Input*: Creating role with existing `code` in the same tenant.
  - *Assertion*: Throws `ConflictException` (`CONFLICT`).

- **TEST-DFDR-ROLE-004 — Protect system OWNER role**:
  - *Input*: Attempt to delete, rename code, or deactivate role where `isSystem: true`.
  - *Assertion*: Throws `ForbiddenException` (`ROLE_ASSIGNMENT_FORBIDDEN`).

---

### 3.3 Role-to-Department Association Tests (`TEST-DFDR-SCOPE-###`)

- **TEST-DFDR-SCOPE-001 — Associate role with specific departments**:
  - *Input*: Role `OVEN_OPERATOR` assigned to department `Oven Bay 1`.
  - *Assertion*: Association saved in `role_departments`; query returns linked departments.

- **TEST-DFDR-SCOPE-002 — Enforce role-department constraint on staff assignment**:
  - *Input*: Assigning staff member to role `OVEN_OPERATOR` while selecting department `Reception`.
  - *Assertion*: Throws `ForbiddenException` (`SCOPE_FORBIDDEN`).

- **TEST-DFDR-SCOPE-003 — Global role bypasses specific department restrictions**:
  - *Input*: Role `MANAGER` without specific department constraints assigned across multiple departments.
  - *Assertion*: Assignment succeeds.

---

### 3.4 Tenant Starter Template Seeding Tests (`TEST-DFDR-SEED-###`)

- **TEST-DFDR-SEED-001 — Seed default departments and roles upon tenant onboarding**:
  - *Input*: `onboardTenant` execution with tenant name and owner credentials.
  - *Assertion*:
    - Creates 4 default departments (`Reception`, `Production`, `Dispatch`, `Store`).
    - Creates 5 default roles (`OWNER`, `MANAGER`, `RECEPTIONIST`, `PRODUCTION_SUPERVISOR`, `DISPATCH_OFFICER`).
    - Maps default role-department associations.
    - Owner membership receives global branch/department assignment.

- **TEST-DFDR-SEED-002 — Seeded departments and roles remain fully editable**:
  - *Input*: Rename seeded department `Production` to `Main Bakery Floor` and add custom permissions to `MANAGER`.
  - *Assertion*: Updates persist successfully without system locks.

