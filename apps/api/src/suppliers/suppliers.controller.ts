import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { SuppliersService } from './suppliers.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('suppliers')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.SUPPLIERS_READ)
  async list(@CurrentActor() actor: ActorContext) {
    return this.suppliersService.list(actor.tenantId);
  }

  @Post()
  @RequirePermission(PERMISSION_KEYS.SUPPLIERS_MANAGE)
  async create(
    @CurrentActor() actor: ActorContext,
    @Body()
    body: {
      name: string;
      externalReference?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
    },
  ) {
    return this.suppliersService.create(actor.tenantId, actor, body);
  }
}
