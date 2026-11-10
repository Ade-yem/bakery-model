import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service.js';
import type { ActorContext } from '../auth/actor-context.js';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.tenantId, tenantId));
  }

  async create(
    tenantId: string,
    actor: ActorContext,
    input: {
      displayName: string;
      externalReference?: string;
      phone?: string;
      email?: string;
      creditCeiling?: string;
      currency?: string;
    },
  ) {
    const [customer] = await this.db
      .insert(schema.customers)
      .values({
        tenantId,
        displayName: input.displayName,
        normalizedName: input.displayName.trim().toLowerCase(),
        externalReference: input.externalReference,
        phone: input.phone,
        email: input.email,
        creditCeiling: input.creditCeiling || '0.0000',
        currency: input.currency || 'USD',
        status: 'ACTIVE',
      })
      .returning();

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actor.authUserId,
      actorMembershipId: actor.membershipId,
      action: 'customers:create',
      subjectType: 'customer',
      subjectId: customer.id,
      requestId: actor.requestId,
      summary: { displayName: customer.displayName },
    });

    return customer;
  }
}
