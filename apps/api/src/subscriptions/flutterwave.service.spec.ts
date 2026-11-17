import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  FlutterwaveService,
  FlutterwaveApiError,
} from './flutterwave.service.js';

describe('FlutterwaveService (Unit)', () => {
  let service: FlutterwaveService;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    service = new FlutterwaveService({
      secretKey: 'FLWSECK_TEST-mock-secret-key',
      baseUrl: 'https://api.flutterwave.com/v3',
      timeoutMs: 5000,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // TEST-SUB-FLW-001 — Successful Checkout Session Creation
  it('TEST-SUB-FLW-001: creates hosted checkout session and returns payment link', async () => {
    const mockResponse = {
      status: 'success',
      message: 'Hosted Link',
      data: {
        link: 'https://checkout.flutterwave.com/v3/hosted/pay/mock123',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    globalThis.fetch = fetchMock;

    const result = await service.createPaymentSession({
      tx_ref: 'SUB-test-tenant-12345',
      amount: '15000.00',
      currency: 'NGN',
      redirect_url: 'https://app.tallybakery.com/billing/callback',
      customer: {
        email: 'owner@bakery.com',
        name: 'Amina Bello',
      },
      customizations: {
        title: 'TallyBakery Starter Monthly',
        description: 'Monthly subscription for 1 branch',
      },
    });

    expect(result.link).toBe(
      'https://checkout.flutterwave.com/v3/hosted/pay/mock123',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe('https://api.flutterwave.com/v3/payments');
    expect(calledInit.method).toBe('POST');
    expect(calledInit.headers['Authorization']).toBe(
      'Bearer FLWSECK_TEST-mock-secret-key',
    );
    expect(calledInit.headers['Content-Type']).toBe('application/json');

    const sentBody = JSON.parse(calledInit.body);
    expect(sentBody.tx_ref).toBe('SUB-test-tenant-12345');
    expect(sentBody.amount).toBe('15000.00');
    expect(sentBody.currency).toBe('NGN');
  });

  // TEST-SUB-FLW-002 — Flutterwave API Error Handling
  it('TEST-SUB-FLW-002: throws FlutterwaveApiError when provider returns error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        status: 'error',
        message: 'Invalid currency or payment method not supported',
        data: null,
      }),
    });
    globalThis.fetch = fetchMock;

    await expect(
      service.createPaymentSession({
        tx_ref: 'SUB-bad-currency',
        amount: '100',
        currency: 'XYZ',
        redirect_url: 'https://app.tallybakery.com/callback',
        customer: { email: 'bad@cur.com', name: 'Bad Cur' },
      }),
    ).rejects.toThrow(FlutterwaveApiError);
  });

  // TEST-SUB-FLW-003 — Transaction Verification Query
  it('TEST-SUB-FLW-003: queries transaction verification endpoint by ID', async () => {
    const mockVerification = {
      status: 'success',
      message: 'Transaction fetched successfully',
      data: {
        id: 987654,
        tx_ref: 'SUB-tenant-starter-123',
        flw_ref: 'FLW-MOCK-REF-777',
        amount: 15000,
        currency: 'NGN',
        status: 'successful',
        payment_type: 'card',
        card: {
          first_6digits: '553188',
          last_4digits: '1111',
          issuer: 'MASTERCARD',
          token: 'flw_card_token_xyz987',
        },
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockVerification,
    });
    globalThis.fetch = fetchMock;

    const data = await service.verifyTransaction('987654');

    expect(data.status).toBe('successful');
    expect(data.amount).toBe(15000);
    expect(data.currency).toBe('NGN');
    expect(data.tx_ref).toBe('SUB-tenant-starter-123');
    expect(data.card?.token).toBe('flw_card_token_xyz987');

    const [calledUrl, calledInit] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(
      'https://api.flutterwave.com/v3/transactions/987654/verify',
    );
    expect(calledInit.method).toBe('GET');
    expect(calledInit.headers['Authorization']).toBe(
      'Bearer FLWSECK_TEST-mock-secret-key',
    );
  });

  // TEST-SUB-FLW-004 — Missing credentials check
  it('TEST-SUB-FLW-004: throws error when secretKey is not configured', async () => {
    const unconfiguredService = new FlutterwaveService({
      secretKey: undefined,
    });

    await expect(
      unconfiguredService.createPaymentSession({
        tx_ref: 'SUB-no-key',
        amount: '100',
        currency: 'NGN',
        redirect_url: 'https://app.tallybakery.com/callback',
        customer: { email: 'a@b.com', name: 'A B' },
      }),
    ).rejects.toThrow('Missing FLW_SECRET_KEY for Flutterwave request');
  });
});
