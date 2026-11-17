import {
  Controller,
  Get,
  Post,
  Patch,
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
import { DepartmentsService } from './departments.service.js';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/department.dto.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for tenant department catalog management.
 */
@ApiTags('Departments')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('departments')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  /**
   * Lists all departments belonging to the caller's active tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns Array of department records.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.DEPARTMENTS_READ)
  @ApiOperation({
    summary: 'List tenant departments',
    description:
      'Retrieves all departments across all branches in the caller active tenant.',
  })
  @ApiOkResponse({
    description: 'List of department records.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description:
      'Caller lacks departments:read permission or active tenant scope.',
  })
  async list(@CurrentActor() actor: ActorContext) {
    return this.departmentsService.list(actor.tenantId);
  }

  /**
   * Creates a new department within the tenant and specified branch.
   *
   * @param actor - The authenticated actor context.
   * @param body - The department creation payload.
   * @returns The newly created department.
   */
  @Post()
  @RequirePermission(PERMISSION_KEYS.DEPARTMENTS_MANAGE)
  @ApiOperation({
    summary: 'Create a new department',
    description:
      'Creates a department associated with a specified branch. Department codes must be unique per branch.',
  })
  @ApiCreatedResponse({
    description: 'Department created successfully.',
  })
  @ApiConflictResponse({
    description: 'Department code already exists within the target branch.',
  })
  @ApiNotFoundResponse({
    description: 'Referenced branch does not exist in the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks departments:manage permission.',
  })
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(actor.tenantId, body);
  }

  /**
   * Updates an existing department's name, description, code, or status (active/inactive).
   *
   * @param actor - The authenticated actor context.
   * @param departmentId - UUID of the department to update.
   * @param body - The update payload (name, status, etc.).
   * @returns The updated department.
   */
  @Patch(':departmentId')
  @RequirePermission(PERMISSION_KEYS.DEPARTMENTS_MANAGE)
  @ApiOperation({
    summary: 'Update department details or status',
    description:
      'Updates department metadata or operational status. Inactive departments cannot be selected for shifts or new memberships.',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'UUID of the department to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Department updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Department not found in the caller tenant.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid status transition or validation failure.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks departments:manage permission.',
  })
  async update(
    @CurrentActor() actor: ActorContext,
    @Param('departmentId') departmentId: string,
    @Body() body: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(actor.tenantId, departmentId, body);
  }
}
