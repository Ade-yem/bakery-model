# Dynamic Department and Role Catalog Specification

## Module
Backend Foundation, Identity, Tenancy, and Access Control

## Summary
This specification defines the tenant-owned default catalog for departments and roles. The catalog is seeded for every new tenant and remains editable by the tenant after onboarding. The catalog is not a hard-coded application class, but a database-backed configuration layer that is validated against the approved permission allowlist and tenant access scopes.

## Goals
- Seed each new tenant with a usable bakery baseline without requiring a code deployment.
- Let a tenant rename, archive, add, and adjust department and role records within the safe product boundaries.
- Preserve a fixed permission vocabulary while allowing the tenant to assign those permissions to dynamic role records.
- Maintain server-side authorization checks using the tenant-scoped catalog, not client-provided values.

## Scope
In scope:
- default department catalog seeded per tenant
- default role catalog seeded per tenant
- role permission assignment from the approved permission allowlist
- tenant-local role/department customization rules
- membership assignment to branches and departments
- authorization enforcement against the tenant catalog and fixed permission set

Out of scope:
- arbitrary permission creation by end users
- arbitrary workflow-builder models not approved in the product gate
- cross-tenant role or department sharing
- hard delete of business records; deactivation is the default lifecycle

## Baseline Catalog
Each new tenant receives the following default records:

Departments:
- Reception
- Production
- Dispatch
- Store

Roles:
- Owner
- Manager
- Receptionist
- Production Supervisor
- Dispatch Officer

The baseline is created in the tenant’s database records, with role permission rows assigned from the approved permission allowlist.

## Allowed Customization Rules
- A tenant may rename active or inactive department names.
- A tenant may deactivate or reactivate departments without deleting them from the audit history.
- A tenant may add additional departments for branch-specific operations.
- A tenant may clone an existing role, rename it, and assign an allowed subset of permissions from the approved catalog.
- A tenant may update the department and branch scope for a membership from the authorized admin console.
- A tenant may not create custom permission keys outside the allowlist.
- A tenant may not assign a role or permission that exceeds the approved ceiling for the role family.

## Security and Validation Rules
1. The application shall validate all department and role changes server-side.
2. Role permission assignment must be checked against the fixed `VALID_PERMISSIONS` allowlist.
3. Management of role data remains constrained by the role ceiling policy and ownership rules.
4. Department and role data remain tenant-scoped; no record may be looked up or mutated across tenants.
5. Membership branch and department assignments must remain within the tenant’s valid branch/department records.
6. A user cannot rely on a client-supplied role or department id as proof of authorization.

## Seed Behavior
When a tenant is onboarded, the system shall:
1. create the tenant and primary branch;
2. create the default department set for the tenant and branch;
3. create the default role-permission dataset for that tenant;
4. create the Owner membership for the onboarding actor;
5. assign the Owner membership to the tenant branch and all default departments;
6. record an onboarding audit event.

The seed is idempotent for a tenant record and safe to re-run only in a controlled onboarding or test context.

## Acceptance Criteria
- AC-1: A new tenant receives the default departments and roles in the database.
- AC-2: The role permission rows are created from the approved permission allowlist.
- AC-3: Tenant administrators can change the names and assignments of the seeded records without a deployment.
- AC-4: The system rejects invalid or cross-tenant role/department assignments.
- AC-5: Non-Owner members cannot broaden the tenant’s permission set beyond their approved role ceilings.
- AC-6: The seed data preserves the default business model while remaining editable.

## Test Coverage
- Seed creates baseline departments and permissions for a new tenant.
- Owner membership is assigned to each default department.
- Custom role creation rejects unknown permissions.
- Cross-tenant role/department lookup does not leak records.
- Inactive departments cannot be selected for active operations.
