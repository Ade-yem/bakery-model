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
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto } from './dto/supplier.dto.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for vendor and raw-material supplier records.
 */
@ApiTags('Suppliers')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('suppliers')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  /**
   * Lists all suppliers for the caller's active tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns Array of supplier records.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.SUPPLIERS_READ)
  @ApiOperation({
    summary: 'List tenant suppliers',
    description:
      'Retrieves all registered ingredient, flour, packaging, and equipment suppliers.',
  })
  @ApiOkResponse({
    description: 'List of supplier records.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks suppliers:read permission.',
  })
  async list(@CurrentActor() actor: ActorContext) {
    return this.suppliersService.list(actor.tenantId);
  }

  /**
   * Registers a new supplier record in the directory.
   *
   * @param actor - The authenticated actor context.
   * @param body - The supplier creation payload.
   * @returns The created supplier record.
   */
  @Post()
  @RequirePermission(PERMISSION_KEYS.SUPPLIERS_MANAGE)
  @ApiOperation({
    summary: 'Create a supplier profile',
    description:
      'Registers a new raw materials or consumables vendor with contact details and external references.',
  })
  @ApiCreatedResponse({
    description: 'Supplier created successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks suppliers:manage permission.',
  })
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateSupplierDto,
  ) {
    return this.suppliersService.create(actor.tenantId, actor, body);
  }
}
