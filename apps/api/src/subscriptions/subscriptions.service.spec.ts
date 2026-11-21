import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SubscriptionsService } from './subscriptions.service.js';
import { FlutterwaveService } from './flutterwave.service.js';
import { AuditService } from '../audit/audit.service.js';
import { HttpException } from '@nestjs/common';
import type { ActorContext } from '../auth/actor-context.js';
import type { Database } from '../database/database.types.js';

describe('SubscriptionsService (Unit)', () => {
  let service: SubscriptionsService;
  let mockFlwService: Partial<FlutterwaveService>;
  let mockAuditService: Partial<AuditService>;
  let mockDb: Record<string, unknown>;

  const mockTenantId = '11111111-1111-1111-1111-111111111111';
  const mockPlan = {
    id: '22222222-2222-2222-2222-222222222222',
    code: 'STARTER_MONTHLY',
    name: 'Starter Monthly',
    tier: 'STARTER',
    description: 'Starter plan',
    priceAmount: '15000.00',
    currency: 'NGN',
    interval: 'MONTHLY',
    maxBranches: 1,
    maxStaff: 5,
    active: true,
  };

  const mockActor = {
    userId: 'user-owner-1',
    authUserId: 'user-owner-1',
    membershipId: 'membership-owner-1',
    requestId: 'req-mock-1',
    tenantId: mockTenantId,
    email: 'owner@bakery.com',
    name: 'Artisan Owner',
    role: 'OWNER',
    permissions: ['subscription:manage', 'subscription:read'],
  };

  beforeEach(() => {
    mockFlwService = {
      createPaymentSession: vi.fn().mockResolvedValue({
        link: 'https://checkout.flutterwave.com/pay/mock-session',
      }),
      verifyTransaction: vi.fn(),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    // In-memory mock database implementation for Drizzle query interface
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) =>
        cb(mockDb),
      ),
    };

    service = new SubscriptionsService(
      mockDb as unknown as Database,
      mockFlwService as FlutterwaveService,
      mockAuditService as AuditService,
    );
  });

  // TEST-SUB-SVC-001 — Plan Catalog Retrieval
  it('TEST-SUB-SVC-001: retrieves active subscription plans', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([mockPlan]),
        }),
      }),
    });

    const plans = await service.listPlans();
    expect(plans).toHaveLength(1);
    expect(plans[0].code).toBe('STARTER_MONTHLY');
  });

  // TEST-SUB-SVC-002 — Checkout Initiation & Pending Invoice Creation
  it('TEST-SUB-SVC-002: creates pending invoice and returns Flutterwave checkout URL', async () => {
    // 1. Plan query mock
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockPlan]),
        }),
      }),
    });

    // 2. Insert invoice mock
    const createdInvoice = {
      id: 'inv-12345',
      invoiceNumber: 'INV-2026-0001',
      amount: '15000.00',
      currency: 'NGN',
      status: 'PENDING',
      txRef: `SUB-${mockTenantId.slice(0, 8)}-STARTER_MONTHLY-123`,
    };

    mockDb.insert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdInvoice]),
      }),
    });

    const result = await service.initiateCheckout(
      mockActor as unknown as ActorContext,
      {
        planId: mockPlan.id,
        interval: 'MONTHLY',
      },
    );

    expect(result.paymentLink).toBe(
      'https://checkout.flutterwave.com/pay/mock-session',
    );
    expect(result.invoiceId).toBe('inv-12345');
    expect(mockFlwService.createPaymentSession).toHaveBeenCalledTimes(1);

    const flwPayload = vi.mocked(mockFlwService.createPaymentSession!).mock
      .calls[0][0];
    expect(flwPayload.amount).toBe('15000.00');
    expect(flwPayload.currency).toBe('NGN');
    expect(flwPayload.customer.email).toBe('owner@bakery.com');
  });

  // TEST-SUB-SVC-003 — Server-Side Verification Success
  it('TEST-SUB-SVC-003: verifies transaction server-side and activates subscription', async () => {
    const pendingInvoice = {
      id: 'inv-12345',
      tenantId: mockTenantId,
      planId: mockPlan.id,
      invoiceNumber: 'INV-2026-0001',
      amount: '15000.00',
      currency: 'NGN',
      status: 'PENDING',
      txRef: 'SUB-test-tx-ref-123',
    };

    // Mock query for invoice and plan (and subsequent getCurrentSubscription queries)
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([pendingInvoice]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPlan]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'sub-789',
                tenantId: mockTenantId,
                planId: mockPlan.id,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
                cancelAtPeriodEnd: false,
              },
            ]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPlan]),
          }),
        }),
      });

    // Mock Flutterwave verify response
    vi.mocked(mockFlwService.verifyTransaction!).mockResolvedValue({
      id: 998877,
      tx_ref: 'SUB-test-tx-ref-123',
      flw_ref: 'FLW-REF-998877',
      amount: 15000,
      currency: 'NGN',
      status: 'successful',
      payment_type: 'card',
      card: { token: 'card_token_123' },
    });

    // Mock invoice update
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    // Mock tenant_subscriptions upsert
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'sub-789',
              status: 'ACTIVE',
              planId: mockPlan.id,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
            },
          ]),
        }),
      }),
    });

    const result = await service.verifyPayment(
      mockActor as unknown as ActorContext,
      {
        transactionId: '998877',
        txRef: 'SUB-test-tx-ref-123',
      },
    );

    expect(result.status).toBe('ACTIVE');
    expect(mockAuditService.log).toHaveBeenCalledTimes(1);
  });

  // TEST-SUB-SVC-004 — Verification Tamper Rejection (Amount/Currency Mismatch)
  it('TEST-SUB-SVC-004: rejects verification when Flutterwave returns amount mismatch', async () => {
    const pendingInvoice = {
      id: 'inv-12345',
      tenantId: mockTenantId,
      planId: mockPlan.id,
      amount: '15000.00',
      currency: 'NGN',
      status: 'PENDING',
      txRef: 'SUB-test-tx-ref-123',
    };

    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([pendingInvoice]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPlan]),
          }),
        }),
      });

    // Flutterwave verified amount is less than expected invoice
    vi.mocked(mockFlwService.verifyTransaction!).mockResolvedValue({
      id: 998877,
      tx_ref: 'SUB-test-tx-ref-123',
      flw_ref: 'FLW-REF-998877',
      amount: 5000, // Tampered or insufficient amount!
      currency: 'NGN',
      status: 'successful',
    });

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    await expect(
      service.verifyPayment(mockActor as unknown as ActorContext, {
        transactionId: '998877',
        txRef: 'SUB-test-tx-ref-123',
      }),
    ).rejects.toThrow(HttpException);
  });

  // TEST-SUB-SVC-005 — Subscription Cancellation at Period End
  it('TEST-SUB-SVC-005: marks subscription for cancellation at period end', async () => {
    const activeSub = {
      id: 'sub-789',
      tenantId: mockTenantId,
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([activeSub]),
        }),
      }),
    });

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const res = await service.cancelSubscription(
      mockActor as unknown as ActorContext,
      {
        reason: 'Cost restructuring',
      },
    );

    expect(res.cancelAtPeriodEnd).toBe(true);
    expect(mockAuditService.log).toHaveBeenCalledTimes(1);
  });
});
