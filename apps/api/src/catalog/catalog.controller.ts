import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { CatalogService } from './catalog.service.js';
import { CreateCatalogItemDto } from './dto/catalog.dto.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

/**
 * Controller exposing endpoints for master catalog inventory items.
 */
@ApiTags('Catalog')
@ApiCookieAuth('better-auth.session_token')
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant UUID for multi-tenant context resolution',
  required: false,
})
@Controller('items')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Lists all catalog items registered in the active tenant.
   *
   * @param actor - The authenticated actor context.
   * @returns Array of catalog item records.
   */
  @Get()
  @RequirePermission(PERMISSION_KEYS.ITEMS_READ)
  @ApiOperation({
    summary: 'List catalog items',
    description:
      'Retrieves all inventory items (raw materials, finished goods, packaging) for the tenant.',
  })
  @ApiOkResponse({
    description: 'List of catalog items.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks items:read permission.',
  })
  async list(@CurrentActor() actor: ActorContext) {
    return this.catalogService.list(actor.tenantId);
  }

  /**
   * Registers a new item in the tenant master catalog.
   *
   * @param actor - The authenticated actor context.
   * @param body - The item creation payload.
   * @returns The created catalog item record.
   */
  @Post()
  @RequirePermission(PERMISSION_KEYS.ITEMS_MANAGE)
  @ApiOperation({
    summary: 'Create a catalog item',
    description:
      'Registers a new raw material, finished product, or packaging item with unique SKU and unit of measure.',
  })
  @ApiCreatedResponse({
    description: 'Catalog item created successfully.',
  })
  @ApiConflictResponse({
    description: 'An item with this SKU already exists in the tenant.',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication is required.',
  })
  @ApiForbiddenResponse({
    description: 'Caller lacks items:manage permission.',
  })
  async create(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateCatalogItemDto,
  ) {
    return this.catalogService.create(actor.tenantId, actor, body);
  }
}
