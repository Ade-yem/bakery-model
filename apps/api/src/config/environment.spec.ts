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
    });
  });

  it('rejects a missing database URL', () => {
    expect(() => validateEnvironment({})).toThrow('DATABASE_URL is required');
  });

  it('rejects a non-PostgreSQL URL', () => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: 'mysql://localhost/tallybakery' }),
    ).toThrow('DATABASE_URL must use the postgres or postgresql protocol');
  });
});
