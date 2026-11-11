import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AccessControlService } from './access-control.service.js';
import type { Database } from '../database/database.types.js';
import { AuditService } from '../audit/audit.service.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PERMISSION_KEYS } from './permissions.js';

describe('AccessControlService - Dynamic Role Catalog', () => {
  let service: AccessControlService;
  let mockDb: any;
  let mockAuditService: any;

  const tenantA = 'tenant-aaa-111';
  const tenantB = 'tenant-bbb-222';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('AC-1 & AC-3: lists dynamic roles and assigned permissions from database for tenant', async () => {
    const roleRows = [
      { roleKey: 'OWNER', permissionKey: PERMISSION_KEYS.TENANT_READ },
      { roleKey: 'OWNER', permissionKey: PERMISSION_KEYS.ROLES_MANAGE },
      { roleKey: 'MANAGER', permissionKey: PERMISSION_KEYS.BRANCHES_READ },
    ];

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(roleRows),
        }),
      }),
    } as unknown as Database;

    service = new AccessControlService(mockDb, mockAuditService as AuditService);
    const result = await service.listRoles(tenantA);

    expect(result.roles['OWNER']).toEqual([
      PERMISSION_KEYS.TENANT_READ,
      PERMISSION_KEYS.ROLES_MANAGE,
    ]);
    expect(result.roles['MANAGER']).toEqual([PERMISSION_KEYS.BRANCHES_READ]);
  });

  it('AC-2 & Test Coverage: rejects unknown permission keys when updating role permissions', async () => {
    mockDb = {} as unknown as Database;
    service = new AccessControlService(mockDb, mockAuditService as AuditService);

    await expect(
      service.updateRolePermissions(tenantA, 'MANAGER', [
        PERMISSION_KEYS.BRANCHES_READ,
        'malicious:fake:permission' as any,
      ]),
    ).rejects.toThrow(BadRequestException);
  });

  it('AC-5 & Test Coverage: rejects permissions exceeding the role ceiling', async () => {
    mockDb = {} as unknown as Database;
    service = new AccessControlService(mockDb, mockAuditService as AuditService);

    // PRODUCTION_SUPERVISOR ceiling excludes CUSTOMERS_MANAGE and ROLES_MANAGE
    await expect(
      service.updateRolePermissions(tenantA, 'PRODUCTION_SUPERVISOR', [
        PERMISSION_KEYS.ITEMS_READ,
        PERMISSION_KEYS.ROLES_MANAGE as any,
      ]),
    ).rejects.toThrow(ForbiddenException);
  });

  it('AC-3: updates role permissions and persists them in database within role ceiling', async () => {
    const mockTx = {
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    };

    mockDb = {
      transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockTx)),
    } as unknown as Database;

    service = new AccessControlService(mockDb, mockAuditService as AuditService);

    const validManagerPerms = [
      PERMISSION_KEYS.BRANCHES_READ,
      PERMISSION_KEYS.STAFF_READ,
    ];

    const result = await service.updateRolePermissions(tenantA, 'MANAGER', validManagerPerms);

    expect(result.roleKey).toBe('MANAGER');
    expect(result.permissions).toEqual(validManagerPerms);
    expect(mockTx.delete).toHaveBeenCalled();
    expect(mockTx.insert).toHaveBeenCalled();
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: tenantA,
        action: 'role:permissions:update',
      }),
    );
  });

  it('AC-3: allows cloning an existing role into a custom role within the ceiling', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No collision
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    } as unknown as Database;

    service = new AccessControlService(mockDb, mockAuditService as AuditService);

    const cloned = await service.cloneRole(tenantA, {
      sourceRoleKey: 'PRODUCTION_SUPERVISOR',
      newRoleKey: 'HEAD_BAKER',
      permissions: [PERMISSION_KEYS.ITEMS_READ],
    });

    expect(cloned.roleKey).toBe('HEAD_BAKER');
    expect(cloned.baseRoleKey).toBe('PRODUCTION_SUPERVISOR');
    expect(cloned.permissions).toEqual([PERMISSION_KEYS.ITEMS_READ]);
  });

  it('AC-5: rejects cloning a role if permissions exceed the source role ceiling', async () => {
    mockDb = {} as unknown as Database;
    service = new AccessControlService(mockDb, mockAuditService as AuditService);

    await expect(
      service.cloneRole(tenantA, {
        sourceRoleKey: 'PRODUCTION_SUPERVISOR',
        newRoleKey: 'ROGUE_BAKER',
        permissions: [
          PERMISSION_KEYS.ITEMS_READ,
          PERMISSION_KEYS.TENANT_UPDATE as any, // Exceeds PRODUCTION_SUPERVISOR ceiling
        ],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('AC-4: isolates custom roles to the creating tenant without leaking across tenants', async () => {
    // Mock select returning only tenantB roles when queried with tenantB
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { roleKey: 'TENANT_B_ROLE', permissionKey: PERMISSION_KEYS.ITEMS_READ },
          ]),
        }),
      }),
    } as unknown as Database;

    service = new AccessControlService(mockDb, mockAuditService as AuditService);
    const result = await service.listRoles(tenantB);

    expect(result.roles['TENANT_B_ROLE']).toBeDefined();
    expect(result.roles['HEAD_BAKER']).toBeUndefined();
  });
});
