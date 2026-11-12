import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TenantTemplateSeederService } from './tenant-template-seeder.service.js';
import type { Database } from '../database/database.types.js';

describe('TenantTemplateSeederService - Starter Baseline Seeding', () => {
  let seeder: TenantTemplateSeederService;
  let mockDb: any;
  let insertedRows: { table: any; values: any }[];

  const tenantId = 'tenant-xyz-123';
  const branchId = 'branch-main-123';
  const ownerUserId = 'auth-user-owner';

  beforeEach(() => {
    insertedRows = [];
    let deptIdCounter = 1;
    let roleIdCounter = 1;

    const createInsertChain = (tableObj: any) => ({
      values: (vals: any) => {
        insertedRows.push({ table: tableObj, values: vals });
        return {
          returning: () => {
            if (Array.isArray(vals)) {
              return vals.map((v) => ({
                id: `id-${deptIdCounter++}`,
                ...v,
              }));
            }
            return [
              {
                id: vals.code
                  ? `role-${roleIdCounter++}`
                  : `item-${deptIdCounter++}`,
                ...vals,
              },
            ];
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

    seeder = new TenantTemplateSeederService(mockDb);
  });

  it('TEST-DFDR-SEED-001: seeds default bakery departments, roles, and mappings for new tenant', async () => {
    const result = await seeder.seedBaseline(
      tenantId,
      branchId,
      ownerUserId,
      'Owner Name',
    );

    expect(result.departments).toHaveLength(4);
    const deptCodes = result.departments.map((d: any) => d.code);
    expect(deptCodes).toEqual(
      expect.arrayContaining(['REC', 'PROD', 'DISP', 'STORE']),
    );

    expect(result.roles).toHaveLength(5);
    const roleCodes = result.roles.map((r: any) => r.code);
    expect(roleCodes).toEqual(
      expect.arrayContaining([
        'OWNER',
        'MANAGER',
        'RECEPTIONIST',
        'PRODUCTION_SUPERVISOR',
        'DISPATCH_OFFICER',
      ]),
    );

    // Verify roleDepartments mappings exist
    const roleDeptInserts = insertedRows.find(
      (entry) =>
        Array.isArray(entry.values) &&
        entry.values.some((v) => v.roleId && v.departmentId),
    );
    expect(roleDeptInserts).toBeDefined();

    // Verify permissions were seeded for roles
    const permInserts = insertedRows.find(
      (entry) =>
        Array.isArray(entry.values) &&
        entry.values.some((v) => v.roleKey && v.permissionKey),
    );
    expect(permInserts).toBeDefined();
  });
});
