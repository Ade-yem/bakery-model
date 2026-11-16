import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { and, eq } from 'drizzle-orm';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { FlutterwaveSignatureGuard } from './flutterwave-signature.guard.js';
import { SubscriptionsService } from '../subscriptions/subscriptions.service.js';

/**
 * @description Controller responsible for receiving and processing asynchronous Flutterwave webhooks.
 * Validates requests via FlutterwaveSignatureGuard (verif-hash) and returns HTTP 200 within 5 seconds.
 */
@ApiTags('Webhooks')
@Controller('webhooks')
export class FlutterwaveWebhookController {
  private readonly logger = new Logger(FlutterwaveWebhookController.name);

  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * @description Ingests Flutterwave webhook events (e.g. charge.completed, subscription.cancelled).
   * Stores the raw event in payment_webhook_events, acknowledges with HTTP 200, and asynchronously handles state transitions.
   * @param payload Raw JSON event payload from Flutterwave.
   * @returns Fast acknowledgment object.
   */
  @Post('flutterwave')
  @UseGuards(FlutterwaveSignatureGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ingest Flutterwave payment and subscription webhooks',
  })
  async handleWebhook(
    @Body() payload: Record<string, unknown>,
  ): Promise<{ status: string; duplicate?: boolean }> {
    const data = payload['data'] as Record<string, unknown> | undefined;
    const eventType =
      (payload['event'] as string) ||
      (payload['event.type'] as string) ||
      'unknown';
    const txRef = (data?.tx_ref as string) || undefined;
    const rawId = data?.id ?? payload['id'] ?? txRef ?? 'unknown';
    const eventId =
      typeof rawId === 'string' || typeof rawId === 'number'
        ? String(rawId)
        : 'unknown';

    // 1. Check for duplicate event
    const [existing] = await this.db
      .select()
      .from(schema.paymentWebhookEvents)
      .where(
        and(
          eq(schema.paymentWebhookEvents.eventId, eventId),
          eq(schema.paymentWebhookEvents.status, 'PROCESSED'),
        ),
      )
      .limit(1);

    if (existing) {
      this.logger.log(`Ignoring duplicate webhook event ${eventId}`);
      return { status: 'acknowledged', duplicate: true };
    }

    // 2. Persist raw event record
    const [recordedEvent] = await this.db
      .insert(schema.paymentWebhookEvents)
      .values({
        provider: 'FLUTTERWAVE',
        eventId,
        eventType,
        txRef,
        status: 'RECEIVED',
        payload,
      })
      .returning();

    // 3. Asynchronous processing (or background execution)
    this.processEventAsync(recordedEvent.id, eventId, eventType, payload).catch(
      (err) => {
        this.logger.error(`Error processing webhook event ${eventId}`, err);
      },
    );

    return { status: 'acknowledged' };
  }

  /**
   * @description Background processor updating invoices and subscription records for verified webhook events.
   * @param recordId Webhook event record primary key.
   * @param eventId Provider event ID.
   * @param eventType Event type string.
   * @param payload Full webhook body.
   */
  private async processEventAsync(
    recordId: string,
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      const data = payload['data'] as Record<string, unknown> | undefined;
      if (eventType === 'charge.completed' && data?.status === 'successful') {
        const txRef = data.tx_ref as string | undefined;
        if (txRef) {
          const [invoice] = await this.db
            .select()
            .from(schema.subscriptionInvoices)
            .where(eq(schema.subscriptionInvoices.txRef, txRef))
            .limit(1);

          if (invoice && invoice.status !== 'PAID') {
            await this.subscriptionsService.verifyPayment(
              {
                requestId: 'webhook-' + eventId,
                authUserId: 'system-webhook',
                membershipId: 'system-membership',
                tenantId: invoice.tenantId,
                role: 'OWNER',
                branchIds: [],
                departmentIds: [],
                permissions: new Set(['subscription:manage']),
              },
              {
                transactionId: String(data.id),
                txRef,
              },
            );
          }
        }
      }

      await this.db
        .update(schema.paymentWebhookEvents)
        .set({
          status: 'PROCESSED',
          processedAt: new Date(),
        })
        .where(eq(schema.paymentWebhookEvents.id, recordId));
    } catch (error) {
      this.logger.error(`Failed to process webhook record ${recordId}`, error);
      await this.db
        .update(schema.paymentWebhookEvents)
        .set({
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown processing error',
        })
        .where(eq(schema.paymentWebhookEvents.id, recordId));
    }
  }
}
