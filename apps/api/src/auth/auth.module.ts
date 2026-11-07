import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import type { EnvironmentVariables } from '../config/environment.js';
import { AuthController } from './auth.controller.js';
import { AUTH_INSTANCE, AuthService, createBetterAuthInstance } from './auth.service.js';
import { TestGuardedController } from './test-guarded.controller.js';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AuthController, TestGuardedController],
  providers: [
    {
      provide: AUTH_INSTANCE,
      inject: [getDrizzleToken(), ConfigService],
      useFactory: (
        db: Database,
        configService: ConfigService<EnvironmentVariables, true>,
      ) => {
        return createBetterAuthInstance(db, configService);
      },
    },
    AuthService,
  ],
  exports: [AUTH_INSTANCE, AuthService],
})
export class AuthModule {}
