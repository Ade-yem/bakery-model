import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionGuard } from './guards/session.guard.js';
import { TenantScopeGuard } from './guards/tenant-scope.guard.js';
import { PermissionGuard } from './guards/permission.guard.js';
import { RequirePermission } from './decorators/require-permission.decorator.js';
import { CurrentActor } from './decorators/current-actor.decorator.js';
import type { ActorContext } from './actor-context.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('test-guarded')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class TestGuardedController {
  @Get('tenant')
  @RequirePermission(PERMISSION_KEYS.TENANT_READ)
  getTenantScope(@CurrentActor() actor: ActorContext) {
    return {
      tenantId: actor.tenantId,
      role: actor.role,
      activeBranchId: actor.activeBranchId,
      activeDepartmentId: actor.activeDepartmentId,
    };
  }

  @Get('branch-manage')
  @RequirePermission(PERMISSION_KEYS.BRANCHES_MANAGE)
  getBranchManageScope(@CurrentActor() actor: ActorContext) {
    return {
      canManage: true,
      activeBranchId: actor.activeBranchId,
    };
  }
}
