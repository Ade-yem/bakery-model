import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TenantsService } from './tenants.service.js';
import type { Database } from '../database/database.types.js';
import { AuditService } from '../audit/audit.service.js';
import { TenantTemplateSeederService } from './tenant-template-seeder.service.js';

describe('TenantsService - Baseline Catalog Seeding', () => {
  let tenantsService: TenantsService;
  let mockDb: any;
  let mockAuditService: any;
  let mockSeederService: any;

  beforeEach(() => {
    mockAuditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const mockTenant = {
      id: 'tenant-uuid-1',
      name: 'Artisan Bakery',
      status: 'ACTIVE',
    };
    const mockBranch = {
      id: 'branch-uuid-1',
      tenantId: 'tenant-uuid-1',
      name: 'Main Branch',
      code: 'MAIN',
    };
    const mockMembership = {
      id: 'membership-uuid-1',
      tenantId: 'tenant-uuid-1',
      authUserId: 'user-auth-1',
      roleKey: 'OWNER',
    };

    const mockDepartments = [
      { id: 'dept-1', name: 'Reception', code: 'REC' },
      { id: 'dept-2', name: 'Production', code: 'PROD' },
      { id: 'dept-3', name: 'Dispatch', code: 'DISP' },
      { id: 'dept-4', name: 'Store', code: 'STORE' },
    ];

    mockSeederService = {
      seedBaseline: vi.fn().mockResolvedValue({
        departments: mockDepartments,
        roles: [{ id: 'role-1', code: 'OWNER' }],
        membership: mockMembership,
      }),
    };

    const mockTx = {
      insert: vi.fn((_tableObj) => ({
        values: (vals: any) => ({
          returning: () => {
            if (vals.name === 'Artisan Bakery') return [mockTenant];
            if (vals.code === 'MAIN') return [mockBranch];
            return [vals];
          },
        }),
      })),
    };

    mockDb = {
      transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockTx)),
    } as unknown as Database;

    tenantsService = new TenantsService(
      mockDb,
      mockAuditService as AuditService,
      mockSeederService as TenantTemplateSeederService,
    );
  });

  it('AC-1 & AC-6: creates baseline departments and seeds tenant records upon onboarding via seeder', async () => {
    const result = await tenantsService.onboardTenant({
      tenantName: 'Artisan Bakery',
      actorAuthUserId: 'user-auth-1',
      userEmail: 'owner@artisan.com',
      userName: 'Alice Baker',
    });

    expect(result.tenant.id).toBe('tenant-uuid-1');
    expect(result.branch.id).toBe('branch-uuid-1');
    expect(result.membership.roleKey).toBe('OWNER');
    expect(mockSeederService.seedBaseline).toHaveBeenCalledWith(
      'tenant-uuid-1',
      'branch-uuid-1',
      'user-auth-1',
      'Alice Baker',
      expect.anything(),
    );

    const createdDeptNames = result.departments.map((d: any) => d.name);
    expect(createdDeptNames).toContain('Reception');
    expect(createdDeptNames).toContain('Production');
    expect(createdDeptNames).toContain('Dispatch');
    expect(createdDeptNames).toContain('Store');
  });

  it('records an audit event for tenant onboarding', async () => {
    await tenantsService.onboardTenant({
      tenantName: 'Artisan Bakery',
      actorAuthUserId: 'user-auth-1',
      userEmail: 'owner@artisan.com',
      userName: 'Alice Baker',
    });

    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'tenant:onboard',
        tenantId: 'tenant-uuid-1',
        actorAuthUserId: 'user-auth-1',
      }),
      expect.anything(),
    );
  });
});
