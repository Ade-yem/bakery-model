import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class AuditService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  async log(data: {
    tenantId: string;
    actorAuthUserId: string;
    actorMembershipId: string;
    action: string;
    subjectType: string;
    subjectId: string;
    requestId: string;
    summary?: Record<string, unknown>;
  }) {
    await this.db.insert(schema.auditEvents).values({
      tenantId: data.tenantId,
      actorAuthUserId: data.actorAuthUserId,
      actorMembershipId: data.actorMembershipId,
      action: data.action,
      subjectType: data.subjectType,
      subjectId: data.subjectId,
      requestId: data.requestId,
      summary: data.summary ?? {},
    });
  }

  async list(tenantId: string, limit = 50) {
    return this.db
      .select()
      .from(schema.auditEvents)
      .where(eq(schema.auditEvents.tenantId, tenantId))
      .orderBy(desc(schema.auditEvents.createdAt))
      .limit(limit);
  }
}
