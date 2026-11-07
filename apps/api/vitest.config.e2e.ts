import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts', 'test/**/*.spec.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/tallybakery',
      BETTER_AUTH_SECRET: 'development-default-secret-min-32-characters-needed-now',
      BETTER_AUTH_URL: 'http://localhost:3000',
    },
  },
});
