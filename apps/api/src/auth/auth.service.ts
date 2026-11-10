import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from '../database/database.types.js';
import type { EnvironmentVariables } from '../config/environment.js';
import * as schema from '../database/schema/index.js';

export const AUTH_INSTANCE = Symbol('AUTH_INSTANCE');

export function createBetterAuthInstance(
  db: Database,
  configService: ConfigService<EnvironmentVariables, true>,
) {
  const secret = configService.get('BETTER_AUTH_SECRET', { infer: true });
  const baseURL = configService.get('BETTER_AUTH_URL', { infer: true });
  const trustedOrigins = configService.get('TRUSTED_ORIGINS', { infer: true });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    baseURL,
    basePath: '/api/auth',
    secret,
    trustedOrigins,
  });
}

export type AuthType = ReturnType<typeof createBetterAuthInstance>;

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_INSTANCE) public readonly auth: AuthType) {}
}
