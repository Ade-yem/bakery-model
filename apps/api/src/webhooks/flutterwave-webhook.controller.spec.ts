import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FlutterwaveWebhookController } from './flutterwave-webhook.controller.js';
import type { Database } from '../database/database.types.js';
import type { SubscriptionsService } from '../subscriptions/subscriptions.service.js';
import type { TenantSubscriptionDto } from '@repo/shared';

describe('FlutterwaveWebhookController (Unit)', () => {
  let controller: FlutterwaveWebhookController;
  let mockDb: Record<string, unknown>;
  let mockSubscriptionsService: Partial<SubscriptionsService>;

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'event-log-1' }]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    mockSubscriptionsService = {
      verifyPayment: vi
        .fn()
        .mockResolvedValue({} as unknown as TenantSubscriptionDto),
    };

    controller = new FlutterwaveWebhookController(
      mockDb as unknown as Database,
      mockSubscriptionsService as SubscriptionsService,
    );
  });

  it('TEST-SUB-WHK-001: acknowledges valid webhook event immediately with HTTP 200', async () => {
    // Mock check for existing event id (not duplicate) and invoice lookup
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([
                { id: 'inv-1', tenantId: 'tenant-123', status: 'PENDING' },
              ]),
          }),
        }),
      });

    const payload = {
      event: 'charge.completed',
      data: {
        id: 1234567,
        tx_ref: 'SUB-tenant-starter-123',
        flw_ref: 'FLW-MOCK-REF',
        amount: 15000,
        currency: 'NGN',
        status: 'successful',
        customer: { email: 'owner@bakery.com' },
      },
    };

    const response = await controller.handleWebhook(payload);

    expect(response).toEqual({ status: 'acknowledged' });
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it('TEST-SUB-WHK-003: ignores duplicate webhook delivery idempotently', async () => {
    // Mock check returning an already processed event
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue([{ id: 'existing-event', status: 'PROCESSED' }]),
        }),
      }),
    });

    const payload = {
      event: 'charge.completed',
      data: {
        id: 1234567,
        tx_ref: 'SUB-tenant-starter-123',
      },
    };

    const response = await controller.handleWebhook(payload);

    expect(response).toEqual({ status: 'acknowledged', duplicate: true });
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
