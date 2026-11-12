import {
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { and, desc, eq } from 'drizzle-orm';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { FlutterwaveService } from './flutterwave.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { ActorContext } from '../auth/actor-context.js';
import {
  ERROR_CODES,
  type CreateCheckoutDto,
  type CheckoutSessionDto,
  type SubscriptionPlanDto,
  type TenantSubscriptionDto,
  type SubscriptionInvoiceDto,
  type VerifySubscriptionDto,
  type CursorPage,
} from '@repo/shared';

/**
 * @description Service orchestrating subscription plans, checkout flows, zero-trust verification,
 * grace period evaluations, and lifecycle updates for multi-tenant billing.
 */
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly flutterwave: FlutterwaveService,
    private readonly audit: AuditService,
  ) {}

  /**
   * @description Retrieves all active subscription plans matching optional currency filter.
   * @param currency Optional ISO-3 currency code (e.g. NGN, USD).
   * @returns Array of active subscription plan contracts.
   */
  async listPlans(currency?: string): Promise<SubscriptionPlanDto[]> {
    const conditions = [eq(schema.subscriptionPlans.active, true)];
    if (currency) {
      conditions.push(eq(schema.subscriptionPlans.currency, currency));
    }

    const rows = await this.db
      .select()
      .from(schema.subscriptionPlans)
      .where(and(...conditions))
      .orderBy(schema.subscriptionPlans.priceAmount);

    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      tier: r.tier as SubscriptionPlanDto['tier'],
      description: r.description,
      priceAmount: r.priceAmount,
      currency: r.currency,
      interval: r.interval as SubscriptionPlanDto['interval'],
      maxBranches: r.maxBranches,
      maxStaff: r.maxStaff,
      active: r.active,
    }));
  }

  /**
   * @description Fetches current subscription details and plan allocations for a tenant.
   * @param tenantId UUID of the target tenant.
   * @returns Current tenant subscription with linked plan details or null if not yet provisioned.
   */
  async getCurrentSubscription(
    tenantId: string,
  ): Promise<TenantSubscriptionDto | null> {
    const [sub] = await this.db
      .select()
      .from(schema.tenantSubscriptions)
      .where(eq(schema.tenantSubscriptions.tenantId, tenantId))
      .limit(1);

    if (!sub) {
      return null;
    }

    const [plan] = await this.db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.id, sub.planId))
      .limit(1);

    return {
      id: sub.id,
      tenantId: sub.tenantId,
      planId: sub.planId,
      status: sub.status as TenantSubscriptionDto['status'],
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      gracePeriodEnd: sub.gracePeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      plan: plan
        ? {
            id: plan.id,
            code: plan.code,
            name: plan.name,
            tier: plan.tier as SubscriptionPlanDto['tier'],
            description: plan.description,
            priceAmount: plan.priceAmount,
            currency: plan.currency,
            interval: plan.interval as SubscriptionPlanDto['interval'],
            maxBranches: plan.maxBranches,
            maxStaff: plan.maxStaff,
            active: plan.active,
          }
        : undefined,
    };
  }

  /**
   * @description Initiates a Flutterwave hosted checkout session for a selected subscription plan.
   * Creates a pending invoice record and generates a collision-resistant deterministic tx_ref.
   * @param actor The authenticated owner actor initiating checkout.
   * @param dto Payload with plan ID and optional billing interval.
   * @returns Checkout session details including paymentLink, txRef, and invoiceId.
   * @throws {HttpException} If plan does not exist or Flutterwave session generation fails.
   */
  async initiateCheckout(
    actor: ActorContext,
    dto: CreateCheckoutDto,
  ): Promise<CheckoutSessionDto> {
    const [plan] = await this.db
      .select()
      .from(schema.subscriptionPlans)
      .where(
        and(
          eq(schema.subscriptionPlans.id, dto.planId),
          eq(schema.subscriptionPlans.active, true),
        ),
      )
      .limit(1);

    if (!plan) {
      throw new HttpException(
        {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Selected subscription plan not found or inactive',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const timestamp = Date.now();
    const shortTenant = actor.tenantId.slice(0, 8);
    const txRef = `SUB-${shortTenant}-${plan.code}-${timestamp}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;

    const [invoice] = await this.db
      .insert(schema.subscriptionInvoices)
      .values({
        tenantId: actor.tenantId,
        planId: plan.id,
        invoiceNumber,
        amount: plan.priceAmount,
        currency: plan.currency,
        status: 'PENDING',
        txRef,
      })
      .returning();

    const redirectUrl = process.env.CLIENT_BASE_URL
      ? `${process.env.CLIENT_BASE_URL}/settings/billing/callback`
      : 'http://localhost:5173/settings/billing/callback';

    const actorRecord = actor as unknown as Record<string, unknown>;
    let customerEmail =
      typeof actorRecord.email === 'string' ? actorRecord.email : undefined;
    let customerName =
      typeof actorRecord.name === 'string' ? actorRecord.name : undefined;
    if (!customerEmail) {
      const [u] = await this.db
        .select({ email: schema.user.email, name: schema.user.name })
        .from(schema.user)
        .where(eq(schema.user.id, actor.authUserId));
      customerEmail = u?.email || 'owner@tallybakery.local';
      customerName = u?.name || 'Bakery Owner';
    }

    try {
      const flwSession = await this.flutterwave.createPaymentSession({
        tx_ref: txRef,
        amount: plan.priceAmount,
        currency: plan.currency,
        redirect_url: redirectUrl,
        customer: {
          email: customerEmail,
          name: customerName || '',
        },
        customizations: {
          title: `TallyBakery — ${plan.name}`,
          description:
            plan.description ||
            `Subscription to ${plan.name} (${plan.interval})`,
        },
        meta: {
          tenantId: actor.tenantId,
          planId: plan.id,
          invoiceId: invoice.id,
        },
      });

      return {
        paymentLink: flwSession.link,
        txRef,
        invoiceId: invoice.id,
      };
    } catch (error) {
      this.logger.error('Failed to create Flutterwave checkout session', error);
      throw new HttpException(
        {
          code: ERROR_CODES.DEPENDENCY_UNAVAILABLE,
          message: 'Unable to initiate checkout with payment gateway',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * @description Zero-trust server-side transaction verification with Flutterwave.
   * Asserts payment status, amount, and currency, then atomically activates the subscription.
   * @param actor The authenticated owner actor verifying payment.
   * @param dto Payload with transaction ID and transaction reference (txRef).
   * @returns Updated tenant subscription contract.
   * @throws {HttpException} If transaction verification fails or details mismatch.
   */
  async verifyPayment(
    actor: ActorContext,
    dto: VerifySubscriptionDto,
  ): Promise<TenantSubscriptionDto> {
    const [invoice] = await this.db
      .select()
      .from(schema.subscriptionInvoices)
      .where(
        and(
          eq(schema.subscriptionInvoices.tenantId, actor.tenantId),
          eq(schema.subscriptionInvoices.txRef, dto.txRef),
        ),
      )
      .limit(1);

    if (!invoice) {
      throw new HttpException(
        {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Invoice matching transaction reference not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (invoice.status === 'PAID') {
      const current = await this.getCurrentSubscription(actor.tenantId);
      if (current) return current;
    }

    const [plan] = await this.db
      .select()
      .from(schema.subscriptionPlans)
      .where(eq(schema.subscriptionPlans.id, invoice.planId))
      .limit(1);

    const verifiedTx = await this.flutterwave.verifyTransaction(
      dto.transactionId,
    );

    const isSuccessful = verifiedTx.status === 'successful';
    const amountMatches = Number(verifiedTx.amount) >= Number(invoice.amount);
    const currencyMatches = verifiedTx.currency === invoice.currency;
    const refMatches = verifiedTx.tx_ref === invoice.txRef;

    if (!isSuccessful || !amountMatches || !currencyMatches || !refMatches) {
      await this.db
        .update(schema.subscriptionInvoices)
        .set({
          status: 'FAILED',
          failureReason: `Verification mismatch: status=${verifiedTx.status}, amount=${verifiedTx.amount}/${invoice.amount}, cur=${verifiedTx.currency}/${invoice.currency}`,
        })
        .where(eq(schema.subscriptionInvoices.id, invoice.id));

      throw new HttpException(
        {
          code: ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
          message:
            'Payment verification failed: Amount, currency, or status mismatch',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    const periodDays = plan?.interval === 'YEARLY' ? 365 : 30;
    const periodEnd = new Date(now.getTime() + periodDays * 86400000);

    await this.db.transaction(async (tx) => {
      // 1. Mark invoice as paid
      await tx
        .update(schema.subscriptionInvoices)
        .set({
          status: 'PAID',
          flwRef: verifiedTx.flw_ref,
          flwTransactionId: String(verifiedTx.id),
          paymentMethod: verifiedTx.payment_type || 'card',
          paidAt: now,
        })
        .where(eq(schema.subscriptionInvoices.id, invoice.id));

      // 2. Upsert tenant subscription
      await tx
        .insert(schema.tenantSubscriptions)
        .values({
          tenantId: actor.tenantId,
          planId: invoice.planId,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          flwCustomerToken: verifiedTx.card?.token,
        })
        .onConflictDoUpdate({
          target: schema.tenantSubscriptions.tenantId,
          set: {
            planId: invoice.planId,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            flwCustomerToken: verifiedTx.card?.token,
            updatedAt: now,
          },
        });

      // 3. Sync tenants denormalized columns
      if (plan) {
        await tx
          .update(schema.tenants)
          .set({
            subscriptionTier: plan.tier,
            subscriptionStatus: 'ACTIVE',
            status: 'ACTIVE',
            updatedAt: now,
          })
          .where(eq(schema.tenants.id, actor.tenantId));
      }
    });

    await this.audit.log({
      tenantId: actor.tenantId,
      actorAuthUserId: actor.authUserId || 'system',
      actorMembershipId: actor.membershipId || 'system',
      action: 'TENANT_SUBSCRIPTION_ACTIVATED',
      subjectType: 'tenant_subscriptions',
      subjectId: invoice.tenantId,
      requestId: actor.requestId || 'internal',
      summary: {
        invoiceId: invoice.id,
        txRef: invoice.txRef,
        planCode: plan?.code,
        periodEnd: periodEnd.toISOString(),
      },
    });

    const updated = await this.getCurrentSubscription(actor.tenantId);
    return updated!;
  }

  /**
   * @description Cancels an active subscription at the end of the current billing cycle.
   * @param actor The authenticated owner actor.
   * @param input Optional cancellation reason.
   * @returns Updated cancellation status.
   */
  async cancelSubscription(
    actor: ActorContext,
    input?: { reason?: string },
  ): Promise<{ cancelAtPeriodEnd: boolean }> {
    const [sub] = await this.db
      .select()
      .from(schema.tenantSubscriptions)
      .where(eq(schema.tenantSubscriptions.tenantId, actor.tenantId))
      .limit(1);

    if (!sub) {
      throw new HttpException(
        {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'No active subscription found to cancel',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.db
      .update(schema.tenantSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        metadata: {
          ...sub.metadata,
          cancelReason: input?.reason || 'User initiated cancellation',
        },
        updatedAt: new Date(),
      })
      .where(eq(schema.tenantSubscriptions.id, sub.id));

    await this.audit.log({
      tenantId: actor.tenantId,
      actorAuthUserId: actor.authUserId || 'system',
      actorMembershipId: actor.membershipId || 'system',
      action: 'TENANT_SUBSCRIPTION_CANCELLED_PENDING',
      subjectType: 'tenant_subscriptions',
      subjectId: sub.id,
      requestId: actor.requestId || 'internal',
      summary: { reason: input?.reason },
    });

    return { cancelAtPeriodEnd: true };
  }

  /**
   * @description Lists paginated invoice history for a tenant.
   * @param tenantId Target tenant UUID.
   * @param limit Max items to return (capped at 50).
   * @returns Bounded cursor page of subscription invoices.
   */
  async listInvoices(
    tenantId: string,
    limit: number = 20,
  ): Promise<CursorPage<SubscriptionInvoiceDto>> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const rows = await this.db
      .select()
      .from(schema.subscriptionInvoices)
      .where(eq(schema.subscriptionInvoices.tenantId, tenantId))
      .orderBy(desc(schema.subscriptionInvoices.createdAt))
      .limit(safeLimit + 1);

    const hasMore = rows.length > safeLimit;
    const items = hasMore ? rows.slice(0, safeLimit) : rows;

    return {
      data: items.map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        invoiceNumber: r.invoiceNumber,
        amount: r.amount,
        currency: r.currency,
        status: r.status as SubscriptionInvoiceDto['status'],
        txRef: r.txRef,
        flwRef: r.flwRef,
        paymentMethod: r.paymentMethod,
        paidAt: r.paidAt,
        createdAt: r.createdAt,
      })),
      page: {
        limit: safeLimit,
        nextCursor: null,
      },
    };
  }
}
