import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service.js';
import type { ActorContext } from '../auth/actor-context.js';

/**
 * Service managing supplier directories and vendor procurement references.
 */
@Injectable()
export class SuppliersService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Retrieves all suppliers for the specified tenant.
   *
   * @param tenantId - The UUID of the authenticated tenant.
   * @returns Array of supplier records.
   */
  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.suppliers)
      .where(eq(schema.suppliers.tenantId, tenantId));
  }

  /**
   * Registers a new vendor supplier with audit attribution.
   *
   * @param tenantId - The UUID of the tenant.
   * @param actor - The calling actor context for audit attribution.
   * @param input - Supplier parameters including name, contact details, and external reference.
   * @returns The newly created supplier record.
   */
  async create(
    tenantId: string,
    actor: ActorContext,
    input: {
      name: string;
      externalReference?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
    },
  ) {
    const [supplier] = await this.db
      .insert(schema.suppliers)
      .values({
        tenantId,
        name: input.name,
        normalizedName: input.name.trim().toLowerCase(),
        externalReference: input.externalReference,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        status: 'ACTIVE',
      })
      .returning();

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actor.authUserId,
      actorMembershipId: actor.membershipId,
      action: 'suppliers:create',
      subjectType: 'supplier',
      subjectId: supplier.id,
      requestId: actor.requestId,
      summary: { name: supplier.name },
    });

    return supplier;
  }
}
