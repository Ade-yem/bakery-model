import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import {
  VALID_PERMISSIONS,
  PERMISSION_KEYS,
  type PermissionKey,
} from './permissions.js';
import { AccessControlService, CloneRoleInput } from './access-control.service.js';

/**
 * Controller exposing endpoints for permission catalog discovery,
 * dynamic tenant role querying, role permission modification, and role cloning.
 */
@Controller()
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  /**
   * Retrieves the approved fixed permission catalog allowlist.
   *
   * @returns Array of valid permission keys.
   */
  @Get('permissions')
  @RequirePermission(PERMISSION_KEYS.ROLES_READ)
  async listPermissions() {
    return { permissions: Array.from(VALID_PERMISSIONS) };
  }

  /**
   * Lists the dynamic roles and assigned permissions for the current tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns The tenant's roles map.
   */
  @Get('roles')
  @RequirePermission(PERMISSION_KEYS.ROLES_READ)
  async listRoles(@CurrentActor() actor: ActorContext) {
    return this.accessControlService.listRoles(actor.tenantId);
  }

  /**
   * Updates permissions assigned to a role for the caller's tenant.
   *
   * @param actor - The authenticated actor context.
   * @param roleKey - The role identifier.
   * @param body - The array of permissions to assign.
   * @returns The updated roleKey and permissions.
   */
  @Put('roles/:roleKey/permissions')
  @RequirePermission(PERMISSION_KEYS.ROLES_MANAGE)
  async updateRolePermissions(
    @CurrentActor() actor: ActorContext,
    @Param('roleKey') roleKey: string,
    @Body() body: { permissions: PermissionKey[] },
  ) {
    return this.accessControlService.updateRolePermissions(
      actor.tenantId,
      roleKey,
      body.permissions,
      actor.authUserId,
      actor.membershipId,
    );
  }

  /**
   * Clones an existing role into a custom role for the caller's tenant.
   *
   * @param actor - The authenticated actor context.
   * @param body - The clone payload including source role and custom permissions.
   * @returns The newly created custom role summary.
   */
  @Post('roles/clone')
  @RequirePermission(PERMISSION_KEYS.ROLES_MANAGE)
  async cloneRole(
    @CurrentActor() actor: ActorContext,
    @Body() body: CloneRoleInput,
  ) {
    return this.accessControlService.cloneRole(
      actor.tenantId,
      body,
      actor.authUserId,
      actor.membershipId,
    );
  }
}
