import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { DepartmentsService } from './departments.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('departments')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.DEPARTMENTS_READ)
  async list(@CurrentActor() actor: ActorContext) {
    return this.departmentsService.list(actor.tenantId);
  }

  @Post()
  @RequirePermission(PERMISSION_KEYS.DEPARTMENTS_MANAGE)
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: { branchId: string; name: string; type?: 'RECEPTION' | 'PRODUCTION' | 'DISBURSEMENT' | 'STORE' },
  ) {
    return this.departmentsService.create(actor.tenantId, body);
  }
}
