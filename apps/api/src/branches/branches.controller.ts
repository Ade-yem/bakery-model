import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { BranchesService } from './branches.service.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for managing bakery physical branches and facility locations.
 */
@ApiTags('Branches')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('branches')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  /**
   * Lists all branches belonging to the caller's active tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns Array of branch records.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.BRANCHES_READ)
  @ApiOperation({
    summary: 'List tenant branches',
    description:
      'Retrieves all physical or operational branch locations registered under the authenticated tenant.',
  })
  @ApiOkResponse({
    description: 'List of branch records.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description:
      'Caller does not have an active membership in the tenant or lacks branches:read permission.',
  })
  async list(@CurrentActor() actor: ActorContext) {
    return this.branchesService.list(actor.tenantId);
  }

  /**
   * Creates a new branch location for the tenant.
   *
   * @param actor - The authenticated actor context.
   * @param body - Branch parameters including title, unique code, and timezone.
   * @returns The created branch record.
   */
  @Post()
  @RequirePermission(PERMISSION_KEYS.BRANCHES_MANAGE)
  @ApiOperation({
    summary: 'Create a new branch',
    description:
      'Registers a new physical facility or kiosk location with unique branch code in the tenant.',
  })
  @ApiCreatedResponse({
    description: 'Branch created successfully.',
  })
  @ApiConflictResponse({
    description: 'A branch with this code already exists in the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description:
      'Caller lacks branches:manage permission or tenant write access.',
  })
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateBranchDto,
  ) {
    return this.branchesService.create(actor.tenantId, body);
  }
}
