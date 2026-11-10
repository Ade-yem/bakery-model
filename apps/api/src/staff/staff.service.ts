import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and } from 'drizzle-orm';
import {
  ROLE_CEILINGS,
  type RoleKey,
  type PermissionKey,
} from '../access-control/permissions.js';

@Injectable()
export class StaffService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.tenantMemberships)
      .where(eq(schema.tenantMemberships.tenantId, tenantId));
  }

  async updateAccess(
    tenantId: string,
    membershipId: string,
    input: {
      roleKey?: string;
      customPermissions?: string[];
      branchIds?: string[];
      departmentIds?: string[];
    },
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

    const [updated] = await this.db
      .update(schema.tenantMemberships)
      .set({
        roleKey: targetRole,
        updatedAt: new Date(),
      })
      .where(eq(schema.tenantMemberships.id, membershipId))
      .returning();

    return updated;
  }
}
