import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { EnvironmentVariables } from '../config/environment.js';

@Module({
  imports: [
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        drizzle,
        connection: {
          connectionString: configService.get('DATABASE_URL', { infer: true }),
          max: configService.get('DATABASE_POOL_MAX', { infer: true }),
        },
      }),
    }),
  ],
  exports: [DrizzleModule],
})
export class DatabaseModule {}
