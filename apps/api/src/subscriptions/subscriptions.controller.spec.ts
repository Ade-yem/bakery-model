import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsService } from './subscriptions.service.js';
import type { ActorContext } from '../auth/actor-context.js';
import type { TenantSubscriptionDto } from '@repo/shared';

describe('SubscriptionsController (Unit)', () => {
  let controller: SubscriptionsController;
  let mockService: Partial<SubscriptionsService>;

  const mockActor: ActorContext = {
    userId: 'user-owner-1',
    tenantId: '11111111-1111-1111-1111-111111111111',
    email: 'owner@bakery.com',
    name: 'Artisan Owner',
    role: 'OWNER',
    permissions: ['subscription:read', 'subscription:manage'],
    branchIds: [],
    departmentIds: [],
  };

  beforeEach(() => {
    mockService = {
      listPlans: vi.fn().mockResolvedValue([
        {
          id: 'plan-1',
          code: 'STARTER_MONTHLY',
          name: 'Starter',
          tier: 'STARTER',
          priceAmount: '15000.00',
          currency: 'NGN',
          interval: 'MONTHLY',
          maxBranches: 1,
          maxStaff: 5,
          active: true,
        },
      ]),
      getCurrentSubscription: vi.fn().mockResolvedValue({
        id: 'sub-1',
        tenantId: mockActor.tenantId,
        planId: 'plan-1',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      }),
      initiateCheckout: vi.fn().mockResolvedValue({
        paymentLink: 'https://checkout.flutterwave.com/pay/mock',
        txRef: 'SUB-11111111-STARTER_MONTHLY-12345',
        invoiceId: 'inv-1',
      }),
      verifyPayment: vi.fn().mockResolvedValue({
        id: 'sub-1',
        tenantId: mockActor.tenantId,
        status: 'ACTIVE',
      } as unknown as TenantSubscriptionDto),
      cancelSubscription: vi.fn().mockResolvedValue({
        cancelAtPeriodEnd: true,
      }),
      listInvoices: vi.fn().mockResolvedValue({
        data: [],
        page: { limit: 20, nextCursor: null },
      }),
    };

    controller = new SubscriptionsController(
      mockService as SubscriptionsService,
    );
  });

  it('GET /subscriptions/plans returns plan catalog', async () => {
    const plans = await controller.listPlans();
    expect(plans).toHaveLength(1);
    expect(plans[0].code).toBe('STARTER_MONTHLY');
    expect(mockService.listPlans).toHaveBeenCalledTimes(1);
  });

  it('GET /subscriptions/current returns current subscription', async () => {
    const sub = await controller.getCurrentSubscription(mockActor);
    expect(sub?.status).toBe('ACTIVE');
    expect(mockService.getCurrentSubscription).toHaveBeenCalledWith(
      mockActor.tenantId,
    );
  });

  it('POST /subscriptions/checkout delegates to service', async () => {
    const res = await controller.createCheckout(mockActor, {
      planId: 'plan-1',
      interval: 'MONTHLY',
    });
    expect(res.paymentLink).toBe('https://checkout.flutterwave.com/pay/mock');
    expect(mockService.initiateCheckout).toHaveBeenCalledWith(mockActor, {
      planId: 'plan-1',
      interval: 'MONTHLY',
    });
  });

  it('GET /subscriptions/verify verifies payment', async () => {
    const res = await controller.verifyPayment(
      mockActor,
      '998877',
      'SUB-tx-ref',
    );
    expect(res.status).toBe('ACTIVE');
    expect(mockService.verifyPayment).toHaveBeenCalledWith(mockActor, {
      transactionId: '998877',
      txRef: 'SUB-tx-ref',
    });
  });

  it('POST /subscriptions/cancel initiates cancellation', async () => {
    const res = await controller.cancelSubscription(mockActor, {
      reason: 'Downsizing',
    });
    expect(res.cancelAtPeriodEnd).toBe(true);
    expect(mockService.cancelSubscription).toHaveBeenCalledWith(mockActor, {
      reason: 'Downsizing',
    });
  });
});
