import { Controller, Get, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import { sql } from 'drizzle-orm';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('ready')
  async ready() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: 'ready', database: 'connected' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { status: 'error', database: message };
    }
  }
}
