import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
  it('normalizes valid configuration', () => {
    expect(
      validateEnvironment({
        NODE_ENV: 'test',
        PORT: '4000',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/tallybakery',
        DATABASE_POOL_MAX: '5',
      }),
    ).toEqual({
      NODE_ENV: 'test',
      PORT: 4000,
      DATABASE_URL: 'postgresql://user:password@localhost:5432/tallybakery',
      DATABASE_POOL_MAX: 5,
      BETTER_AUTH_SECRET:
        'development-default-secret-min-32-characters-needed-now',
      BETTER_AUTH_URL: 'http://localhost:3000',
      TRUSTED_ORIGINS: ['http://localhost:3000', 'http://localhost:5173'],
      FLW_SECRET_KEY: undefined,
      FLW_WEBHOOK_HASH: undefined,
      FLW_V3_BASE_URL: 'https://api.flutterwave.com/v3',
    });
  });

  it('parses Flutterwave configuration when provided', () => {
    expect(
      validateEnvironment({
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/tallybakery',
        FLW_SECRET_KEY: 'FLWSECK_TEST-123',
        FLW_WEBHOOK_HASH: 'flw-secret-hash',
        FLW_V3_BASE_URL: 'https://custom-flw.example.com/v3',
      }),
    ).toMatchObject({
      FLW_SECRET_KEY: 'FLWSECK_TEST-123',
      FLW_WEBHOOK_HASH: 'flw-secret-hash',
      FLW_V3_BASE_URL: 'https://custom-flw.example.com/v3',
    });
  });

  it('rejects a missing database URL', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'test' })).toThrow(
      'DATABASE_URL is required',
    );
  });

  it('rejects a non-PostgreSQL URL', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'test',
        DATABASE_URL: 'mysql://user:password@localhost:3306/tallybakery',
      }),
    ).toThrow('DATABASE_URL must use the postgres or postgresql protocol');
  });

  it('enforces BETTER_AUTH_SECRET in production (TEST-W1-AUTH-008)', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost:5432/db',
        TRUSTED_ORIGINS: 'https://app.tallybakery.com',
      }),
    ).toThrow(/BETTER_AUTH_SECRET/);

    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost:5432/db',
        BETTER_AUTH_SECRET: 'short',
        TRUSTED_ORIGINS: 'https://app.tallybakery.com',
      }),
    ).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('enforces TRUSTED_ORIGINS in production (TEST-W1-AUTH-008)', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost:5432/db',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
      }),
    ).toThrow(/TRUSTED_ORIGINS/);
  });
});
