import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCookieAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/customer.dto.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for customer management and credit ceilings.
 */
@ApiTags('Customers')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('customers')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Lists all customers for the caller's active tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns Array of customer records.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.CUSTOMERS_READ)
  @ApiOperation({
    summary: 'List tenant customers',
    description:
      'Retrieves all registered wholesale or retail account customers for the tenant.',
  })
  @ApiOkResponse({
    description: 'List of customer records.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks customers:read permission.',
  })
  async list(@CurrentActor() actor: ActorContext) {
    return this.customersService.list(actor.tenantId);
  }

  /**
   * Registers a new customer profile with credit ceiling controls.
   *
   * @param actor - The authenticated actor context.
   * @param body - The customer creation payload.
   * @returns The created customer record.
   */
  @Post()
  @RequirePermission(PERMISSION_KEYS.CUSTOMERS_MANAGE)
  @ApiOperation({
    summary: 'Create a customer profile',
    description:
      'Registers a customer with contact details and optional credit ceiling threshold for ledger orders.',
  })
  @ApiCreatedResponse({
    description: 'Customer profile created successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks customers:manage permission.',
  })
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateCustomerDto,
  ) {
    return this.customersService.create(actor.tenantId, actor, body);
  }
}
