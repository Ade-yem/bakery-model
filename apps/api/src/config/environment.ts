export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  DATABASE_POOL_MAX: number;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TRUSTED_ORIGINS: string[];
  FLW_SECRET_KEY?: string;
  FLW_WEBHOOK_HASH?: string;
  FLW_V3_BASE_URL: string;
}

const nodeEnvironments = new Set<EnvironmentVariables['NODE_ENV']>([
  'development',
  'test',
  'production',
]);

function parsePositiveInteger(
  value: unknown,
  name: string,
  fallback: number,
): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export function validateEnvironment(
  values: Record<string, unknown>,
): EnvironmentVariables {
  const rawNodeEnvironment = values.NODE_ENV;
  const nodeEnvironment =
    rawNodeEnvironment === undefined ? 'development' : rawNodeEnvironment;
  const databaseUrl = values.DATABASE_URL;

  if (
    typeof nodeEnvironment !== 'string' ||
    !nodeEnvironments.has(nodeEnvironment as EnvironmentVariables['NODE_ENV'])
  ) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
    throw new Error('DATABASE_URL is required');
  }

  let parsedDatabaseUrl: URL;
  try {
    parsedDatabaseUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
  }

  if (!['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol)) {
    throw new Error(
      'DATABASE_URL must use the postgres or postgresql protocol',
    );
  }

  const rawSecret = values.BETTER_AUTH_SECRET;
  let authSecret = typeof rawSecret === 'string' ? rawSecret.trim() : '';

  if (nodeEnvironment === 'production') {
    if (!authSecret || authSecret.length < 32) {
      throw new Error(
        'BETTER_AUTH_SECRET is required and must be at least 32 characters in production',
      );
    }
  } else if (!authSecret) {
    authSecret = 'development-default-secret-min-32-characters-needed-now';
  }

  const rawAuthUrl = values.BETTER_AUTH_URL;
  let authUrl = typeof rawAuthUrl === 'string' ? rawAuthUrl.trim() : '';
  if (!authUrl) {
    authUrl = 'http://localhost:3000';
  }

  const rawOrigins = values.TRUSTED_ORIGINS;
  let trustedOrigins: string[] = [];
  if (typeof rawOrigins === 'string' && rawOrigins.trim().length > 0) {
    trustedOrigins = rawOrigins
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  } else if (nodeEnvironment === 'production') {
    throw new Error('TRUSTED_ORIGINS is required in production');
  } else {
    trustedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
  }

  return {
    NODE_ENV: nodeEnvironment as EnvironmentVariables['NODE_ENV'],
    PORT: parsePositiveInteger(values.PORT, 'PORT', 3000),
    DATABASE_URL: databaseUrl,
    DATABASE_POOL_MAX: parsePositiveInteger(
      values.DATABASE_POOL_MAX,
      'DATABASE_POOL_MAX',
      10,
    ),
    BETTER_AUTH_SECRET: authSecret,
    BETTER_AUTH_URL: authUrl,
    TRUSTED_ORIGINS: trustedOrigins,
    FLW_SECRET_KEY:
      typeof values.FLW_SECRET_KEY === 'string'
        ? values.FLW_SECRET_KEY.trim()
        : undefined,
    FLW_WEBHOOK_HASH:
      typeof values.FLW_WEBHOOK_HASH === 'string'
        ? values.FLW_WEBHOOK_HASH.trim()
        : undefined,
    FLW_V3_BASE_URL:
      typeof values.FLW_V3_BASE_URL === 'string' &&
      values.FLW_V3_BASE_URL.trim().length > 0
        ? values.FLW_V3_BASE_URL.trim()
        : 'https://api.flutterwave.com/v3',
  };
}
