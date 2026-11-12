import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
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
import type { CreateRoleDto, UpdateRoleDto } from '@repo/shared';

/**
 * Controller exposing endpoints for permission catalog discovery,
 * dynamic tenant role querying, role creation, updates, and department scoping.
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
   * @returns The tenant's roles list.
   */
  @Get('roles')
  @RequirePermission(PERMISSION_KEYS.ROLES_READ)
  async listRoles(@CurrentActor() actor: ActorContext) {
    return this.accessControlService.listRoles(actor.tenantId);
  }

  /**
   * Creates a new custom role with optional department assignments and permissions.
   *
   * @param actor - The authenticated actor context.
   * @param body - The create role payload.
   * @returns The created role.
   */
  @Post('roles')
  @RequirePermission(PERMISSION_KEYS.ROLES_MANAGE)
  async createRole(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateRoleDto,
  ) {
    return this.accessControlService.createRole(
      actor.tenantId,
      body,
      actor.authUserId,
      actor.membershipId,
    );
  }

  /**
   * Updates an existing role's name, description, permissions, department mappings, or status.
   *
   * @param actor - The authenticated actor context.
   * @param roleId - The UUID of the role to update.
   * @param body - The update role payload.
   * @returns The updated role.
   */
  @Patch('roles/:roleId')
  @RequirePermission(PERMISSION_KEYS.ROLES_MANAGE)
  async updateRole(
    @CurrentActor() actor: ActorContext,
    @Param('roleId') roleId: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.accessControlService.updateRole(
      actor.tenantId,
      roleId,
      body,
      actor.authUserId,
      actor.membershipId,
    );
  }

  /**
   * Deactivates a non-system role.
   *
   * @param actor - The authenticated actor context.
   * @param roleId - The UUID of the role to deactivate.
   * @returns Success response.
   */
  @Delete('roles/:roleId')
  @RequirePermission(PERMISSION_KEYS.ROLES_MANAGE)
  async deleteRole(
    @CurrentActor() actor: ActorContext,
    @Param('roleId') roleId: string,
  ) {
    return this.accessControlService.deleteRole(
      actor.tenantId,
      roleId,
      actor.authUserId,
      actor.membershipId,
    );
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
