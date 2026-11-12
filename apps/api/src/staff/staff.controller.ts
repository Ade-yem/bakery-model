import {
  Controller,
  Get,
  Post,
  Put,
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
import { StaffService } from './staff.service.js';
import {
  CreateStaffDto,
  UpdateStaffAccessDto,
  UpdateStaffStatusDto,
} from './dto/staff.dto.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for staff administration: invitations,
 * role/department access updates, status transitions, and removal.
 */
@ApiTags('Staff')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('staff')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * Retrieves all staff memberships for the authenticated tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns Array of tenant membership records.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.STAFF_READ)
  @ApiOperation({
    summary: 'List tenant staff members',
    description:
      'Retrieves all staff memberships registered in the caller active tenant.',
  })
  @ApiOkResponse({
    description: 'List of staff memberships.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks staff:read permission.',
  })
  async list(@CurrentActor() actor: ActorContext) {
    return this.staffService.list(actor.tenantId);
  }

  /**
   * Creates or invites a new staff member into the tenant.
   *
   * @param actor - The authenticated actor context.
   * @param body - The creation payload including user ID, role, and initial scopes.
   * @returns The created membership record.
   */
  @Post()
  @RequirePermission(PERMISSION_KEYS.STAFF_MANAGE)
  @ApiOperation({
    summary: 'Add or invite a staff member',
    description:
      'Associates a user identity with the tenant, setting assigned role and authorized branch/department scopes.',
  })
  @ApiCreatedResponse({
    description: 'Staff member created successfully.',
  })
  @ApiBadRequestResponse({
    description:
      'User is already a member or attempted to assign an inactive department.',
  })
  @ApiForbiddenResponse({
    description:
      'Role is not authorized for the requested department scope, or caller lacks staff:manage permission.',
  })
  @ApiNotFoundResponse({
    description:
      'Referenced branches or departments do not exist in the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateStaffDto,
  ) {
    return this.staffService.create(actor.tenantId, body);
  }

  /**
   * Updates an existing staff member's role and branch/department access scopes.
   *
   * @param actor - The authenticated actor context.
   * @param membershipId - The UUID of the staff membership to update.
   * @param body - The role and scope assignments.
   * @returns The updated membership record.
   */
  @Put(':membershipId/access')
  @RequirePermission(PERMISSION_KEYS.STAFF_MANAGE)
  @ApiOperation({
    summary: 'Update staff access scopes and role',
    description:
      'Updates role and branch/department mappings atomically. Enforces role permission ceiling checks.',
  })
  @ApiParam({
    name: 'membershipId',
    description: 'UUID of the membership to modify',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Staff access updated successfully.',
  })
  @ApiForbiddenResponse({
    description:
      'Assigned permissions exceed target role ceiling, or role is unauthorized for department.',
  })
  @ApiBadRequestResponse({
    description: 'Attempted to assign an inactive department.',
  })
  @ApiNotFoundResponse({
    description: 'Staff membership or scope reference not found in tenant.',
  })
  async updateAccess(
    @CurrentActor() actor: ActorContext,
    @Param('membershipId') membershipId: string,
    @Body() body: UpdateStaffAccessDto,
  ) {
    return this.staffService.updateAccess(actor.tenantId, membershipId, body);
  }

  /**
   * Updates a staff member's operational status (ACTIVE, SUSPENDED, INACTIVE).
   *
   * @param actor - The authenticated actor context.
   * @param membershipId - The UUID of the staff membership.
   * @param body - Status update payload.
   * @returns The updated membership record.
   */
  @Patch(':membershipId/status')
  @RequirePermission(PERMISSION_KEYS.STAFF_MANAGE)
  @ApiOperation({
    summary: 'Update staff member status',
    description:
      'Updates member operational status. Enforces last-owner protection invariant preventing deactivation of the last active OWNER.',
  })
  @ApiParam({
    name: 'membershipId',
    description: 'UUID of the membership to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Staff status updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Cannot deactivate the last active OWNER of the tenant.',
  })
  @ApiNotFoundResponse({
    description: 'Staff membership not found in tenant.',
  })
  async updateStatus(
    @CurrentActor() actor: ActorContext,
    @Param('membershipId') membershipId: string,
    @Body() body: UpdateStaffStatusDto,
  ) {
    return this.staffService.updateStatus(
      actor.tenantId,
      membershipId,
      body.status,
    );
  }

  /**
   * Removes a staff member from the tenant with last-owner protection.
   *
   * @param actor - The authenticated actor context.
   * @param membershipId - The UUID of the staff membership to remove.
   * @returns The removed membership record.
   */
  @Delete(':membershipId')
  @RequirePermission(PERMISSION_KEYS.STAFF_MANAGE)
  @ApiOperation({
    summary: 'Remove staff member',
    description:
      'Atomically deletes membership and associated branch/department scope assignments. Prevents removal of the last active OWNER.',
  })
  @ApiParam({
    name: 'membershipId',
    description: 'UUID of the membership to remove',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Staff membership deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Cannot remove the last active OWNER of the tenant.',
  })
  @ApiNotFoundResponse({
    description: 'Staff membership not found in tenant.',
  })
  async remove(
    @CurrentActor() actor: ActorContext,
    @Param('membershipId') membershipId: string,
  ) {
    return this.staffService.remove(actor.tenantId, membershipId);
  }
}
