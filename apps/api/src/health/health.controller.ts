import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import { sql } from 'drizzle-orm';

/**
 * Controller exposing health and infrastructure readiness probes.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Liveness probe.
   *
   * @returns Process health and uptime.
   */
  @Get('live')
  @ApiOperation({
    summary: 'Process liveness probe',
    description:
      'Checks if the Node.js API process is responsive and returns uptime.',
  })
  @ApiOkResponse({ description: 'Process is live.' })
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  /**
   * Readiness probe.
   *
   * @returns Database connectivity status.
   */
  @Get('ready')
  @ApiOperation({
    summary: 'Database readiness probe',
    description:
      'Verifies active connectivity to PostgreSQL by executing a test query.',
  })
  @ApiOkResponse({ description: 'Database is ready and accepting queries.' })
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
