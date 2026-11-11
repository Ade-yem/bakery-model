import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TenantsService } from './tenants.service.js';
import type { Database } from '../database/database.types.js';
import { AuditService } from '../audit/audit.service.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../access-control/permissions.js';

describe('TenantsService - Baseline Catalog Seeding', () => {
  let tenantsService: TenantsService;
  let mockDb: any;
  let mockAuditService: any;
  let insertedTables: { table: string; values: any }[];

  beforeEach(() => {
    insertedTables = [];

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

    let deptCounter = 1;

    const createInsertChain = (tableObj: any) => ({
      values: (vals: any) => {
        insertedTables.push({ table: tableObj, values: vals });
        return {
          returning: () => {
            if (Array.isArray(vals)) {
              return vals.map((v) => ({
                id: `id-${deptCounter++}`,
                ...v,
              }));
            }
            if (vals.name === 'Artisan Bakery') return [mockTenant];
            if (vals.code === 'MAIN') return [mockBranch];
            if (vals.roleKey === 'OWNER') return [mockMembership];
            return [{ id: `id-${deptCounter++}`, ...vals }];
          },
        };
      },
    });

    const mockTx = {
      insert: vi.fn((table) => createInsertChain(table)),
    };

    mockDb = {
      transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockTx)),
    } as unknown as Database;

    tenantsService = new TenantsService(mockDb, mockAuditService as AuditService);
  });

  it('AC-1 & AC-6: creates baseline departments and seeds tenant records upon onboarding', async () => {
    const result = await tenantsService.onboardTenant({
      tenantName: 'Artisan Bakery',
      actorAuthUserId: 'user-auth-1',
      userEmail: 'owner@artisan.com',
      userName: 'Alice Baker',
    });

    expect(result.tenant.id).toBe('tenant-uuid-1');
    expect(result.branch.id).toBe('branch-uuid-1');
    expect(result.membership.roleKey).toBe('OWNER');

    // 4 baseline departments must be created
    const createdDeptNames = result.departments.map((d: any) => d.name);
    expect(createdDeptNames).toContain('Reception');
    expect(createdDeptNames).toContain('Production');
    expect(createdDeptNames).toContain('Disbursement');
    expect(createdDeptNames).toContain('Store');
  });

  it('Owner membership is assigned to all default baseline departments', async () => {
    await tenantsService.onboardTenant({
      tenantName: 'Artisan Bakery',
      actorAuthUserId: 'user-auth-1',
      userEmail: 'owner@artisan.com',
      userName: 'Alice Baker',
    });

    // Check membership departments insertion
    const deptAssignments = insertedTables.find(
      (entry) => Array.isArray(entry.values) && entry.values.some((v) => v.departmentId),
    );

    expect(deptAssignments).toBeDefined();
    expect(deptAssignments?.values).toHaveLength(4);
    for (const assignment of deptAssignments?.values ?? []) {
      expect(assignment.tenantId).toBe('tenant-uuid-1');
      expect(assignment.membershipId).toBe('membership-uuid-1');
      expect(assignment.departmentId).toBeDefined();
    }
  });

  it('AC-2: role permissions are seeded from approved baseline allowlist for all fixed roles', async () => {
    await tenantsService.onboardTenant({
      tenantName: 'Artisan Bakery',
      actorAuthUserId: 'user-auth-1',
      userEmail: 'owner@artisan.com',
      userName: 'Alice Baker',
    });

    // Verify role permissions were inserted
    const rolePermEntries = insertedTables.find(
      (entry) =>
        Array.isArray(entry.values) &&
        entry.values.some((v) => v.roleKey && v.permissionKey),
    );

    expect(rolePermEntries).toBeDefined();
    const seededRoleKeys = new Set(rolePermEntries?.values.map((v: any) => v.roleKey));

    expect(seededRoleKeys.has('OWNER')).toBe(true);
    expect(seededRoleKeys.has('MANAGER')).toBe(true);
    expect(seededRoleKeys.has('RECEPTIONIST')).toBe(true);
    expect(seededRoleKeys.has('PRODUCTION_SUPERVISOR')).toBe(true);
    expect(seededRoleKeys.has('DISBURSEMENT_OFFICER')).toBe(true);

    // Verify permission rows match DEFAULT_ROLE_PERMISSIONS count
    const totalExpectedRows = Object.values(DEFAULT_ROLE_PERMISSIONS).reduce(
      (acc, perms) => acc + perms.length,
      0,
    );
    expect(rolePermEntries?.values.length).toBe(totalExpectedRows);
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
    );
  });
});
