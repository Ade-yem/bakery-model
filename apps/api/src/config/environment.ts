export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  DATABASE_POOL_MAX: number;
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

  return {
    NODE_ENV: nodeEnvironment as EnvironmentVariables['NODE_ENV'],
    PORT: parsePositiveInteger(values.PORT, 'PORT', 3000),
    DATABASE_URL: databaseUrl,
    DATABASE_POOL_MAX: parsePositiveInteger(
      values.DATABASE_POOL_MAX,
      'DATABASE_POOL_MAX',
      10,
    ),
  };
}
