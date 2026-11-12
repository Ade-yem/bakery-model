import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service.js';
import {
  VALID_PERMISSIONS,
  ROLE_CEILINGS,
  DEFAULT_ROLE_PERMISSIONS,
  type PermissionKey,
} from './permissions.js';
import type { CreateRoleDto, UpdateRoleDto } from '@repo/shared';

export interface CloneRoleInput {
  sourceRoleKey: string;
  newRoleKey: string;
  newRoleName?: string;
  permissions?: PermissionKey[];
}

/**
 * Service managing dynamic role catalogues, custom roles,
 * department mappings, permission assignments, and system safeguards per tenant.
 */
@Injectable()
export class AccessControlService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Lists the dynamic roles and their currently assigned permissions & department scopes for a tenant.
   *
   * @param tenantId - The UUID of the tenant.
   * @returns An array of role definitions with metadata, permissions, and department mappings.
   */
  async listRoles(tenantId: string) {
    const rolesFromDb = await this.db
      .select()
      .from(schema.tenantRoles)
      .where(eq(schema.tenantRoles.tenantId, tenantId));

    if (!rolesFromDb || rolesFromDb.length === 0) {
      // Fallback for backwards compatibility / unmigrated tenants
      const roleRows = await this.db
        .select({
          roleKey: schema.rolePermissions.roleKey,
          permissionKey: schema.rolePermissions.permissionKey,
        })
        .from(schema.rolePermissions)
        .where(eq(schema.rolePermissions.tenantId, tenantId));

      const legacyRoles: Record<string, string[]> = {};
      if (!roleRows || roleRows.length === 0) {
        for (const [key, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
          legacyRoles[key] = [...perms];
        }
      } else {
        for (const row of roleRows) {
          if (!legacyRoles[row.roleKey]) {
            legacyRoles[row.roleKey] = [];
          }
          legacyRoles[row.roleKey]!.push(row.permissionKey);
        }
      }

      return {
        roles: Object.entries(legacyRoles).map(([code, perms]) => ({
          id: code,
          tenantId,
          code,
          name: code,
          description: null,
          isSystem: code === 'OWNER',
          status: 'ACTIVE' as const,
          permissions: perms,
          departmentIds: [],
        })),
      };
    }

    const perms = await this.db
      .select({
        roleKey: schema.rolePermissions.roleKey,
        permissionKey: schema.rolePermissions.permissionKey,
      })
      .from(schema.rolePermissions)
      .where(eq(schema.rolePermissions.tenantId, tenantId));

    const depts = await this.db
      .select({
        roleId: schema.roleDepartments.roleId,
        departmentId: schema.roleDepartments.departmentId,
      })
      .from(schema.roleDepartments)
      .where(eq(schema.roleDepartments.tenantId, tenantId));

    const permsByRole: Record<string, string[]> = {};
    for (const p of perms) {
      if (!permsByRole[p.roleKey]) permsByRole[p.roleKey] = [];
      permsByRole[p.roleKey]!.push(p.permissionKey);
    }

    const deptsByRole: Record<string, string[]> = {};
    for (const d of depts) {
      if (!deptsByRole[d.roleId]) deptsByRole[d.roleId] = [];
      deptsByRole[d.roleId]!.push(d.departmentId);
    }

    const mapped = rolesFromDb.map((role) => ({
      id: role.id,
      tenantId: role.tenantId,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      status: role.status,
      permissions: permsByRole[role.code] || [],
      departmentIds: deptsByRole[role.id] || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return { roles: mapped };
  }

  /**
   * Creates a new custom role for a tenant with metadata, permissions, and optional department scoping.
   *
   * @param tenantId - The UUID of the tenant.
   * @param input - The role creation parameters.
   * @param actorAuthUserId - Optional actor user ID for audit logging.
   * @param actorMembershipId - Optional membership ID for audit logging.
   * @returns The created role record.
   * @throws {BadRequestException} If any assigned permission is not in VALID_PERMISSIONS.
   * @throws {ConflictException} If the role code already exists in the tenant.
   */
  async createRole(
    tenantId: string,
    input: CreateRoleDto,
    actorAuthUserId?: string,
    actorMembershipId?: string,
  ) {
    // 1. Validate permissions against allowlist
    const invalidPerms = input.permissions.filter(
      (p) => !VALID_PERMISSIONS.has(p as PermissionKey),
    );
    if (invalidPerms.length > 0) {
      throw new BadRequestException(
        `Unknown permission key: ${invalidPerms.join(', ')}`,
      );
    }

    // 2. Validate unique code within tenant
    const existing = await this.db
      .select({ id: schema.tenantRoles.id })
      .from(schema.tenantRoles)
      .where(
        and(
          eq(schema.tenantRoles.tenantId, tenantId),
          eq(schema.tenantRoles.code, input.code),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(`Role code already exists: ${input.code}`);
    }

    // 3. Atomically persist role, permissions, and department mappings
    let createdRole: any;
    await this.db.transaction(async (tx) => {
      const [role] = await tx
        .insert(schema.tenantRoles)
        .values({
          tenantId,
          code: input.code,
          name: input.name,
          description: input.description || null,
          isSystem: false,
          status: 'ACTIVE',
        })
        .returning();

      createdRole = role;

      if (input.permissions.length > 0) {
        await tx.insert(schema.rolePermissions).values(
          input.permissions.map((p) => ({
            tenantId,
            roleKey: input.code,
            permissionKey: p,
          })),
        );
      }

      if (input.departmentIds && input.departmentIds.length > 0) {
        await tx.insert(schema.roleDepartments).values(
          input.departmentIds.map((deptId) => ({
            tenantId,
            roleId: role.id,
            departmentId: deptId,
            isPrimary: false,
          })),
        );
      }
    });

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actorAuthUserId || 'system',
      actorMembershipId: actorMembershipId || '00000000-0000-0000-0000-000000000000',
      action: 'role:create',
      subjectType: 'role',
      subjectId: createdRole.id,
      requestId: 'internal',
      summary: { code: input.code, name: input.name },
    });

    return {
      ...createdRole,
      permissions: input.permissions,
      departmentIds: input.departmentIds || [],
    };
  }

  /**
   * Updates an existing role's title, description, permissions, department mappings, or status.
   *
   * @param tenantId - The UUID of the tenant.
   * @param roleId - The UUID of the role to update.
   * @param input - The update fields.
   * @param actorAuthUserId - Optional actor user ID for audit logging.
   * @param actorMembershipId - Optional membership ID for audit logging.
   * @returns The updated role.
   * @throws {NotFoundException} If the role is not found in the tenant.
   * @throws {ForbiddenException} If attempting to deactivate or strip permissions from the system OWNER role.
   */
  async updateRole(
    tenantId: string,
    roleId: string,
    input: UpdateRoleDto,
    actorAuthUserId?: string,
    actorMembershipId?: string,
  ) {
    const [role] = await this.db
      .select()
      .from(schema.tenantRoles)
      .where(
        and(
          eq(schema.tenantRoles.tenantId, tenantId),
          eq(schema.tenantRoles.id, roleId),
        ),
      )
      .limit(1);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem && input.status === 'INACTIVE') {
      throw new ForbiddenException('System OWNER role cannot be deactivated');
    }

    if (input.permissions) {
      const invalidPerms = input.permissions.filter(
        (p) => !VALID_PERMISSIONS.has(p as PermissionKey),
      );
      if (invalidPerms.length > 0) {
        throw new BadRequestException(
          `Unknown permission key: ${invalidPerms.join(', ')}`,
        );
      }
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.tenantRoles)
        .set({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.tenantRoles.tenantId, tenantId),
            eq(schema.tenantRoles.id, roleId),
          ),
        );

      if (input.permissions !== undefined) {
        await tx
          .delete(schema.rolePermissions)
          .where(
            and(
              eq(schema.rolePermissions.tenantId, tenantId),
              eq(schema.rolePermissions.roleKey, role.code),
            ),
          );

        if (input.permissions.length > 0) {
          await tx.insert(schema.rolePermissions).values(
            input.permissions.map((p) => ({
              tenantId,
              roleKey: role.code,
              permissionKey: p,
            })),
          );
        }
      }

      if (input.departmentIds !== undefined) {
        await tx
          .delete(schema.roleDepartments)
          .where(
            and(
              eq(schema.roleDepartments.tenantId, tenantId),
              eq(schema.roleDepartments.roleId, roleId),
            ),
          );

        if (input.departmentIds.length > 0) {
          await tx.insert(schema.roleDepartments).values(
            input.departmentIds.map((deptId) => ({
              tenantId,
              roleId,
              departmentId: deptId,
              isPrimary: false,
            })),
          );
        }
      }
    });

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actorAuthUserId || 'system',
      actorMembershipId: actorMembershipId || '00000000-0000-0000-0000-000000000000',
      action: 'role:update',
      subjectType: 'role',
      subjectId: roleId,
      requestId: 'internal',
      summary: { roleCode: role.code },
    });

    return {
      ...role,
      name: input.name ?? role.name,
      description: input.description ?? role.description,
      status: input.status ?? role.status,
    };
  }

  /**
   * Deactivates a non-system role.
   *
   * @param tenantId - The UUID of the tenant.
   * @param roleId - The UUID of the role to deactivate.
   * @param actorAuthUserId - Optional actor user ID for audit logging.
   * @param actorMembershipId - Optional membership ID for audit logging.
   * @throws {NotFoundException} If the role is not found.
   * @throws {ForbiddenException} If attempting to delete the system OWNER role.
   */
  async deleteRole(
    tenantId: string,
    roleId: string,
    actorAuthUserId?: string,
    actorMembershipId?: string,
  ) {
    const [role] = await this.db
      .select()
      .from(schema.tenantRoles)
      .where(
        and(
          eq(schema.tenantRoles.tenantId, tenantId),
          eq(schema.tenantRoles.id, roleId),
        ),
      )
      .limit(1);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System OWNER role cannot be deleted or deactivated');
    }

    await this.db
      .update(schema.tenantRoles)
      .set({
        status: 'INACTIVE',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.tenantRoles.tenantId, tenantId),
          eq(schema.tenantRoles.id, roleId),
        ),
      );

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actorAuthUserId || 'system',
      actorMembershipId: actorMembershipId || '00000000-0000-0000-0000-000000000000',
      action: 'role:deactivate',
      subjectType: 'role',
      subjectId: roleId,
      requestId: 'internal',
      summary: { roleCode: role.code },
    });

    return { success: true };
  }

  /**
   * Assigns explicit department scopes to a role.
   *
   * @param tenantId - The UUID of the tenant.
   * @param roleId - The UUID of the role.
   * @param departmentIds - Array of department IDs to link.
   * @returns Array of assigned department IDs.
   */
  async assignRoleDepartments(
    tenantId: string,
    roleId: string,
    departmentIds: string[],
  ): Promise<string[]> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.roleDepartments)
        .where(
          and(
            eq(schema.roleDepartments.tenantId, tenantId),
            eq(schema.roleDepartments.roleId, roleId),
          ),
        );

      if (departmentIds.length > 0) {
        await tx.insert(schema.roleDepartments).values(
          departmentIds.map((deptId) => ({
            tenantId,
            roleId,
            departmentId: deptId,
            isPrimary: false,
          })),
        );
      }
    });

    return departmentIds;
  }

  /**
   * Updates permissions assigned to a role for a tenant.
   */
  async updateRolePermissions(
    tenantId: string,
    roleKey: string,
    permissions: PermissionKey[],
    actorAuthUserId?: string,
    actorMembershipId?: string,
  ) {
    const invalidPerms = permissions.filter((p) => !VALID_PERMISSIONS.has(p));
    if (invalidPerms.length > 0) {
      throw new BadRequestException(
        `Unknown permission key: ${invalidPerms.join(', ')}`,
      );
    }

    const ceiling = ROLE_CEILINGS[roleKey];
    if (ceiling) {
      const ceilingViolations = permissions.filter((p) => !ceiling.has(p));
      if (ceilingViolations.length > 0) {
        throw new ForbiddenException(
          `Permissions exceed ceiling for role: ${ceilingViolations.join(', ')}`,
        );
      }
    }

    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.rolePermissions)
        .where(
          and(
            eq(schema.rolePermissions.tenantId, tenantId),
            eq(schema.rolePermissions.roleKey, roleKey),
          ),
        );

      if (permissions.length > 0) {
        await tx.insert(schema.rolePermissions).values(
          permissions.map((permissionKey) => ({
            tenantId,
            roleKey,
            permissionKey,
          })),
        );
      }
    });

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actorAuthUserId || 'system',
      actorMembershipId: actorMembershipId || '00000000-0000-0000-0000-000000000000',
      action: 'role:permissions:update',
      subjectType: 'role',
      subjectId: roleKey,
      requestId: 'internal',
      summary: { roleKey, permissionCount: permissions.length },
    });

    return { roleKey, permissions };
  }

  /**
   * Clones an existing role into a new custom role within the source role's ceiling.
   */
  async cloneRole(
    tenantId: string,
    input: CloneRoleInput,
    actorAuthUserId?: string,
    actorMembershipId?: string,
  ) {
    const sourceCeiling = ROLE_CEILINGS[input.sourceRoleKey];
    if (!sourceCeiling) {
      throw new NotFoundException(`Source role not found: ${input.sourceRoleKey}`);
    }

    let targetPermissions: PermissionKey[];
    if (input.permissions && input.permissions.length > 0) {
      const invalidPerms = input.permissions.filter((p) => !VALID_PERMISSIONS.has(p));
      if (invalidPerms.length > 0) {
        throw new BadRequestException(
          `Unknown permission key: ${invalidPerms.join(', ')}`,
        );
      }
      const ceilingViolations = input.permissions.filter((p) => !sourceCeiling.has(p));
      if (ceilingViolations.length > 0) {
        throw new ForbiddenException(
          `Permissions exceed ceiling for source role: ${ceilingViolations.join(', ')}`,
        );
      }
      targetPermissions = input.permissions;
    } else {
      targetPermissions = DEFAULT_ROLE_PERMISSIONS[input.sourceRoleKey] || [];
    }

    const existing = await this.db
      .select({ roleKey: schema.rolePermissions.roleKey })
      .from(schema.rolePermissions)
      .where(
        and(
          eq(schema.rolePermissions.tenantId, tenantId),
          eq(schema.rolePermissions.roleKey, input.newRoleKey),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(`Role key already exists: ${input.newRoleKey}`);
    }

    await this.db.insert(schema.rolePermissions).values(
      targetPermissions.map((permissionKey) => ({
        tenantId,
        roleKey: input.newRoleKey,
        permissionKey,
      })),
    );

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actorAuthUserId || 'system',
      actorMembershipId: actorMembershipId || '00000000-0000-0000-0000-000000000000',
      action: 'role:clone',
      subjectType: 'role',
      subjectId: input.newRoleKey,
      requestId: 'internal',
      summary: {
        sourceRoleKey: input.sourceRoleKey,
        newRoleKey: input.newRoleKey,
        newRoleName: input.newRoleName,
      },
    });

    return {
      roleKey: input.newRoleKey,
      baseRoleKey: input.sourceRoleKey,
      permissions: targetPermissions,
    };
  }
}
