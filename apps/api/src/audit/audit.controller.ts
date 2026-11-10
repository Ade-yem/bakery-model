import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { AuditService } from './audit.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('audit-events')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.AUDIT_READ)
  async list(@CurrentActor() actor: ActorContext, @Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.auditService.list(actor.tenantId, lim);
  }
}
