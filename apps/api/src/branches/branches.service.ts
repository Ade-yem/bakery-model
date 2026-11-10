import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class BranchesService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.branches)
      .where(eq(schema.branches.tenantId, tenantId));
  }

  async create(tenantId: string, input: { name: string; code: string; timezone?: string }) {
    const existing = await this.db
      .select()
      .from(schema.branches)
      .where(and(eq(schema.branches.tenantId, tenantId), eq(schema.branches.code, input.code)))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Branch code already exists');
    }

    const [branch] = await this.db
      .insert(schema.branches)
      .values({
        tenantId,
        name: input.name,
        code: input.code,
        timezone: input.timezone || 'UTC',
        status: 'ACTIVE',
      })
      .returning();

    return branch;
  }
}
