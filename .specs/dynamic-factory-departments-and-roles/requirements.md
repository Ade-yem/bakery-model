# Requirements Document: Dynamic Factory Departments, Roles, and Department Scoping

## Module: Identity, Tenancy, and Organizational Access Control
### Subsystem: TallyBakery Multi-Tenant Factory Platform

---

## Introduction

TallyBakery is an offline-first operations, inventory, and shift reconciliation SaaS platform for shift-based factories and manufacturing facilities (with commercial bakeries as the initial reference use case).

In factory environments, physical floor layouts and operational roles vary significantly from facility to facility. Departments cannot be confined to four hardcoded system types, nor can roles be locked into five static names. Factory owners must be able to:
1. Define custom departments reflecting their physical production and storage layout (e.g., *Mixing, Baking/Oven Bay, Quality Control, Packaging, Maintenance, Cold Storage, Dispatch, Reception, General Store*).
2. Create, update, and manage dynamic roles with custom titles, descriptions, and tailored permission bundles.
3. Establish explicit relationships between roles and departments (e.g., scoping a role to specific departments or granting global cross-departmental scope).
4. Utilize standard bakery/manufacturing defaults (*Reception, Production, Dispatch, Store*) purely as an initial starter template seeded upon tenant onboarding, which can be fully modified and extended post-onboarding.

---

## Existing Capabilities and Boundaries

- **Existing Capabilities**:
  - Multi-tenant data isolation with `x-tenant-id`, `x-branch-id`, and `x-department-id` header validation via `TenantScopeGuard`.
  - Session verification via `SessionGuard` backed by Better-Auth tables.
  - Route-level permission checks with `@RequirePermission(...)` and `PermissionGuard`.
  - Auditing of critical tenant actions via `AuditService`.
  - Staff membership assignment to branches (`membership_branches`) and departments (`membership_departments`).

- **Boundaries & Out of Scope**:
  - Arbitrary runtime permission creation by end-users (the permission vocabulary remains bounded by `VALID_PERMISSIONS`).
  - Cross-tenant sharing of departments or roles.
  - Hard deletion of operational records; lifecycle management uses status toggling (`ACTIVE` / `INACTIVE`).
  - System `OWNER` role destruction or removal of the last remaining organization owner.

---

## Glossary

- **Tenant**: An isolated organizational account representing a factory or business.
- **Branch**: A physical factory or retail location belonging to a tenant.
- **Department**: A designated physical or operational zone within a branch (e.g., *Mixing Area*, *Oven Bay*, *Cold Storage*).
- **Tenant Role**: A first-class, tenant-configured role definition specifying a title, code, description, active status, and permission bundle.
- **Role-Department Association**: Configuration determining whether a role is bound to specific departments (department-scoped) or operates across all departments (global).
- **Starter Template**: Pre-defined initial catalog of departments, roles, and default permissions provisioned automatically upon tenant creation as an editable baseline.

---

## Requirements

### Requirement 1: Dynamic Department Management ([DFDR-01])

**User Story:** As a factory owner, I want to configure, create, rename, and deactivate departments in my facility so that the software accurately reflects my physical plant layout.

#### Acceptance Criteria

1. THE System SHALL allow authorized tenant actors with `departments:manage` to create departments with arbitrary operational types/categories (e.g., `PRODUCTION`, `STORE`, `DISPATCH`, `RECEPTION`, `PACKAGING`, `QUALITY_ASSURANCE`, `MAINTENANCE`, `CUSTOM`).
2. THE System SHALL enforce uniqueness of department names and codes within the same branch of a tenant.
3. WHEN a tenant administrator updates a department, THE System SHALL support modifying its name, operational category/type, description, and status (`ACTIVE` | `INACTIVE`).
4. THE System SHALL prevent hard deletion of departments and enforce soft deactivation (`status = INACTIVE`).
5. WHILE a department is `INACTIVE`, THE System SHALL reject assigning that department to staff memberships or selecting it as an active operational target.
6. IF a department update or creation references a non-existent branch or cross-tenant branch, THEN THE System SHALL reject the request with `RESOURCE_NOT_FOUND`.

