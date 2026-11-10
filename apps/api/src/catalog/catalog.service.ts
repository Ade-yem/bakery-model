import {
  Injectable,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service.js';
import type { ActorContext } from '../auth/actor-context.js';

@Injectable()
export class CatalogService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
  ) {}

  async list(tenantId: string) {
    return this.db
      .select()
      .from(schema.catalogItems)
      .where(eq(schema.catalogItems.tenantId, tenantId));
  }

  async create(
    tenantId: string,
    actor: ActorContext,
    input: {
      itemType: string;
      sku: string;
      name: string;
      category?: string;
      uom: string;
      sellingPrice?: string;
      currency?: string;
    },
  ) {
    const existing = await this.db
      .select()
      .from(schema.catalogItems)
      .where(
        and(
          eq(schema.catalogItems.tenantId, tenantId),
          eq(schema.catalogItems.sku, input.sku),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Item SKU already exists');
    }

    const [item] = await this.db
      .insert(schema.catalogItems)
      .values({
        tenantId,
        itemType: input.itemType,
        sku: input.sku,
        name: input.name,
        normalizedName: input.name.trim().toLowerCase(),
        category: input.category,
        uom: input.uom,
        sellingPrice: input.sellingPrice,
        currency: input.currency || 'USD',
        status: 'ACTIVE',
      })
      .returning();

    await this.auditService.log({
      tenantId,
      actorAuthUserId: actor.authUserId,
      actorMembershipId: actor.membershipId,
      action: 'catalog:create',
      subjectType: 'catalog_item',
      subjectId: item.id,
      requestId: actor.requestId,
      summary: { sku: item.sku, name: item.name },
    });

    return item;
  }
}
