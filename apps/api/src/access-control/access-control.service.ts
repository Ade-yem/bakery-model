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

export interface CloneRoleInput {
  sourceRoleKey: string;
  newRoleKey: string;
  newRoleName?: string;
  permissions?: PermissionKey[];
}

/**
 * Service managing dynamic role catalogues, custom role cloning,
 * permission assignments, and ceiling enforcement per tenant.
 */
@Injectable()
export class AccessControlService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Lists the dynamic roles and their currently assigned permissions for a tenant.
   *
   * @param tenantId - The UUID of the tenant.
   * @returns An object containing the role-to-permissions map.
   */
  async listRoles(tenantId: string): Promise<{ roles: Record<string, string[]> }> {
    const roleRows = await this.db
      .select({
        roleKey: schema.rolePermissions.roleKey,
        permissionKey: schema.rolePermissions.permissionKey,
      })
      .from(schema.rolePermissions)
      .where(eq(schema.rolePermissions.tenantId, tenantId));

    if (!roleRows || roleRows.length === 0) {
      // Fallback to default role permissions if not yet customized
      const defaults: Record<string, string[]> = {};
      for (const [key, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
        defaults[key] = [...perms];
      }
      return { roles: defaults };
    }

    const roles: Record<string, string[]> = {};
    for (const row of roleRows) {
      if (!roles[row.roleKey]) {
        roles[row.roleKey] = [];
      }
      roles[row.roleKey]!.push(row.permissionKey);
    }

    return { roles };
  }

  /**
   * Updates the permissions assigned to a role for a tenant, enforcing allowlists and ceilings.
   *
   * @param tenantId - The UUID of the tenant.
   * @param roleKey - The identifier of the role being modified.
   * @param permissions - Array of permission keys to assign.
   * @param actorAuthUserId - Optional ID of the user performing the update for audit logging.
   * @param actorMembershipId - Optional ID of the membership performing the update.
   * @returns The updated roleKey and permissions.
   * @throws {BadRequestException} If any permission key is not in VALID_PERMISSIONS.
   * @throws {ForbiddenException} If any permission exceeds the role's ceiling.
   */
  async updateRolePermissions(
    tenantId: string,
    roleKey: string,
    permissions: PermissionKey[],
    actorAuthUserId?: string,
    actorMembershipId?: string,
  ) {
    // 1. Validate against fixed approved allowlist
    const invalidPerms = permissions.filter((p) => !VALID_PERMISSIONS.has(p));
    if (invalidPerms.length > 0) {
      throw new BadRequestException(
        `Unknown permission key: ${invalidPerms.join(', ')}`,
      );
    }

    // 2. Enforce immutable role ceiling
    const ceiling = ROLE_CEILINGS[roleKey];
    if (ceiling) {
      const ceilingViolations = permissions.filter((p) => !ceiling.has(p));
      if (ceilingViolations.length > 0) {
        throw new ForbiddenException(
          `Permissions exceed ceiling for role: ${ceilingViolations.join(', ')}`,
        );
      }
    }

    // 3. Persist atomically
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

    // 4. Audit log
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
   *
   * @param tenantId - The UUID of the tenant.
   * @param input - The clone parameters including source role, new key, and optional permissions.
   * @param actorAuthUserId - Optional actor user ID for audit logging.
   * @param actorMembershipId - Optional membership ID for audit logging.
   * @returns The created custom role summary.
   * @throws {NotFoundException} If the source role ceiling is not recognized.
   * @throws {ConflictException} If the new roleKey already exists for this tenant.
   * @throws {BadRequestException} If any custom permission is unknown.
   * @throws {ForbiddenException} If permissions exceed the source role family ceiling.
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

    // 1. Determine target permissions
    let targetPermissions: PermissionKey[];
    if (input.permissions && input.permissions.length > 0) {
      // Validate unknown permissions
      const invalidPerms = input.permissions.filter((p) => !VALID_PERMISSIONS.has(p));
      if (invalidPerms.length > 0) {
        throw new BadRequestException(
          `Unknown permission key: ${invalidPerms.join(', ')}`,
        );
      }
      // Validate ceiling
      const ceilingViolations = input.permissions.filter((p) => !sourceCeiling.has(p));
      if (ceilingViolations.length > 0) {
        throw new ForbiddenException(
          `Permissions exceed ceiling for source role: ${ceilingViolations.join(', ')}`,
        );
      }
      targetPermissions = input.permissions;
    } else {
      // Inherit source role's baseline permissions
      targetPermissions = DEFAULT_ROLE_PERMISSIONS[input.sourceRoleKey] || [];
    }

    // 2. Check for duplicate role key in tenant
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

    // 3. Persist new role permissions
    await this.db.insert(schema.rolePermissions).values(
      targetPermissions.map((permissionKey) => ({
        tenantId,
        roleKey: input.newRoleKey,
        permissionKey,
      })),
    );

    // 4. Audit log
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
