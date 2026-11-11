import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { DepartmentsService, CreateDepartmentInput, UpdateDepartmentInput } from './departments.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for tenant department catalog management.
 */
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
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateDepartmentInput,
  ) {
    return this.departmentsService.create(actor.tenantId, body);
  }

  /**
   * Updates an existing department's name or status (active/inactive).
   *
   * @param actor - The authenticated actor context.
   * @param departmentId - UUID of the department to update.
   * @param body - The update payload (name, status).
   * @returns The updated department.
   */
  @Patch(':departmentId')
  @RequirePermission(PERMISSION_KEYS.DEPARTMENTS_MANAGE)
  async update(
    @CurrentActor() actor: ActorContext,
    @Param('departmentId') departmentId: string,
    @Body() body: UpdateDepartmentInput,
  ) {
    return this.departmentsService.update(actor.tenantId, departmentId, body);
  }
}
