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
import { CustomersService } from './customers.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

@Controller('customers')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission(PERMISSION_KEYS.CUSTOMERS_READ)
  async list(@CurrentActor() actor: ActorContext) {
    return this.customersService.list(actor.tenantId);
  }

  @Post()
  @RequirePermission(PERMISSION_KEYS.CUSTOMERS_MANAGE)
  async create(
    @CurrentActor() actor: ActorContext,
    @Body()
    body: {
      displayName: string;
      externalReference?: string;
      phone?: string;
      email?: string;
      creditCeiling?: string;
      currency?: string;
    },
  ) {
    return this.customersService.create(actor.tenantId, actor, body);
  }
}
