# Tasks: Dynamic Factory Departments and Roles

## Module Overview

This phased task checklist guides the implementation of dynamic factory departments, first-class tenant roles, role-department scoping, and tenant template seeding.

- Requirements: [requirements.md](./requirements.md)
- Design: [design.md](./design.md)
- Test Spec: [test-spec.md](./test-spec.md)
- Reference PRD: [Product Requirements Document](../../docs/Product%20Requirements%20Document_%20Shift-Based%20Invento....md)

> Under the strict TDD protocol, tests for each phase must be written and presented to the user for confirmation before implementation begins. Every task must be verified passing before progressing.

---

## Task List

### Phase 1: Baseline & TDD Test Writing
- [x] 1.1 Write unit tests for updated `DepartmentsService` covering custom department types, code uniqueness per branch, and metadata updates (`TEST-DFDR-DEPT-001` through `TEST-DFDR-DEPT-004`).
- [x] 1.2 Write unit tests for updated `AccessControlService` covering dynamic role CRUD, `tenant_roles` persistence, unknown permission validation, and system `OWNER` protection (`TEST-DFDR-ROLE-001` through `TEST-DFDR-ROLE-004`).
- [x] 1.3 Write unit tests for role-department mapping in `StaffService` and `AccessControlService` (`TEST-DFDR-SCOPE-001` through `TEST-DFDR-SCOPE-003`).
- [x] 1.4 Write unit tests for `TenantTemplateSeederService` validating the initial starter template seeding and post-onboarding editability (`TEST-DFDR-SEED-001` and `TEST-DFDR-SEED-002`).
- [x] 1.5 **USER CONFIRMATION GATE**: Present the written test suites, scenarios, and assertions to the user for review and alignment.

---

### Phase 2: Schema Evolution & Contracts
- [x] 2.1 Update [`packages/shared/src/index.ts`](file:///home/lanke/Documents/projects/bakery-model/packages/shared/src/index.ts) to define DTO interfaces: `CreateDepartmentDto`, `UpdateDepartmentDto`, `CreateRoleDto`, `UpdateRoleDto`, and role-department scope payloads.
- [x] 2.2 Update [`apps/api/src/database/schema/tenancy.schema.ts`](file:///home/lanke/Documents/projects/bakery-model/apps/api/src/database/schema/tenancy.schema.ts):
  - Replace `departmentTypeEnum` with `varchar('type', { length: 100 })` on `departments`.
  - Add `code` and `description` columns with unique constraint `(tenant_id, branch_id, code)` on `departments`.
  - Define the `tenantRoles` table schema with unique `(tenant_id, code)`.
  - Define the `roleDepartments` join table schema with foreign keys and cascade rules.
  - Export inferred types (`TenantRole`, `NewTenantRole`, `RoleDepartment`, `NewRoleDepartment`).
- [x] 2.3 Generate and apply the database migration via `pnpm --filter @repo/api db:generate`.

---

### Phase 3: Departments Service & Controller Updates
- [x] 3.1 Update `DepartmentsService.create` and `DepartmentsService.update` to accept custom categories/types, branch codes, and descriptions.
- [x] 3.2 Update `DepartmentsController` with DTO validation (`class-validator`) and Swagger annotations.
- [x] 3.3 Execute department unit tests and verify 100% pass rate.

---

### Phase 4: Dynamic Roles & Role-Department Mapping
- [x] 4.1 Implement dynamic role CRUD in `AccessControlService`:
  - `createRole(tenantId, input)`
  - `updateRole(tenantId, roleId, input)`
  - `listRoles(tenantId)` returning full role metadata, permissions, and department linkages.
  - `deleteRole(tenantId, roleId)` (soft deactivation with `OWNER` system protection).
- [x] 4.2 Implement role-to-department association methods:
  - `assignRoleDepartments(tenantId, roleId, departmentIds)`
- [x] 4.3 Update `StaffService.updateAccess` to validate staff department selections against the assigned role's allowed departments.
- [x] 4.4 Update `AccessControlController` exposing `POST /roles`, `PATCH /roles/:roleId`, `DELETE /roles/:roleId`, and `GET /roles`.
- [x] 4.5 Execute role and scoping unit tests and verify 100% pass rate.

---

### Phase 5: Template Seeding Refactoring
- [x] 5.1 Create `TenantTemplateSeederService` inside `apps/api/src/tenants/`:
  - Seeds default departments: `Reception` (`REC`), `Production` (`PROD`), `Dispatch` (`DISP`), and `Store` (`STORE`).
  - Seeds default roles in `tenant_roles`: `OWNER`, `MANAGER`, `RECEPTIONIST`, `PRODUCTION_SUPERVISOR`, `DISPATCH_OFFICER`.
  - Seeds `role_departments` mappings matching starter personas.
  - Seeds `role_permissions` from default baseline permission mappings.
- [x] 5.2 Refactor `TenantsService.onboardTenant` to delegate starter provisioning to `TenantTemplateSeederService`.
- [x] 5.3 Execute tenant onboarding and template seeder tests and verify 100% pass rate.

---

### Phase 6: End-to-End Verification & Documentation
- [x] 6.1 Run full API test suite (`pnpm --filter @repo/api test`) and ensure all tests pass with zero failures.
- [x] 6.2 Run linter and formatting checks (`pnpm lint`, `pnpm format:check`).
- [x] 6.3 Verify complete user loop: onboarding a tenant, creating a custom department (e.g. `Oven Bay`), creating a custom role (e.g. `Oven Operator`), linking the role to the department, and assigning staff.

---

## Acceptance Gate

The feature is ready for production only when:
- [x] All automated unit and service tests in `test-spec.md` pass with zero failures.
- [x] Factory owners can create arbitrary departments and custom roles via the API without code changes.
- [x] Staff department assignments strictly enforce role-department boundaries.
- [x] The system `OWNER` role is permanently protected against deletion or deactivation.
- [x] The starter baseline template seeds correctly on tenant registration.
