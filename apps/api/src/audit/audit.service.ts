import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, desc } from 'drizzle-orm';

/**
 * Service managing chronological append-only audit event logging and retrieval.
 */
@Injectable()
export class AuditService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
  ) {}

  /**
   * Appends an immutable audit event record.
   * Supports execution inside an ongoing database transaction via dbClient.
   *
   * @param data - The audit event payload including actor IDs, subject, action, and summary.
   * @param dbClient - Optional transaction context client.
   */
  async log(
    data: {
      tenantId: string;
      actorAuthUserId: string;
      actorMembershipId: string;
      action: string;
      subjectType: string;
      subjectId: string;
      requestId: string;
      summary?: Record<string, unknown>;
    },
    dbClient?: Database,
  ) {
    const client = dbClient ?? this.db;
    await client.insert(schema.auditEvents).values({
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

  /**
   * Retrieves audit events for a tenant ordered newest to oldest.
   *
   * @param tenantId - The UUID of the authenticated tenant.
   * @param limit - Maximum number of records to return.
   * @returns Array of audit records.
   */
  async list(tenantId: string, limit = 50) {
    return this.db
      .select()
      .from(schema.auditEvents)
      .where(eq(schema.auditEvents.tenantId, tenantId))
      .orderBy(desc(schema.auditEvents.createdAt))
      .limit(limit);
  }
}
