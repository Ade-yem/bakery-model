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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { VALID_PERMISSIONS, PERMISSION_KEYS } from './permissions.js';
import { AccessControlService } from './access-control.service.js';
import {
  CreateRoleSwaggerDto,
  UpdateRoleSwaggerDto,
  UpdateRolePermissionsSwaggerDto,
  CloneRoleSwaggerDto,
} from './dto/access-control.dto.js';

/**
 * Controller exposing endpoints for permission catalog discovery,
 * dynamic tenant role querying, role creation, updates, and department scoping.
 */
@ApiTags('Access Control')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
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
  @ApiOperation({
    summary: 'Discover all supported permission keys',
    description:
      'Returns the static canonical set of all fine-grained permission keys supported by the system.',
  })
  @ApiOkResponse({
    description: 'Array of valid permission keys.',
  })
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
  @ApiOperation({
    summary: 'List tenant roles',
    description:
      'Retrieves all first-class system and custom roles with their permissions and department mappings.',
  })
  @ApiOkResponse({
    description: 'Array of tenant role definitions.',
  })
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
  @ApiOperation({
    summary: 'Create a custom tenant role',
    description:
      'Creates a custom role code within the tenant with specific permission keys and department scope restrictions.',
  })
  @ApiCreatedResponse({
    description: 'Role created successfully.',
  })
  @ApiConflictResponse({
    description: 'Role code already exists within this tenant.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid permission keys or invalid department references.',
  })
  async createRole(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateRoleSwaggerDto,
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
  @ApiOperation({
    summary: 'Update a tenant role',
    description:
      'Updates custom role attributes, department scope mappings, or operational status.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID of the role to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Role updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Role not found in tenant.',
  })
  @ApiForbiddenResponse({
    description: 'Cannot modify protected system roles (e.g. OWNER).',
  })
  async updateRole(
    @CurrentActor() actor: ActorContext,
    @Param('roleId') roleId: string,
    @Body() body: UpdateRoleSwaggerDto,
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
  @ApiOperation({
    summary: 'Delete or deactivate a role',
    description:
      'Removes or deactivates a custom role. System protected roles (e.g. OWNER) cannot be deleted.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'UUID of the role to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Role successfully deleted.',
  })
  @ApiForbiddenResponse({
    description: 'Cannot delete system role.',
  })
  @ApiNotFoundResponse({
    description: 'Role not found in tenant.',
  })
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
  @ApiOperation({
    summary: 'Set permissions for role',
    description:
      'Overwrites permission keys assigned to a specific role identifier in the tenant.',
  })
  @ApiParam({
    name: 'roleKey',
    description: 'Role code (e.g. MANAGER, CASHIER)',
    example: 'MANAGER',
  })
  @ApiOkResponse({
    description: 'Role permissions updated successfully.',
  })
  async updateRolePermissions(
    @CurrentActor() actor: ActorContext,
    @Param('roleKey') roleKey: string,
    @Body() body: UpdateRolePermissionsSwaggerDto,
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
  @ApiOperation({
    summary: 'Clone an existing role',
    description:
      'Creates a new custom role by duplicating the permissions and department mappings of a baseline role.',
  })
  @ApiCreatedResponse({
    description: 'Role cloned successfully.',
  })
  @ApiConflictResponse({
    description: 'Target cloned role code already exists.',
  })
  async cloneRole(
    @CurrentActor() actor: ActorContext,
    @Body() body: CloneRoleSwaggerDto,
  ) {
    return this.accessControlService.cloneRole(
      actor.tenantId,
      body,
      actor.authUserId,
      actor.membershipId,
    );
  }
}
