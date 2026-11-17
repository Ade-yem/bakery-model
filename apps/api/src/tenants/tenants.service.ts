import { Injectable, Inject } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { Database } from '../database/database.types.js';
import * as schema from '../database/schema/index.js';
import { AuditService } from '../audit/audit.service.js';
import { TenantTemplateSeederService } from './tenant-template-seeder.service.js';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(getDrizzleToken())
    private readonly db: Database,
    private readonly auditService: AuditService,
    private readonly seederService: TenantTemplateSeederService,
  ) {}

  /**
   * Onboards a new bakery tenant organization within an atomic database transaction.
   *
   * Creates the tenant entity with STANDARD subscription status, provisions the initial primary branch,
   * invokes TenantTemplateSeederService to establish baseline factory departments (Reception, Production,
   * Dispatch, Store) and system roles, sets up the initial OWNER membership, and records an audit log.
   *
   * @param input - The onboarding payload including business title, initial branch name, and owner details.
   * @returns Object containing the created tenant, branch, departments, and owner membership.
   */
  async onboardTenant(input: {
    tenantName: string;
    branchName?: string;
    departmentName?: string;
    actorAuthUserId: string;
    userEmail: string;
    userName: string;
  }) {
    return this.db.transaction(async (tx) => {
      // 1. Create tenant
      const [tenant] = await tx
        .insert(schema.tenants)
        .values({
          name: input.tenantName,
          status: 'ACTIVE',
          subscriptionTier: 'STANDARD',
          subscriptionStatus: 'ACTIVE',
          defaultCurrency: 'USD',
          settings: {},
        })
        .returning();

      // 2. Create primary branch
      const [branch] = await tx
        .insert(schema.branches)
        .values({
          tenantId: tenant!.id,
          name: input.branchName || 'Main Branch',
          code: 'MAIN',
          timezone: 'UTC',
          status: 'ACTIVE',
        })
        .returning();

      // 3. Seed baseline departments, roles, permissions, and owner membership via template seeder
      const seeded = await this.seederService.seedBaseline(
        tenant!.id,
        branch!.id,
        input.actorAuthUserId,
        input.userName || input.userEmail,
        tx as unknown as Database,
      );

      await this.auditService.log(
        {
          tenantId: tenant!.id,
          actorAuthUserId: input.actorAuthUserId,
          actorMembershipId: seeded.membership.id,
          action: 'tenant:onboard',
          subjectType: 'tenant',
          subjectId: tenant!.id,
          requestId: 'internal',
          summary: { tenantName: tenant!.name },
        },
        tx as unknown as Database,
      );

      return {
        tenant: tenant!,
        branch: branch!,
        departments: seeded.departments,
        membership: seeded.membership,
      };
    });
  }
}
