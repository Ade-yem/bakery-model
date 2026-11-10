import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.departments)
      .where(eq(schema.departments.tenantId, tenantId));
  }

  async create(tenantId: string, input: { branchId: string; name: string; type?: 'RECEPTION' | 'PRODUCTION' | 'DISBURSEMENT' | 'STORE' }) {
    const existing = await this.db
      .select()
      .from(schema.departments)
      .where(
        and(
          eq(schema.departments.tenantId, tenantId),
          eq(schema.departments.branchId, input.branchId),
          eq(schema.departments.name, input.name),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Department name already exists in this branch');
    }

    const [dept] = await this.db
      .insert(schema.departments)
      .values({
        tenantId,
        branchId: input.branchId,
        name: input.name,
        type: input.type || 'PRODUCTION',
        status: 'ACTIVE',
      })
      .returning();

    return dept;
  }
}
