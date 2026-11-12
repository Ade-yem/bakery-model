import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../access-control/permissions.js';

export interface SeedBaselineResult {
  departments: schema.Department[];
  roles: schema.TenantRole[];
  membership: schema.TenantMembership;
}

/**
 * Service responsible for provisioning the initial starter baseline (departments,
 * roles, permissions, and department scopes) for newly onboarded factory tenants.
 */
@Injectable()
export class TenantTemplateSeederService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Seeds default bakery departments, first-class tenant roles, role-department mappings,
   * role permissions, and assigns the onboarding Owner membership.
   *
   * @param tenantId - The UUID of the newly created tenant.
   * @param branchId - The UUID of the primary branch.
   * @param actorAuthUserId - The authenticated user ID of the tenant owner.
   * @param displayName - Display name or email of the owner.
   * @returns Seeded departments, roles, and owner membership.
   */
  async seedBaseline(
    tenantId: string,
    branchId: string,
    actorAuthUserId: string,
    displayName: string,
  ): Promise<SeedBaselineResult> {
    return this.db.transaction(async (tx) => {
      // 1. Seed default departments
      const defaultDepartments = [
        { name: 'Reception', code: 'REC', type: 'RECEPTION', description: 'Customer order entry & cash collection' },
        { name: 'Production', code: 'PROD', type: 'PRODUCTION', description: 'Bakehouse & manufacturing floor' },
        { name: 'Dispatch', code: 'DISP', type: 'DISPATCH', description: 'Finished goods fulfillment & staging' },
        { name: 'Store', code: 'STORE', type: 'STORE', description: 'Raw materials & packaging warehouse' },
      ];

      const createdDepartments = await Promise.all(
        defaultDepartments.map(async (dept) => {
          const [inserted] = await tx
            .insert(schema.departments)
            .values({
              tenantId,
              branchId,
              name: dept.name,
              code: dept.code,
              type: dept.type,
              description: dept.description,
              status: 'ACTIVE',
            })
            .returning();
          return inserted!;
        }),
      );

      const deptsByCode = new Map(createdDepartments.map((d) => [d.code, d]));

      // 2. Seed default roles in tenant_roles
      const defaultRoles = [
        { code: 'OWNER', name: 'Super Admin (Owner)', description: 'Full organization authority', isSystem: true },
        { code: 'MANAGER', name: 'Shift / Branch Manager', description: 'Facility & procurement management', isSystem: false },
        { code: 'RECEPTIONIST', name: 'Receptionist (Cashier)', description: 'Order billing and customer receipts', isSystem: false },
        { code: 'PRODUCTION_SUPERVISOR', name: 'Production Supervisor', description: 'Batch yield and materials consumption', isSystem: false },
        { code: 'DISPATCH_OFFICER', name: 'Packaging & Dispatch Officer', description: 'Order packing and transfer acceptance', isSystem: false },
      ];

      const createdRoles = await Promise.all(
        defaultRoles.map(async (r) => {
          const [inserted] = await tx
            .insert(schema.tenantRoles)
            .values({
              tenantId,
              code: r.code,
              name: r.name,
              description: r.description,
              isSystem: r.isSystem,
              status: 'ACTIVE',
            })
            .returning();
          return inserted!;
        }),
      );

      const rolesByCode = new Map(createdRoles.map((r) => [r.code, r]));

      // 3. Seed role_departments mapping
      const roleDeptMappings: { roleCode: string; deptCodes: string[] }[] = [
        { roleCode: 'RECEPTIONIST', deptCodes: ['REC'] },
        { roleCode: 'PRODUCTION_SUPERVISOR', deptCodes: ['PROD'] },
        { roleCode: 'DISPATCH_OFFICER', deptCodes: ['DISP', 'STORE'] },
      ];

      const roleDeptRows: { tenantId: string; roleId: string; departmentId: string; isPrimary: boolean }[] = [];
      for (const mapping of roleDeptMappings) {
        const role = rolesByCode.get(mapping.roleCode);
        if (role) {
          for (const deptCode of mapping.deptCodes) {
            const dept = deptsByCode.get(deptCode);
            if (dept) {
              roleDeptRows.push({
                tenantId,
                roleId: role.id,
                departmentId: dept.id,
                isPrimary: false,
              });
            }
          }
        }
      }

      if (roleDeptRows.length > 0) {
        await tx.insert(schema.roleDepartments).values(roleDeptRows);
      }

      // 4. Seed role permissions
      const rolePermissions = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(
        ([roleKey, permissions]) =>
          permissions.map((permissionKey) => ({
            tenantId,
            roleKey,
            permissionKey,
          })),
      );

      if (rolePermissions.length > 0) {
        await tx.insert(schema.rolePermissions).values(rolePermissions);
      }

      // 5. Create OWNER membership
      const [membership] = await tx
        .insert(schema.tenantMemberships)
        .values({
          tenantId,
          authUserId: actorAuthUserId,
          displayName,
          roleKey: 'OWNER',
          status: 'ACTIVE',
        })
        .returning();

      // 6. Assign Owner to primary branch and all departments
      await tx.insert(schema.membershipBranches).values({
        tenantId,
        membershipId: membership!.id,
        branchId,
      });

      await tx.insert(schema.membershipDepartments).values(
        createdDepartments.map((d) => ({
          tenantId,
          membershipId: membership!.id,
          departmentId: d.id,
        })),
      );

      return {
        departments: createdDepartments,
        roles: createdRoles,
        membership: membership!,
      };
    });
  }
}

