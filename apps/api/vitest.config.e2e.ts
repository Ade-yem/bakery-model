import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    globalSetup: ['./test/e2e-global-setup.ts'],
    include: ['**/*.e2e-spec.ts', 'test/**/*.spec.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/tallybakery',
      BETTER_AUTH_SECRET: 'development-default-secret-min-32-characters-needed-now',
      BETTER_AUTH_URL: 'http://localhost:3000',
    },
  },
});
