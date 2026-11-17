import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AccessControlService } from './access-control.service.js';
import type { Database } from '../database/database.types.js';
import { AuditService } from '../audit/audit.service.js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PERMISSION_KEYS } from './permissions.js';

describe('AccessControlService - Dynamic Factory Role & Department Catalog', () => {
  let service: AccessControlService;
  let mockDb: any;
  let mockAuditService: any;

  const tenantA = 'tenant-aaa-111';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuditService = {
      log: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('TEST-DFDR-ROLE-001: creates custom factory role with metadata, permissions, and department mappings', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              // Check collision for role code -> none
              return Promise.resolve([]);
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'role-qa-1',
              tenantId: tenantA,
              code: 'QUALITY_INSPECTOR',
              name: 'Quality Assurance Lead',
              description: 'Inspects mixing batches and oven outputs',
              isSystem: false,
              status: 'ACTIVE',
            },
          ]),
        }),
      }),
      transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([
                {
                  id: 'role-qa-1',
                  tenantId: tenantA,
                  code: 'QUALITY_INSPECTOR',
                  name: 'Quality Assurance Lead',
                  description: 'Inspects mixing batches and oven outputs',
                  isSystem: false,
                  status: 'ACTIVE',
                },
              ]),
            }),
          }),
        };
        return cb(tx);
      }),
    } as unknown as Database;

    service = new AccessControlService(
      mockDb,
      mockAuditService as AuditService,
    );

    const result = await service.createRole(tenantA, {
      code: 'QUALITY_INSPECTOR',
      name: 'Quality Assurance Lead',
      description: 'Inspects mixing batches and oven outputs',
      permissions: [
        PERMISSION_KEYS.ITEMS_READ,
        PERMISSION_KEYS.DEPARTMENTS_READ,
      ],
      departmentIds: ['dept-mixing-1', 'dept-oven-1'],
    });

    expect(result.id).toBe('role-qa-1');
    expect(result.code).toBe('QUALITY_INSPECTOR');
    expect(result.permissions).toContain(PERMISSION_KEYS.ITEMS_READ);
    expect(result.departmentIds).toContain('dept-mixing-1');
  });

  it('TEST-DFDR-ROLE-002: rejects custom role creation with unknown permission keys', async () => {
    mockDb = {} as unknown as Database;
    service = new AccessControlService(
      mockDb,
      mockAuditService as AuditService,
    );

    await expect(
      service.createRole(tenantA, {
        code: 'HACKER_ROLE',
        name: 'Hacker',
        permissions: ['unauthorized:destroy:world' as any],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('TEST-DFDR-ROLE-003: rejects duplicate role code in same tenant', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([{ id: 'existing-role', code: 'MANAGER' }]),
          }),
        }),
      }),
    } as unknown as Database;

    service = new AccessControlService(
      mockDb,
      mockAuditService as AuditService,
    );

    await expect(
      service.createRole(tenantA, {
        code: 'MANAGER',
        name: 'Duplicate Manager',
        permissions: [PERMISSION_KEYS.BRANCHES_READ],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('TEST-DFDR-ROLE-004: protects system OWNER role from deletion or deactivation', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: 'role-owner',
                code: 'OWNER',
                isSystem: true,
                tenantId: tenantA,
              },
            ]),
          }),
        }),
      }),
    } as unknown as Database;

    service = new AccessControlService(
      mockDb,
      mockAuditService as AuditService,
    );

    await expect(service.deleteRole(tenantA, 'role-owner')).rejects.toThrow(
      ForbiddenException,
    );

    await expect(
      service.updateRole(tenantA, 'role-owner', {
        status: 'INACTIVE',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('TEST-DFDR-SCOPE-001: associates role with departments and retrieves assigned departments', async () => {
    const roleId = 'role-123';
    mockDb = {
      transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
        const tx = {
          delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockResolvedValue(undefined),
          }),
        };
        return cb(tx);
      }),
    } as unknown as Database;

    service = new AccessControlService(
      mockDb,
      mockAuditService as AuditService,
    );
    const assigned = await service.assignRoleDepartments(tenantA, roleId, [
      'dept-1',
      'dept-2',
    ]);

    expect(assigned).toEqual(['dept-1', 'dept-2']);
  });

  it('lists dynamic roles with metadata, permissions, and department assignments', async () => {
    const rolesFromDb = [
      {
        id: 'role-1',
        tenantId: tenantA,
        code: 'OPERATOR',
        name: 'Oven Operator',
        description: 'Bakehouse operator',
        isSystem: false,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const permsFromDb = [
      { roleKey: 'OPERATOR', permissionKey: PERMISSION_KEYS.ITEMS_READ },
    ];

    const deptsFromDb = [{ roleId: 'role-1', departmentId: 'dept-baking-1' }];

    let selectCallCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            selectCallCount++;
            if (selectCallCount === 1) return Promise.resolve(rolesFromDb);
            if (selectCallCount === 2) return Promise.resolve(permsFromDb);
            return Promise.resolve(deptsFromDb);
          }),
        }),
      }),
    } as unknown as Database;

    service = new AccessControlService(
      mockDb,
      mockAuditService as AuditService,
    );
    const result = await service.listRoles(tenantA);

    expect(result.roles).toHaveLength(1);
    expect(result.roles[0].code).toBe('OPERATOR');
    expect(result.roles[0].permissions).toEqual([PERMISSION_KEYS.ITEMS_READ]);
    expect(result.roles[0].departmentIds).toEqual(['dept-baking-1']);
  });
});
