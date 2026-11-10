import {
  Controller,
  Get,
  Put,
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
import { StaffService } from './staff.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('staff')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.STAFF_READ)
  async list(@CurrentActor() actor: ActorContext) {
    return this.staffService.list(actor.tenantId);
  }

  @Put(':membershipId/access')
  @RequirePermission(PERMISSION_KEYS.STAFF_MANAGE)
  async updateAccess(
    @CurrentActor() actor: ActorContext,
    @Param('membershipId') membershipId: string,
    @Body()
    body: {
      roleKey?: string;
      customPermissions?: string[];
      branchIds?: string[];
      departmentIds?: string[];
    },
  ) {
    return this.staffService.updateAccess(actor.tenantId, membershipId, body);
  }
}
