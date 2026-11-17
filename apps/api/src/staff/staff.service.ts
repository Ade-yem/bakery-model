import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and, inArray } from 'drizzle-orm';
import {
  ROLE_CEILINGS,
  type PermissionKey,
} from '../access-control/permissions.js';
import type { RoleKey } from '@repo/shared';

export interface UpdateStaffAccessInput {
  roleKey?: string;
  customPermissions?: string[];
  branchIds?: string[];
  departmentIds?: string[];
}

export interface CreateStaffInput {
  authUserId: string;
  displayName: string;
  roleKey: string;
  branchIds?: string[];
  departmentIds?: string[];
  status?: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

/**
 * Service managing tenant staff memberships, branch/department access assignments,
 * and role ceiling validation.
 */
@Injectable()
export class StaffService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Retrieves all staff memberships for the given tenant.
   *
   * @param tenantId - The UUID of the authenticated tenant.
   * @returns Array of tenant membership records.
   */
  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.tenantMemberships)
      .where(eq(schema.tenantMemberships.tenantId, tenantId));
  }

  /**
   * Updates a staff member's role and branch/department access scopes atomically.
   *
   * @param tenantId - The UUID of the tenant.
   * @param membershipId - The UUID of the membership to modify.
   * @param input - The role and branch/department scope assignments.
   * @returns The updated membership record.
   * @throws {NotFoundException} If the membership or any branch/department does not belong to the tenant.
   * @throws {ForbiddenException} If assigned permissions exceed the target role ceiling.
   * @throws {BadRequestException} If any assigned department is inactive.
   */
  async updateAccess(
    tenantId: string,
    membershipId: string,
    input: UpdateStaffAccessInput,
  ) {
    // 1. Locate membership in tenant scope
    const [membership] = await this.db
      .select()
      .from(schema.tenantMemberships)
      .where(
        and(
          eq(schema.tenantMemberships.id, membershipId),
          eq(schema.tenantMemberships.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new NotFoundException('Staff membership not found');
    }

    // 2. Validate role ceiling
    const targetRole = (input.roleKey || membership.roleKey) as RoleKey;
    const allowedCeilings =
      ROLE_CEILINGS[targetRole] ?? new Set<PermissionKey>();

    if (input.customPermissions && input.customPermissions.length > 0) {
      const invalid = input.customPermissions.filter(
        (p) => !allowedCeilings.has(p as PermissionKey),
      );
      if (invalid.length > 0) {
        throw new ForbiddenException(
          'Custom permissions exceed role ceiling: ' + invalid.join(', '),
        );
      }
    }

    // 3. Validate branch scopes if provided
    if (input.branchIds && input.branchIds.length > 0) {
      const foundBranches = await this.db
        .select({ id: schema.branches.id })
        .from(schema.branches)
        .where(
          and(
            eq(schema.branches.tenantId, tenantId),
            inArray(schema.branches.id, input.branchIds),
          ),
        );

      if (foundBranches.length !== input.branchIds.length) {
        throw new NotFoundException('One or more branches not found in tenant');
      }
    }

    // 4. Validate department scopes if provided
    if (input.departmentIds && input.departmentIds.length > 0) {
      const foundDepts = await this.db
        .select({
          id: schema.departments.id,
          name: schema.departments.name,
          status: schema.departments.status,
        })
        .from(schema.departments)
        .where(
          and(
            eq(schema.departments.tenantId, tenantId),
            inArray(schema.departments.id, input.departmentIds),
          ),
        );

      if (foundDepts.length !== input.departmentIds.length) {
        throw new NotFoundException(
          'One or more departments not found in tenant',
        );
      }

      // Inactive departments cannot be selected for active operations or memberships
      const inactiveDepts = foundDepts.filter((d) => d.status !== 'ACTIVE');
      if (inactiveDepts.length > 0) {
        throw new BadRequestException(
          'Cannot assign inactive department to membership: ' +
            inactiveDepts.map((d) => d.name).join(', '),
        );
      }

      // Check role-department scoping constraints if role has explicit department mappings
      const [roleRow] = await this.db
        .select({ id: schema.tenantRoles.id, code: schema.tenantRoles.code })
        .from(schema.tenantRoles)
        .where(
          and(
            eq(schema.tenantRoles.tenantId, tenantId),
            eq(schema.tenantRoles.code, targetRole),
          ),
        )
        .limit(1);

      if (roleRow) {
        const allowedRoleDepts = await this.db
          .select({ departmentId: schema.roleDepartments.departmentId })
          .from(schema.roleDepartments)
          .where(
            and(
              eq(schema.roleDepartments.tenantId, tenantId),
              eq(schema.roleDepartments.roleId, roleRow.id),
            ),
          );

        if (allowedRoleDepts.length > 0) {
          const allowedDeptSet = new Set(
            allowedRoleDepts.map((r) => r.departmentId),
          );
          const unauthorizedDepts = input.departmentIds.filter(
            (id) => !allowedDeptSet.has(id),
          );
          if (unauthorizedDepts.length > 0) {
            throw new ForbiddenException(
              `Role ${targetRole} is not authorized for department(s): ${unauthorizedDepts.join(', ')}`,
            );
          }
        }
      }
    }

    // 5. Execute atomic database update in transaction
    return this.db.transaction(async (tx) => {
      if (input.branchIds) {
        await tx
          .delete(schema.membershipBranches)
          .where(
            and(
              eq(schema.membershipBranches.tenantId, tenantId),
              eq(schema.membershipBranches.membershipId, membershipId),
            ),
          );

        if (input.branchIds.length > 0) {
          await tx.insert(schema.membershipBranches).values(
            input.branchIds.map((branchId) => ({
              tenantId,
              membershipId,
              branchId,
            })),
          );
        }
      }

      if (input.departmentIds) {
        await tx
          .delete(schema.membershipDepartments)
          .where(
            and(
              eq(schema.membershipDepartments.tenantId, tenantId),
              eq(schema.membershipDepartments.membershipId, membershipId),
            ),
          );

        if (input.departmentIds.length > 0) {
          await tx.insert(schema.membershipDepartments).values(
            input.departmentIds.map((departmentId) => ({
              tenantId,
              membershipId,
              departmentId,
            })),
          );
        }
      }

      const [updated] = await tx
        .update(schema.tenantMemberships)
        .set({
          roleKey: targetRole,
          updatedAt: new Date(),
        })
        .where(eq(schema.tenantMemberships.id, membershipId))
        .returning();

      return updated;
    });
  }

  /**
   * Creates or invites a new staff member into the tenant with designated role and scopes.
   *
   * @param tenantId - The UUID of the tenant.
   * @param input - The staff creation parameters including authUserId, roleKey, and scope IDs.
   * @returns Newly created tenant membership record.
   * @throws {BadRequestException} If the user is already a member or if an inactive department is assigned.
   * @throws {NotFoundException} If referenced branches or departments are not found in the tenant.
   * @throws {ForbiddenException} If the assigned departments are not authorized for the specified role.
   */
  async create(tenantId: string, input: CreateStaffInput) {
    // 1. Check if user already has a membership in this tenant
    const [existing] = await this.db
      .select({ id: schema.tenantMemberships.id })
      .from(schema.tenantMemberships)
      .where(
        and(
          eq(schema.tenantMemberships.tenantId, tenantId),
          eq(schema.tenantMemberships.authUserId, input.authUserId),
        ),
      )
      .limit(1);

    if (existing) {
      throw new BadRequestException(
        'User already has a membership in this tenant',
      );
    }

    // 2. Validate branch scopes if provided
    if (input.branchIds && input.branchIds.length > 0) {
      const foundBranches = await this.db
        .select({ id: schema.branches.id })
        .from(schema.branches)
        .where(
          and(
            eq(schema.branches.tenantId, tenantId),
            inArray(schema.branches.id, input.branchIds),
          ),
        );

      if (foundBranches.length !== input.branchIds.length) {
        throw new NotFoundException('One or more branches not found in tenant');
      }
    }

    // 3. Validate department scopes if provided
    if (input.departmentIds && input.departmentIds.length > 0) {
      const foundDepts = await this.db
        .select({
          id: schema.departments.id,
          name: schema.departments.name,
          status: schema.departments.status,
        })
        .from(schema.departments)
        .where(
          and(
            eq(schema.departments.tenantId, tenantId),
            inArray(schema.departments.id, input.departmentIds),
          ),
        );

      if (foundDepts.length !== input.departmentIds.length) {
        throw new NotFoundException(
          'One or more departments not found in tenant',
        );
      }

      const inactiveDepts = foundDepts.filter((d) => d.status !== 'ACTIVE');
      if (inactiveDepts.length > 0) {
        throw new BadRequestException(
          'Cannot assign inactive department to membership: ' +
            inactiveDepts.map((d) => d.name).join(', '),
        );
      }

      // Check role-department scoping constraints if role has explicit department mappings
      const [roleRow] = await this.db
        .select({ id: schema.tenantRoles.id, code: schema.tenantRoles.code })
        .from(schema.tenantRoles)
        .where(
          and(
            eq(schema.tenantRoles.tenantId, tenantId),
            eq(schema.tenantRoles.code, input.roleKey),
          ),
        )
        .limit(1);

      if (roleRow) {
        const allowedRoleDepts = await this.db
          .select({ departmentId: schema.roleDepartments.departmentId })
          .from(schema.roleDepartments)
          .where(
            and(
              eq(schema.roleDepartments.tenantId, tenantId),
              eq(schema.roleDepartments.roleId, roleRow.id),
            ),
          );

        if (allowedRoleDepts.length > 0) {
          const allowedDeptSet = new Set(
            allowedRoleDepts.map((r) => r.departmentId),
          );
          const unauthorizedDepts = input.departmentIds.filter(
            (id) => !allowedDeptSet.has(id),
          );
          if (unauthorizedDepts.length > 0) {
            throw new ForbiddenException(
              `Role ${input.roleKey} is not authorized for department(s): ${unauthorizedDepts.join(', ')}`,
            );
          }
        }
      }
    }

    // 4. Atomically insert membership and scopes
    return this.db.transaction(async (tx) => {
      const [membership] = await tx
        .insert(schema.tenantMemberships)
        .values({
          tenantId,
          authUserId: input.authUserId,
          displayName: input.displayName,
          roleKey: input.roleKey,
          status: input.status || 'ACTIVE',
        })
        .returning();

      if (input.branchIds && input.branchIds.length > 0) {
        await tx.insert(schema.membershipBranches).values(
          input.branchIds.map((branchId) => ({
            tenantId,
            membershipId: membership!.id,
            branchId,
          })),
        );
      }

      if (input.departmentIds && input.departmentIds.length > 0) {
        await tx.insert(schema.membershipDepartments).values(
          input.departmentIds.map((departmentId) => ({
            tenantId,
            membershipId: membership!.id,
            departmentId,
          })),
        );
      }

      return membership!;
    });
  }

  /**
   * Updates a staff member's operational status (ACTIVE, SUSPENDED, INACTIVE).
   * Enforces the invariant that a tenant must retain at least one active OWNER.
   *
   * @param tenantId - The UUID of the tenant.
   * @param membershipId - The UUID of the membership to modify.
   * @param status - Target status enum value.
   * @returns Updated tenant membership record.
   * @throws {NotFoundException} If the membership is not found within the tenant.
   * @throws {BadRequestException} If deactivating or suspending the last active OWNER.
   */
  async updateStatus(
    tenantId: string,
    membershipId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE',
  ) {
    const [membership] = await this.db
      .select()
      .from(schema.tenantMemberships)
      .where(
        and(
          eq(schema.tenantMemberships.id, membershipId),
          eq(schema.tenantMemberships.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new NotFoundException('Staff membership not found');
    }

    if (status !== 'ACTIVE' && membership.roleKey === 'OWNER') {
      const activeOwners = await this.db
        .select({ id: schema.tenantMemberships.id })
        .from(schema.tenantMemberships)
        .where(
          and(
            eq(schema.tenantMemberships.tenantId, tenantId),
            eq(schema.tenantMemberships.roleKey, 'OWNER'),
            eq(schema.tenantMemberships.status, 'ACTIVE'),
          ),
        );

      if (activeOwners.length <= 1) {
        throw new BadRequestException(
          'Cannot deactivate the last active OWNER of the tenant',
        );
      }
    }

    const [updated] = await this.db
      .update(schema.tenantMemberships)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.tenantMemberships.id, membershipId),
          eq(schema.tenantMemberships.tenantId, tenantId),
        ),
      )
      .returning();

    return updated!;
  }

  /**
   * Removes a staff member from the tenant.
   * Enforces the invariant that a tenant must retain at least one active OWNER.
   * Cleans up all branch and department associations atomically.
   *
   * @param tenantId - The UUID of the tenant.
   * @param membershipId - The UUID of the membership to remove.
   * @returns Deleted membership record.
   * @throws {NotFoundException} If the membership is not found within the tenant.
   * @throws {BadRequestException} If attempting to remove the last active OWNER.
   */
  async remove(tenantId: string, membershipId: string) {
    const [membership] = await this.db
      .select()
      .from(schema.tenantMemberships)
      .where(
        and(
          eq(schema.tenantMemberships.id, membershipId),
          eq(schema.tenantMemberships.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new NotFoundException('Staff membership not found');
    }

    if (membership.roleKey === 'OWNER') {
      const activeOwners = await this.db
        .select({ id: schema.tenantMemberships.id })
        .from(schema.tenantMemberships)
        .where(
          and(
            eq(schema.tenantMemberships.tenantId, tenantId),
            eq(schema.tenantMemberships.roleKey, 'OWNER'),
            eq(schema.tenantMemberships.status, 'ACTIVE'),
          ),
        );

      if (activeOwners.length <= 1) {
        throw new BadRequestException(
          'Cannot remove the last active OWNER of the tenant',
        );
      }
    }

    return this.db.transaction(async (tx) => {
      await tx
        .delete(schema.membershipBranches)
        .where(
          and(
            eq(schema.membershipBranches.tenantId, tenantId),
            eq(schema.membershipBranches.membershipId, membershipId),
          ),
        );

      await tx
        .delete(schema.membershipDepartments)
        .where(
          and(
            eq(schema.membershipDepartments.tenantId, tenantId),
            eq(schema.membershipDepartments.membershipId, membershipId),
          ),
        );

      const [deleted] = await tx
        .delete(schema.tenantMemberships)
        .where(
          and(
            eq(schema.tenantMemberships.id, membershipId),
            eq(schema.tenantMemberships.tenantId, tenantId),
          ),
        )
        .returning();

      return deleted!;
    });
  }
}
