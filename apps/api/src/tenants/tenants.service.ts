import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { AuditService } from '../audit/audit.service.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../access-control/permissions.js';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  async onboardTenant(input: {
    tenantName: string;
    branchName?: string;
    departmentName?: string;
    actorAuthUserId: string;
    userEmail: string;
    userName: string;
  }) {
    return this.db.transaction(async (tx) => {
      // 1. Create tenant
      const [tenant] = await tx
        .insert(schema.tenants)
        .values({
          name: input.tenantName,
          status: 'ACTIVE',
          subscriptionTier: 'STANDARD',
          subscriptionStatus: 'ACTIVE',
          defaultCurrency: 'USD',
          settings: {},
        })
        .returning();

      // 2. Create primary branch
      const [branch] = await tx
        .insert(schema.branches)
        .values({
          tenantId: tenant.id,
          name: input.branchName || 'Main Branch',
          code: 'MAIN',
          timezone: 'UTC',
          status: 'ACTIVE',
        })
        .returning();

      // 3. Create default department baseline for the tenant
      const defaultDepartments = [
        { name: 'Reception', type: 'RECEPTION' },
        { name: 'Production', type: 'PRODUCTION' },
        { name: 'Disbursement', type: 'DISBURSEMENT' },
        { name: 'Store', type: 'STORE' },
      ] as const;

      const createdDepartments = await Promise.all(
        defaultDepartments.map(async ({ name, type }) =>
          tx
            .insert(schema.departments)
            .values({
              tenantId: tenant.id,
              branchId: branch.id,
              type,
              name,
              status: 'ACTIVE',
            })
            .returning(),
        ),
      );

      const departmentsByName = new Map(
        createdDepartments.flat().map((department) => [department.name, department]),
      );
      const ownerDepartmentIds = [
        departmentsByName.get('Reception')?.id,
        departmentsByName.get('Production')?.id,
        departmentsByName.get('Disbursement')?.id,
        departmentsByName.get('Store')?.id,
      ].filter((id): id is string => Boolean(id));

      // 4. Create OWNER membership
      const [membership] = await tx
        .insert(schema.tenantMemberships)
        .values({
          tenantId: tenant.id,
          authUserId: input.actorAuthUserId,
          displayName: input.userName || input.userEmail,
          roleKey: 'OWNER',
          status: 'ACTIVE',
        })
        .returning();

      // 5. Create branch assignment
      await tx.insert(schema.membershipBranches).values({
        tenantId: tenant.id,
        membershipId: membership.id,
        branchId: branch.id,
      });

      // 6. Create department assignment for the owner across the baseline departments
      await tx.insert(schema.membershipDepartments).values(
        ownerDepartmentIds.map((departmentId) => ({
          tenantId: tenant.id,
          membershipId: membership.id,
          departmentId,
        })),
      );

      // 7. Seed default role/permission catalogue for the tenant
      const rolePermissions = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(
        ([roleKey, permissions]) =>
          permissions.map((permissionKey) => ({
            tenantId: tenant.id,
            roleKey,
            permissionKey,
          })),
      );

      if (rolePermissions.length > 0) {
        await tx.insert(schema.rolePermissions).values(rolePermissions);
      }

      await this.auditService.log({
        tenantId: tenant.id,
        actorAuthUserId: input.actorAuthUserId,
        actorMembershipId: membership.id,
        action: 'tenant:onboard',
        subjectType: 'tenant',
        subjectId: tenant.id,
        requestId: 'internal',
        summary: { tenantName: tenant.name },
      });

      return {
        tenant,
        branch,
        departments: createdDepartments.flat(),
        membership,
      };
    });
  }
}
