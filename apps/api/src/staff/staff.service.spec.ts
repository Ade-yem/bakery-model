import { describe, expect, it, vi, beforeEach } from 'vitest';
import { StaffService } from './staff.service.js';
import type { Database } from '../database/database.types.js';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PERMISSION_KEYS } from '../access-control/permissions.js';

describe('StaffService - Membership Scopes & Role Assignments', () => {
  let staffService: StaffService;
  let mockDb: any;

  const tenantA = 'tenant-aaa-111';
  const membershipId = 'membership-111';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AC-4: rejects staff access update if membership belongs to another tenant', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // not found in tenant
          }),
        }),
      }),
    } as unknown as Database;

    staffService = new StaffService(mockDb);

    await expect(
      staffService.updateAccess(tenantA, membershipId, {
        roleKey: 'MANAGER',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('AC-5: rejects custom permissions exceeding the target role ceiling', async () => {
    const existingMembership = {
      id: membershipId,
      tenantId: tenantA,
      roleKey: 'PRODUCTION_SUPERVISOR',
      status: 'ACTIVE',
    };

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingMembership]),
          }),
        }),
      }),
    } as unknown as Database;

    staffService = new StaffService(mockDb);

    await expect(
      staffService.updateAccess(tenantA, membershipId, {
        roleKey: 'PRODUCTION_SUPERVISOR',
        customPermissions: [PERMISSION_KEYS.CUSTOMERS_MANAGE], // Not in ceiling
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('AC-4: rejects department assignment if department belongs to another tenant', async () => {
    const existingMembership = {
      id: membershipId,
      tenantId: tenantA,
      roleKey: 'MANAGER',
      status: 'ACTIVE',
    };

    // 1st query: membership found
    // 2nd query: departments check in tenantA -> returns empty (department is in tenantB)
    let selectCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCount++;
              if (selectCount === 1)
                return Promise.resolve([existingMembership]);
              return Promise.resolve([]);
            }),
          }),
        }),
      }),
    } as unknown as Database;

    // departments query doesn't use limit(1), it does inArray where
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation(() => {
          selectCount++;
          if (selectCount === 1) {
            return {
              limit: () => Promise.resolve([existingMembership]),
            };
          }
          // Querying departments for tenantA returns empty because the ID belongs to tenantB
          return Promise.resolve([]);
        }),
      }),
    });

    staffService = new StaffService(mockDb);

    await expect(
      staffService.updateAccess(tenantA, membershipId, {
        departmentIds: ['foreign-dept-id'],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('Test Coverage: rejects assigning an INACTIVE department to a staff membership', async () => {
    const existingMembership = {
      id: membershipId,
      tenantId: tenantA,
      roleKey: 'MANAGER',
      status: 'ACTIVE',
    };

    const inactiveDept = {
      id: 'inactive-dept-id',
      tenantId: tenantA,
      name: 'Archived Store',
      status: 'INACTIVE',
    };

    let selectCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            selectCount++;
            if (selectCount === 1) {
              return {
                limit: () => Promise.resolve([existingMembership]),
              };
            }
            // Returns the inactive department
            return Promise.resolve([inactiveDept]);
          }),
        }),
      }),
    } as unknown as Database;

    staffService = new StaffService(mockDb);

    await expect(
      staffService.updateAccess(tenantA, membershipId, {
        departmentIds: ['inactive-dept-id'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('AC-3: updates role, branch, and active department assignments atomically', async () => {
    const existingMembership = {
      id: membershipId,
      tenantId: tenantA,
      roleKey: 'RECEPTIONIST',
      status: 'ACTIVE',
    };

    const activeDept = {
      id: 'active-dept-1',
      tenantId: tenantA,
      name: 'Reception',
      status: 'ACTIVE',
    };

    const activeBranch = {
      id: 'active-branch-1',
      tenantId: tenantA,
      name: 'Main Branch',
      status: 'ACTIVE',
    };

    let selectCount = 0;
    const mockTx = {
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi
              .fn()
              .mockResolvedValue([
                { ...existingMembership, roleKey: 'MANAGER' },
              ]),
          }),
        }),
      }),
    };

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            selectCount++;
            if (selectCount === 1) {
              return {
                limit: () => Promise.resolve([existingMembership]),
              };
            }
            if (selectCount === 2) {
              // branch verification
              return Promise.resolve([activeBranch]);
            }
            if (selectCount === 3) {
              // dept verification
              return Promise.resolve([activeDept]);
            }
            if (selectCount === 4) {
              // role lookup
              return {
                limit: () =>
                  Promise.resolve([{ id: 'role-mgr', code: 'MANAGER' }]),
              };
            }
            // role departments lookup (none -> global)
            return Promise.resolve([]);
          }),
        }),
      }),
      transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockTx)),
    } as unknown as Database;

    staffService = new StaffService(mockDb);

    const updated = await staffService.updateAccess(tenantA, membershipId, {
      roleKey: 'MANAGER',
      branchIds: ['active-branch-1'],
      departmentIds: ['active-dept-1'],
    });

    expect(updated.roleKey).toBe('MANAGER');
    expect(mockTx.delete).toHaveBeenCalledTimes(2); // deletes old membershipBranches & membershipDepartments
    expect(mockTx.insert).toHaveBeenCalledTimes(2); // inserts new branches & departments
  });

  it('TEST-DFDR-SCOPE-002: rejects department assignment when department is not permitted by role scoping', async () => {
    const existingMembership = {
      id: membershipId,
      tenantId: tenantA,
      roleKey: 'OVEN_OPERATOR',
      status: 'ACTIVE',
    };

    const requestedDept = {
      id: 'dept-reception-1',
      tenantId: tenantA,
      name: 'Reception',
      status: 'ACTIVE',
    };

    let selectCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            selectCount++;
            if (selectCount === 1) {
              return {
                limit: () => Promise.resolve([existingMembership]),
              };
            }
            if (selectCount === 2) {
              // department validation: found active
              return Promise.resolve([requestedDept]);
            }
            if (selectCount === 3) {
              // tenant_roles lookup: find role
              return {
                limit: () =>
                  Promise.resolve([
                    {
                      id: 'role-oven-op',
                      code: 'OVEN_OPERATOR',
                      isSystem: false,
                    },
                  ]),
              };
            }
            if (selectCount === 4) {
              // role_departments lookup: role is bound to dept-baking-1, not dept-reception-1
              return Promise.resolve([
                { roleId: 'role-oven-op', departmentId: 'dept-baking-1' },
              ]);
            }
            return Promise.resolve([]);
          }),
        }),
      }),
    } as unknown as Database;

    staffService = new StaffService(mockDb);

    await expect(
      staffService.updateAccess(tenantA, membershipId, {
        departmentIds: ['dept-reception-1'],
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
