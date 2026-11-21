import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCookieAuth,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { AuditService } from './audit.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for immutable tenant operational audit logs.
 */
@ApiTags('Audit')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('audit-events')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Retrieves the immutable audit log for the caller tenant.
   *
   * @param actor - The authenticated actor context.
   * @param limit - Optional maximum number of records to return (defaults to 50).
   * @returns Chronological array of audit event entries.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.AUDIT_READ)
  @ApiOperation({
    summary: 'List tenant audit events',
    description:
      'Retrieves chronological append-only audit trail records tracking operations, actor IDs, request IDs, and subject summaries.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of audit events to return (default: 50)',
    required: false,
    type: Number,
    example: 50,
  })
  @ApiOkResponse({
    description: 'List of audit event records.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks audit:read permission.',
  })
  async list(
    @CurrentActor() actor: ActorContext,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.auditService.list(actor.tenantId, lim);
  }
}