---

### Requirement 2: First-Class Dynamic Roles ([DFDR-02])

**User Story:** As a factory owner, I want to create and manage custom roles with tailored titles and permission sets so that I can match the organizational structure of my factory workforce.

#### Acceptance Criteria

1. THE System SHALL maintain a dedicated, first-class `tenant_roles` entity storing role metadata: unique `code`, `name`, `description`, `isSystem`, and `status`.
2. WHEN an authorized actor with `roles:manage` creates or updates a custom role, THE System SHALL validate all assigned permissions against `VALID_PERMISSIONS`.
3. THE System SHALL enforce uniqueness of role codes within each tenant.
4. WHEN an authorized actor requests the tenant role catalog, THE System SHALL return all active tenant roles, their metadata, assigned permissions, and associated departments.
5. IF a tenant administrator attempts to delete or deactivate the system `OWNER` role, THEN THE System SHALL reject the request with `ROLE_ASSIGNMENT_FORBIDDEN`.

---

### Requirement 3: Explicit Role-to-Department Association ([DFDR-03])

**User Story:** As a factory owner, I want to associate roles with specific departments so that staff holding those roles are restricted to their relevant operational floor areas.

#### Acceptance Criteria

1. THE System SHALL allow each tenant role to be configured with explicit department associations via a `role_departments` relational mapping.
2. THE System SHALL support two scoping modes for roles:
   - **Department-Scoped**: Tied to one or more designated department IDs within the tenant.
   - **Global**: Flagged as cross-departmental, granting access across all active departments in assigned branches.
3. WHEN assigning or updating a staff member's role and department scopes (`membership_departments`), THE System SHALL validate that the staff member's department selections conform to the role's allowed department relationships.
4. IF a staff assignment includes a department not permitted by the assigned role (unless the role is Global), THEN THE System SHALL reject the assignment with `SCOPE_FORBIDDEN`.

---

### Requirement 4: Starter Template Seeding on Tenant Creation ([DFDR-04])

**User Story:** As a new tenant registering on the platform, I want a working baseline of standard bakery departments and roles created automatically so that I can begin operations immediately without manual setup.

#### Acceptance Criteria

1. WHEN a new tenant is onboarded, THE System SHALL seed an initial starter template containing:
   - Primary Branch (`Main Branch`, code `MAIN`).
   - Default Departments: `Reception` (RECEPTION), `Production` (PRODUCTION), `Dispatch` (DISPATCH), and `Store` (STORE).
   - Default Roles: `OWNER` (isSystem = true), `MANAGER`, `RECEPTIONIST`, `PRODUCTION_SUPERVISOR`, `DISPATCH_OFFICER`.
   - Seeded role-to-department associations matching the default operational personas.
   - Seeded baseline permissions for each starter role.
2. THE System SHALL persist all seeded departments and roles (except the `isSystem` flag on `OWNER`) as standard tenant-editable database records.
3. THE System SHALL permit tenant administrators to rename, modify, or deactivate seeded departments and non-system roles immediately after onboarding without requiring software redeployment.

---

### Requirement 5: Security, Auditing, and Tenant Boundaries ([DFDR-05])

**User Story:** As a system administrator, I want strict server-side validation and audit logging for all structural and permission changes so that operational security and tenant isolation are guaranteed.

#### Acceptance Criteria

1. THE System SHALL verify that all role and department mutations occur strictly within the tenant boundary of the authenticated actor (`actorContext.tenantId`).
2. WHEN any department, role, or role-department mapping is created, updated, or deactivated, THE System SHALL emit an immutable record to `audit_events` detailing the actor, action, subject ID, request ID, and change summary.
3. THE System SHALL enforce that a tenant must always retain at least one active `OWNER` membership.
4. IF a tenant user submits a request attempting to read, update, or assign departments/roles belonging to another tenant, THEN THE System SHALL reject the request with `RESOURCE_NOT_FOUND` or `SCOPE_FORBIDDEN`.

