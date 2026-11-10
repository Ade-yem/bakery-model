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
import { CatalogService } from './catalog.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('items')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.ITEMS_READ)
  async list(@CurrentActor() actor: ActorContext) {
    return this.catalogService.list(actor.tenantId);
  }

  @Post()
  @RequirePermission(PERMISSION_KEYS.ITEMS_MANAGE)
  async create(
    @CurrentActor() actor: ActorContext,
    @Body()
    body: {
      itemType: string;
      sku: string;
      name: string;
      category?: string;
      uom: string;
      sellingPrice?: string;
      currency?: string;
    },
  ) {
    return this.catalogService.create(actor.tenantId, actor, body);
  }
}
