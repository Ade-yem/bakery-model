import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getDrizzleToken } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import { configureApp } from '../src/app.config.js';
import { AppModule } from '../src/app.module.js';
import { FlutterwaveService } from '../src/subscriptions/flutterwave.service.js';
import type { Database } from '../src/database/database.types.js';
import * as schema from '../src/database/schema/index.js';

describe('Subscription Billing & Flutterwave E2E Lifecycle Suite', () => {
  let app: INestApplication;
  let db: Database;
  let ownerCookie: string;
  let tenantId: string;
  let _branchId: string;
  let starterPlanId: string;

  const mockFlwService = {
    createPaymentSession: vi.fn().mockResolvedValue({
      link: 'https://checkout.flutterwave.com/pay/mock-e2e-session',
    }),
    verifyTransaction: vi.fn(),
  };

  beforeAll(async () => {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/tallybakery';
    process.env.NODE_ENV = 'test';
    process.env.BETTER_AUTH_SECRET = 'a'.repeat(32);
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
    process.env.FLW_SECRET_KEY = 'FLWSECK_TEST-mock-e2e-key';
    process.env.FLW_WEBHOOK_HASH = 'test-e2e-webhook-hash-12345';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FlutterwaveService)
      .useValue(mockFlwService)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    db = app.get<Database>(getDrizzleToken());
    await app.init();

    // 1. Register Owner user
    const email = `e2e-sub-owner-${Date.now()}@tallybakery.com`;
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({
        email,
        password: 'Password123!',
        name: 'Bakery Owner E2E',
      });

    ownerCookie = signupRes.headers['set-cookie']?.[0] || '';
    const userId = signupRes.body.user.id;

    // 2. Create Tenant
    const [createdTenant] = await db
      .insert(schema.tenants)
      .values({
        name: 'E2E Bakery Ltd',
        status: 'ACTIVE',
        subscriptionTier: 'STARTER',
        subscriptionStatus: 'TRIALING',
        defaultCurrency: 'NGN',
      })
      .returning();
    tenantId = createdTenant.id;

    // 3. Create initial branch
    const [createdBranch] = await db
      .insert(schema.branches)
      .values({
        tenantId,
        name: 'Main Factory',
        code: 'MAIN',
        timezone: 'Africa/Lagos',
        status: 'ACTIVE',
      })
      .returning();
    _branchId = createdBranch.id;

    // 4. Create Owner Membership
    await db.insert(schema.tenantMemberships).values({
      tenantId,
      authUserId: userId,
      displayName: 'Bakery Owner E2E',
      roleKey: 'OWNER',
      status: 'ACTIVE',
    });

    // 5. Seed Starter Plan for tests if not present
    const [plan] = await db
      .insert(schema.subscriptionPlans)
      .values({
        code: `STARTER_MONTHLY_${Date.now()}`,
        name: 'Starter Monthly E2E',
        tier: 'STARTER',
        description: 'Starter plan for e2e test',
        priceAmount: '15000.00',
        currency: 'NGN',
        interval: 'MONTHLY',
        maxBranches: 1,
        maxStaff: 5,
        active: true,
      })
      .returning();
    starterPlanId = plan.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // TEST-SUB-E2E-001 — Plan Catalog & Current Subscription Discovery
  it('TEST-SUB-E2E-001: owner discovers available plans and current trialing status', async () => {
    // 1. Discover current subscription (initially null or trialing)
    const currentRes = await request(app.getHttpServer())
      .get('/api/v1/subscriptions/current')
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId);

    expect(currentRes.status).toBe(200);

    // 2. Discover plans list
    const plansRes = await request(app.getHttpServer())
      .get('/api/v1/subscriptions/plans?currency=NGN')
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId);

    expect(plansRes.status).toBe(200);
    expect(Array.isArray(plansRes.body)).toBe(true);
    expect(plansRes.body.length).toBeGreaterThanOrEqual(1);

    const foundPlan = plansRes.body.find(
      (p: Record<string, unknown>) => p['id'] === starterPlanId,
    );
    expect(foundPlan).toBeDefined();
    expect(foundPlan.priceAmount).toBe('15000.00');
  });

  // TEST-SUB-E2E-002 — Plan Selection & Checkout Initiation
  let initiatedTxRef: string;
  let initiatedInvoiceId: string;

  it('TEST-SUB-E2E-002: owner initiates checkout, generates pending invoice and Flutterwave link', async () => {
    const checkoutRes = await request(app.getHttpServer())
      .post('/api/v1/subscriptions/checkout')
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId)
      .send({
        planId: starterPlanId,
        interval: 'MONTHLY',
      });

    expect(checkoutRes.status).toBe(200);
    expect(checkoutRes.body.paymentLink).toBe(
      'https://checkout.flutterwave.com/pay/mock-e2e-session',
    );
    expect(checkoutRes.body.txRef).toMatch(/^SUB-/);
    expect(checkoutRes.body.invoiceId).toBeDefined();

    initiatedTxRef = checkoutRes.body.txRef;
    initiatedInvoiceId = checkoutRes.body.invoiceId;

    // Verify invoice was persisted in PENDING status
    const [invoice] = await db
      .select()
      .from(schema.subscriptionInvoices)
      .where(eq(schema.subscriptionInvoices.id, initiatedInvoiceId));

    expect(invoice).toBeDefined();
    expect(invoice.status).toBe('PENDING');
    expect(invoice.amount).toBe('15000.00');
  });

  // TEST-SUB-E2E-003 — Payment Callback & Zero-Trust Verification Loop
  it('TEST-SUB-E2E-003: client callback triggers server verification and activates subscription', async () => {
    // Mock Flutterwave verify response matching pending invoice
    mockFlwService.verifyTransaction.mockResolvedValueOnce({
      id: 88776655,
      tx_ref: initiatedTxRef,
      flw_ref: 'FLW-E2E-VERIFY-REF',
      amount: 15000,
      currency: 'NGN',
      status: 'successful',
      payment_type: 'card',
      card: { token: 'card_tok_e2e_999' },
    });

    const verifyRes = await request(app.getHttpServer())
      .get(
        `/api/v1/subscriptions/verify?transaction_id=88776655&tx_ref=${initiatedTxRef}`,
      )
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.status).toBe('ACTIVE');

    // Verify invoice transitioned to PAID
    const [invoice] = await db
      .select()
      .from(schema.subscriptionInvoices)
      .where(eq(schema.subscriptionInvoices.id, initiatedInvoiceId));

    expect(invoice.status).toBe('PAID');
    expect(invoice.flwTransactionId).toBe('88776655');

    // Verify tenant record updated to ACTIVE
    const [tenant] = await db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId));

    expect(tenant.subscriptionStatus).toBe('ACTIVE');
  });

  // TEST-SUB-E2E-004 — Webhook Delivery & Subscription Renewal
  it('TEST-SUB-E2E-004: ingests valid Flutterwave webhook and acknowledges immediately', async () => {
    const webhookPayload = {
      event: 'charge.completed',
      data: {
        id: 99001122,
        tx_ref: initiatedTxRef,
        flw_ref: 'FLW-WEBHOOK-RENEW-REF',
        amount: 15000,
        currency: 'NGN',
        status: 'successful',
        customer: { email: 'owner@tallybakery.com' },
      },
    };

    const webhookRes = await request(app.getHttpServer())
      .post('/api/v1/webhooks/flutterwave')
      .set('verif-hash', 'test-e2e-webhook-hash-12345')
      .send(webhookPayload);

    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body.status).toBe('acknowledged');

    // Check webhook record logged in DB
    const [eventRecord] = await db
      .select()
      .from(schema.paymentWebhookEvents)
      .where(eq(schema.paymentWebhookEvents.eventId, '99001122'));

    expect(eventRecord).toBeDefined();
    expect(eventRecord.provider).toBe('FLUTTERWAVE');
  });

  // TEST-SUB-E2E-005 — Subscription Cancellation at Period End
  it('TEST-SUB-E2E-005: allows owner to cancel subscription at period end', async () => {
    const cancelRes = await request(app.getHttpServer())
      .post('/api/v1/subscriptions/cancel')
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId)
      .send({ reason: 'Seasonal bakery closure' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.cancelAtPeriodEnd).toBe(true);

    const [sub] = await db
      .select()
      .from(schema.tenantSubscriptions)
      .where(eq(schema.tenantSubscriptions.tenantId, tenantId));

    expect(sub.cancelAtPeriodEnd).toBe(true);
  });

  // TEST-SUB-E2E-006 — Suspended Tenant Operational Lockout & Reactivation
  it('TEST-SUB-E2E-006: blocks operational mutation for SUSPENDED tenant while allowing billing recovery', async () => {
    // 1. Manually transition tenant to SUSPENDED status
    await db
      .update(schema.tenants)
      .set({ status: 'SUSPENDED', subscriptionStatus: 'SUSPENDED' })
      .where(eq(schema.tenants.id, tenantId));

    // 2. Attempt operational mutation (e.g. creating a catalog item)
    const catalogRes = await request(app.getHttpServer())
      .post('/api/v1/items')
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId)
      .send({
        itemType: 'FINISHED_GOOD',
        sku: 'BREAD-LOAF-01',
        name: 'Artisan Sourdough',
        uom: 'EACH',
        sellingPrice: '5.00',
        currency: 'NGN',
      });

    expect(catalogRes.status).toBe(403);
    expect(catalogRes.body.code).toBe('ACTIVE_TENANT_REQUIRED');

    // 3. Verify owner can still initiate checkout to recover account
    const recoveryRes = await request(app.getHttpServer())
      .post('/api/v1/subscriptions/checkout')
      .set('Cookie', ownerCookie)
      .set('x-tenant-id', tenantId)
      .send({
        planId: starterPlanId,
        interval: 'MONTHLY',
      });

    expect(recoveryRes.status).toBe(200);
    expect(recoveryRes.body.paymentLink).toBeDefined();

    // 4. Restore tenant status to ACTIVE
    await db
      .update(schema.tenants)
      .set({ status: 'ACTIVE', subscriptionStatus: 'ACTIVE' })
      .where(eq(schema.tenants.id, tenantId));
  });
});
