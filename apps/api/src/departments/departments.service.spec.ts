import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DepartmentsService } from './departments.service.js';
import type { Database } from '../database/database.types.js';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DepartmentsService - Dynamic Department Management', () => {
  let departmentsService: DepartmentsService;
  let mockDb: any;

  const tenantA = 'tenant-aaa-111';
  const branchA = 'branch-aaa-111';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AC-3: lists departments strictly scoped to tenantId', async () => {
    const tenantDepts = [
      { id: 'dept-1', tenantId: tenantA, name: 'Reception', status: 'ACTIVE' },
      { id: 'dept-2', tenantId: tenantA, name: 'Production', status: 'ACTIVE' },
    ];

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(tenantDepts),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);
    const result = await departmentsService.list(tenantA);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Reception');
  });

  it('AC-4: rejects department creation if branch does not belong to the tenant', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // branch not found in tenant
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    await expect(
      departmentsService.create(tenantA, {
        branchId: 'foreign-branch-id',
        name: 'New Department',
        type: 'PRODUCTION',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('AC-4: rejects duplicate department name in the same branch', async () => {
    // 1st select: branch validation -> found
    // 2nd select: department duplicate check -> found existing
    let selectCallCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              if (selectCallCount === 1) {
                // branch check
                return Promise.resolve([{ id: branchA, tenantId: tenantA }]);
              }
              // dept duplicate check
              return Promise.resolve([
                { id: 'dept-existing', name: 'Production', branchId: branchA, tenantId: tenantA },
              ]);
            }),
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    await expect(
      departmentsService.create(tenantA, {
        branchId: branchA,
        name: 'Production',
        type: 'PRODUCTION',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('AC-3: allows renaming an active or inactive department', async () => {
    let selectCallCount = 0;
    const existingDept = {
      id: 'dept-1',
      tenantId: tenantA,
      branchId: branchA,
      name: 'Pastry',
      status: 'ACTIVE',
    };

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              if (selectCallCount === 1) {
                // Find department
                return Promise.resolve([existingDept]);
              }
              // Name conflict check in same branch
              return Promise.resolve([]);
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { ...existingDept, name: 'Artisan Pastry' },
            ]),
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    const updated = await departmentsService.update(tenantA, 'dept-1', {
      name: 'Artisan Pastry',
    });

    expect(updated.name).toBe('Artisan Pastry');
  });

  it('AC-3 & AC-6: allows deactivating and reactivating a department without deleting it', async () => {
    const existingDept = {
      id: 'dept-1',
      tenantId: tenantA,
      branchId: branchA,
      name: 'Store',
      status: 'ACTIVE',
    };

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([existingDept]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { ...existingDept, status: 'INACTIVE' },
            ]),
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    const deactivated = await departmentsService.update(tenantA, 'dept-1', {
      status: 'INACTIVE',
    });

    expect(deactivated.status).toBe('INACTIVE');
  });

  it('AC-4: cross-tenant department update throws NotFoundException', async () => {
    // Department belongs to tenantB, caller is tenantA
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // Scoped where (id = deptId AND tenantId = tenantA) returns empty
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    await expect(
      departmentsService.update(tenantA, 'dept-from-tenant-b', {
        name: 'Hacked Name',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
