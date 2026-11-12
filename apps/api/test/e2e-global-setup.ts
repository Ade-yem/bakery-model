import { execSync } from 'node:child_process';

const CONTAINER_NAME = 'tallybakery-e2e-db';
const POSTGRES_IMAGE = 'docker.io/library/postgres:15-alpine';
const DB_PORT = '5432';
const DB_USER = 'postgres';
const DB_PASS = 'postgres';
const DB_NAME = 'tallybakery';

/**
 * Resolves the available container engine (podman preferred, docker fallback).
 *
 * @returns Executable command name ('podman' or 'docker').
 * @throws Error if neither podman nor docker is installed.
 */
function getContainerRuntime(): string {
  try {
    execSync('which podman', { stdio: 'ignore' });
    return 'podman';
  } catch {
    try {
      execSync('which docker', { stdio: 'ignore' });
      return 'docker';
    } catch {
      throw new Error(
        'Neither podman nor docker was found on PATH. An active container runtime is required for e2e tests.',
      );
    }
  }
}

/**
 * Vitest global setup hook. Spins up an isolated PostgreSQL container,
 * waits for connection readiness, and executes Drizzle migrations.
 */
export async function setup(): Promise<void> {
  const runtime = getContainerRuntime();
  console.log(`\n[e2e-setup] Using container runtime: ${runtime}`);

  // 1. Remove existing container if present
  try {
    execSync(`${runtime} rm -f ${CONTAINER_NAME}`, { stdio: 'ignore' });
  } catch {
    // Ignore error if container does not exist
  }

  // 2. Start PostgreSQL container
  console.log(
    `[e2e-setup] Starting PostgreSQL container ${CONTAINER_NAME} on port ${DB_PORT}...`,
  );
  execSync(
    `${runtime} run -d --name ${CONTAINER_NAME} -e POSTGRES_PASSWORD=${DB_PASS} -e POSTGRES_USER=${DB_USER} -e POSTGRES_DB=${DB_NAME} -p ${DB_PORT}:5432 ${POSTGRES_IMAGE}`,
    { stdio: 'inherit' },
  );

  // 3. Poll pg_isready until healthy
  console.log('[e2e-setup] Waiting for database readiness...');
  const maxAttempts = 30;
  let ready = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync(`${runtime} exec ${CONTAINER_NAME} pg_isready -U ${DB_USER}`, {
        stdio: 'ignore',
      });
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!ready) {
    await teardown();
    throw new Error(
      'PostgreSQL container failed to become ready within timeout.',
    );
  }

  // 4. Run Drizzle migrations against the live database
  console.log('[e2e-setup] Applying Drizzle migrations...');
  const databaseUrl = `postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}`;
  execSync('pnpm --filter @repo/api db:migrate', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: 'inherit',
  });
  console.log(
    '[e2e-setup] Database migrations applied successfully. Ready for tests!\n',
  );
}

/**
 * Vitest global teardown hook. Stops and removes the PostgreSQL container.
 */
export async function teardown(): Promise<void> {
  const runtime = getContainerRuntime();
  console.log(`\n[e2e-teardown] Tearing down container ${CONTAINER_NAME}...`);
  try {
    execSync(`${runtime} rm -f ${CONTAINER_NAME}`, { stdio: 'inherit' });
    console.log('[e2e-teardown] Container successfully stopped and removed.');
  } catch (error) {
    console.error(
      `[e2e-teardown] Failed to remove container ${CONTAINER_NAME}:`,
      error,
    );
  }
}
