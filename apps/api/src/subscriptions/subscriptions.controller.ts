import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionGuard } from '../auth/guards/session.guard.js';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard.js';
import { PermissionGuard } from '../auth/guards/permission.guard.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { CurrentActor } from '../auth/decorators/current-actor.decorator.js';
import type { ActorContext } from '../auth/actor-context.js';
import { SubscriptionsService } from './subscriptions.service.js';
import { PERMISSION_KEYS } from '../access-control/permissions.js';
import type {
  CreateCheckoutDto,
  CheckoutSessionDto,
  SubscriptionPlanDto,
  TenantSubscriptionDto,
  SubscriptionInvoiceDto,
  CursorPage,
} from '@repo/shared';

/**
 * @description Controller handling tenant subscription plans, checkout initiation,
 * zero-trust verification, cancellation, and invoice history retrieval.
 */
@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(SessionGuard, TenantScopeGuard, PermissionGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * @description Lists all available subscription plans.
   * @param currency Optional ISO currency code filter.
   * @returns Array of active subscription plans.
   */
  @Get('plans')
  @RequirePermission(PERMISSION_KEYS.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'List available subscription plans' })
  async listPlans(
    @Query('currency') currency?: string,
  ): Promise<SubscriptionPlanDto[]> {
    return this.subscriptionsService.listPlans(currency);
  }

  /**
   * @description Retrieves the current subscription details for the authenticated tenant.
   * @param actor The authenticated owner actor.
   * @returns Current active or trialing subscription record.
   */
  @Get('current')
  @RequirePermission(PERMISSION_KEYS.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'Get current tenant subscription status' })
  async getCurrentSubscription(
    @CurrentActor() actor: ActorContext,
  ): Promise<TenantSubscriptionDto | null> {
    return this.subscriptionsService.getCurrentSubscription(actor.tenantId);
  }

  /**
   * @description Initiates a Flutterwave hosted checkout payment session.
   * @param actor The authenticated owner actor.
   * @param body Plan ID and billing interval.
   * @returns Checkout session details including paymentLink and txRef.
   */
  @Post('checkout')
  @RequirePermission(PERMISSION_KEYS.SUBSCRIPTION_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate Flutterwave hosted checkout session' })
  async createCheckout(
    @CurrentActor() actor: ActorContext,
    @Body() body: CreateCheckoutDto,
  ): Promise<CheckoutSessionDto> {
    return this.subscriptionsService.initiateCheckout(actor, body);
  }

  /**
   * @description Server-side verification of completed payment callback from Flutterwave.
   * @param actor The authenticated owner actor.
   * @param transactionId Flutterwave transaction ID.
   * @param txRef Deterministic transaction reference.
   * @returns Updated tenant subscription record.
   */
  @Get('verify')
  @RequirePermission(PERMISSION_KEYS.SUBSCRIPTION_MANAGE)
  @ApiOperation({ summary: 'Verify Flutterwave payment transaction' })
  async verifyPayment(
    @CurrentActor() actor: ActorContext,
    @Query('transaction_id') transactionId: string,
    @Query('tx_ref') txRef: string,
  ): Promise<TenantSubscriptionDto> {
    return this.subscriptionsService.verifyPayment(actor, {
      transactionId,
      txRef,
    });
  }

  /**
   * @description Cancels the active subscription at the end of the current billing cycle.
   * @param actor The authenticated owner actor.
   * @param body Optional cancellation reason.
   * @returns Cancellation acknowledgement.
   */
  @Post('cancel')
  @RequirePermission(PERMISSION_KEYS.SUBSCRIPTION_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  async cancelSubscription(
    @CurrentActor() actor: ActorContext,
    @Body() body?: { reason?: string },
  ): Promise<{ cancelAtPeriodEnd: boolean }> {
    return this.subscriptionsService.cancelSubscription(actor, body);
  }

  /**
   * @description Lists invoice history for the current tenant.
   * @param actor The authenticated owner actor.
   * @param limit Maximum number of records to return.
   * @returns Paginated invoice list.
   */
  @Get('invoices')
  @RequirePermission(PERMISSION_KEYS.SUBSCRIPTION_READ)
  @ApiOperation({ summary: 'List tenant subscription invoices' })
  async listInvoices(
    @CurrentActor() actor: ActorContext,
    @Query('limit') limit?: number,
  ): Promise<CursorPage<SubscriptionInvoiceDto>> {
    return this.subscriptionsService.listInvoices(actor.tenantId, limit);
  }
}
