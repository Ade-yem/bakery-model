import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { FlutterwaveSignatureGuard } from './flutterwave-signature.guard.js';
import type { ExecutionContext } from '@nestjs/common';

describe('FlutterwaveSignatureGuard (Unit)', () => {
  let guard: FlutterwaveSignatureGuard;
  const originalEnv = process.env.FLW_WEBHOOK_HASH;

  beforeEach(() => {
    process.env.FLW_WEBHOOK_HASH = 'super-secret-webhook-hash-12345';
    guard = new FlutterwaveSignatureGuard();
  });

  afterEach(() => {
    process.env.FLW_WEBHOOK_HASH = originalEnv;
  });

  function createMockContext(
    headers: Record<string, string>,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  // TEST-SUB-WHK-001 — Valid Signature Acceptance
  it('TEST-SUB-WHK-001: allows request when verif-hash exactly matches secret hash', () => {
    const context = createMockContext({
      'verif-hash': 'super-secret-webhook-hash-12345',
    });

    const canActivate = guard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  // TEST-SUB-WHK-002 — Invalid or Missing Signature Rejection
  it('TEST-SUB-WHK-002: rejects request when verif-hash is missing', () => {
    const context = createMockContext({});
    expect(() => guard.canActivate(context)).toThrow('Unauthorized');
  });

  it('TEST-SUB-WHK-002 (part 2): rejects request when verif-hash is incorrect', () => {
    const context = createMockContext({
      'verif-hash': 'wrong-hash-attempt-999',
    });
    expect(() => guard.canActivate(context)).toThrow('Forbidden');
  });

  it('TEST-SUB-WHK-002 (part 3): rejects request when server secret is unconfigured', () => {
    delete process.env.FLW_WEBHOOK_HASH;
    const context = createMockContext({
      'verif-hash': 'super-secret-webhook-hash-12345',
    });
    expect(() => guard.canActivate(context)).toThrow('Unauthorized');
  });
});
