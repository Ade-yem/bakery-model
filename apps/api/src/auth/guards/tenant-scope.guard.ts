import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Request } from 'express';
import type { Database } from '../../database/database.types.js';
import * as schema from '../../database/schema/index.js';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PermissionKey,
  ROLE_CEILINGS,
  VALID_PERMISSIONS,
} from '../../access-control/permissions.js';
import type { ActorContext } from '../actor-context.js';
import { RoleKey } from '@repo/shared';

/**
 * Guard that verifies the caller's active tenant membership and enforces
 * branch and department access scopes. Rejects inactive departments and
 * cross-tenant header tampering.
 */
@Injectable()
export class TenantScopeGuard implements CanActivate {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Evaluates whether the request has an active tenant membership and valid selectors.
   *
   * @param context - The execution context of the incoming request.
   * @returns True if the request is authorized within tenant and selector scopes.
   * @throws {UnauthorizedException} If user is unauthenticated.
   * @throws {ForbiddenException} If membership is missing, suspended, or selectors are invalid/inactive.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & {
        user?: { id: string };
        actorContext?: ActorContext;
        id?: string;
      }
    >();

    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication is required',
      });
    }

    const tenantHeader = request.headers['x-tenant-id'];
    const branchHeader = request.headers['x-branch-id'];
    const departmentHeader = request.headers['x-department-id'];

    // Query active membership for user
    const memberships = await this.db
      .select()
      .from(schema.tenantMemberships)
      .where(
        tenantHeader && typeof tenantHeader === 'string'
          ? and(
              eq(schema.tenantMemberships.authUserId, userId),
              eq(schema.tenantMemberships.tenantId, tenantHeader),
              eq(schema.tenantMemberships.status, 'ACTIVE'),
            )
          : and(
              eq(schema.tenantMemberships.authUserId, userId),
              eq(schema.tenantMemberships.status, 'ACTIVE'),
            ),
      );

    if (!memberships.length) {
      throw new ForbiddenException({
        code: 'ACTIVE_TENANT_REQUIRED',
        message: 'No active tenant membership found for caller',
      });
    }

    const membership = memberships[0]!;

    // Check tenant active/suspended status
    const [tenantRecord] = await this.db
      .select({ id: schema.tenants.id, status: schema.tenants.status })
      .from(schema.tenants)
      .where(eq(schema.tenants.id, membership.tenantId));

    if (tenantRecord?.status === 'SUSPENDED') {
      const path = request.path || request.url || '';
      const method = request.method || 'GET';
      const isSubscriptionRoute = path.includes('/subscriptions');
      const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        method.toUpperCase(),
      );

      if (isMutatingMethod && !isSubscriptionRoute) {
        throw new ForbiddenException({
          code: 'ACTIVE_TENANT_REQUIRED',
          message:
            'Tenant is suspended due to past-due subscription. Operational mutations are locked.',
        });
      }
    }

    // Query assigned branch IDs
    const branchRows = await this.db
      .select({ branchId: schema.membershipBranches.branchId })
      .from(schema.membershipBranches)
      .where(eq(schema.membershipBranches.membershipId, membership.id));
    const branchIds = branchRows.map((r) => r.branchId);

    // Query assigned department IDs
    const deptRows = await this.db
      .select({ departmentId: schema.membershipDepartments.departmentId })
      .from(schema.membershipDepartments)
      .where(eq(schema.membershipDepartments.membershipId, membership.id));
    const departmentIds = deptRows.map((r) => r.departmentId);

    // If branch selector header is provided, verify scope
    let activeBranchId: string | undefined = undefined;
    if (branchHeader && typeof branchHeader === 'string') {
      if (membership.roleKey !== 'OWNER' && !branchIds.includes(branchHeader)) {
        throw new ForbiddenException({
          code: 'SCOPE_FORBIDDEN',
          message: 'Branch selector is outside authorized membership branches',
        });
      }
      activeBranchId = branchHeader;
    }

    // If department selector header is provided, verify scope and active status
    let activeDepartmentId: string | undefined = undefined;
    if (departmentHeader && typeof departmentHeader === 'string') {
      // 1. Check department existence and status in caller's tenant
      const [deptRecord] = await this.db
        .select({
          id: schema.departments.id,
          status: schema.departments.status,
        })
        .from(schema.departments)
        .where(
          and(
            eq(schema.departments.id, departmentHeader),
            eq(schema.departments.tenantId, membership.tenantId),
          ),
        );

      if (!deptRecord) {
        throw new ForbiddenException({
          code: 'SCOPE_FORBIDDEN',
          message: 'Department not found in tenant scope',
        });
      }

      // Inactive departments cannot be selected for active operations
      if (deptRecord.status !== 'ACTIVE') {
        throw new ForbiddenException({
          code: 'SCOPE_FORBIDDEN',
          message:
            'Inactive departments cannot be selected for active operations',
        });
      }

      if (
        membership.roleKey !== 'OWNER' &&
        !departmentIds.includes(departmentHeader)
      ) {
        throw new ForbiddenException({
          code: 'SCOPE_FORBIDDEN',
          message:
            'Department selector is outside authorized membership departments',
        });
      }
      activeDepartmentId = departmentHeader;
    }

    // Calculate effective permissions
    const customRoleRows = await this.db
      .select({ permissionKey: schema.rolePermissions.permissionKey })
      .from(schema.rolePermissions)
      .where(
        and(
          eq(schema.rolePermissions.tenantId, membership.tenantId),
          eq(schema.rolePermissions.roleKey, membership.roleKey),
        ),
      );

    const basePermissions: PermissionKey[] =
      customRoleRows.length > 0
        ? (customRoleRows.map((r) => r.permissionKey) as PermissionKey[])
        : DEFAULT_ROLE_PERMISSIONS[membership.roleKey] || [];

    const ceiling = ROLE_CEILINGS[membership.roleKey] || new Set();
    const effectivePermissions = new Set<PermissionKey>();

    for (const perm of basePermissions) {
      if (VALID_PERMISSIONS.has(perm) && ceiling.has(perm)) {
        effectivePermissions.add(perm);
      }
    }

    const actorContext: ActorContext = {
      requestId:
        request.id || (request.headers['x-request-id'] as string) || 'unknown',
      authUserId: userId,
      membershipId: membership.id,
      tenantId: membership.tenantId,
      role: membership.roleKey as RoleKey,
      branchIds,
      departmentIds,
      activeBranchId,
      activeDepartmentId,
      permissions: effectivePermissions,
    };

    request.actorContext = actorContext;
    return true;
  }
}
