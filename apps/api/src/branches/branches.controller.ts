import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { BranchesService } from './branches.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('branches')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.BRANCHES_READ)
  async list(@CurrentActor() actor: ActorContext) {
    return this.branchesService.list(actor.tenantId);
  }

  @Post()
  @RequirePermission(PERMISSION_KEYS.BRANCHES_MANAGE)
  async create(@CurrentActor() actor: ActorContext, @Body() body: { name: string; code: string; timezone?: string }) {
    return this.branchesService.create(actor.tenantId, body);
  }
}
