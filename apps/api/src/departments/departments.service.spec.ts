import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DepartmentsService } from './departments.service.js';
import type { Database } from '../database/database.types.js';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DepartmentsService - Dynamic Factory Department Management', () => {
  let departmentsService: DepartmentsService;
  let mockDb: any;

  const tenantA = 'tenant-aaa-111';
  const branchA = 'branch-aaa-111';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TEST-DFDR-DEPT-001: creates department with custom factory category and code', async () => {
    let selectCallCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              if (selectCallCount === 1) {
                // Branch verification
                return Promise.resolve([{ id: branchA, tenantId: tenantA }]);
              }
              // Duplicate checks (name & code)
              return Promise.resolve([]);
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'dept-custom-1',
              tenantId: tenantA,
              branchId: branchA,
              name: 'Oven Bay 1',
              code: 'OB-01',
              type: 'BAKING',
              description: 'Primary continuous tunnel oven zone',
              status: 'ACTIVE',
            },
          ]),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);
    const result = await departmentsService.create(tenantA, {
      branchId: branchA,
      name: 'Oven Bay 1',
      code: 'OB-01',
      type: 'BAKING',
      description: 'Primary continuous tunnel oven zone',
    });

    expect(result.id).toBe('dept-custom-1');
    expect(result.type).toBe('BAKING');
    expect(result.code).toBe('OB-01');
    expect(result.status).toBe('ACTIVE');
  });

  it('TEST-DFDR-DEPT-002: rejects duplicate department code in same branch', async () => {
    let selectCallCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              if (selectCallCount === 1) {
                return Promise.resolve([{ id: branchA, tenantId: tenantA }]);
              }
              // Existing department with same code or name
              return Promise.resolve([
                { id: 'dept-existing', code: 'OB-01', name: 'Other Name', branchId: branchA, tenantId: tenantA },
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
        name: 'Oven Bay 2',
        code: 'OB-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('TEST-DFDR-DEPT-003: rejects department creation if branch belongs to another tenant', async () => {
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    await expect(
      departmentsService.create(tenantA, {
        branchId: 'foreign-branch-id',
        name: 'Quality Lab',
        code: 'QA-01',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('TEST-DFDR-DEPT-004: updates department metadata, type, and deactivates status', async () => {
    let selectCallCount = 0;
    const existingDept = {
      id: 'dept-1',
      tenantId: tenantA,
      branchId: branchA,
      name: 'Packaging Old',
      code: 'PKG-01',
      type: 'PACKAGING',
      status: 'ACTIVE',
    };

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation(() => {
              selectCallCount++;
              if (selectCallCount === 1) {
                return Promise.resolve([existingDept]);
              }
              // Duplicate checks
              return Promise.resolve([]);
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                ...existingDept,
                name: 'Packaging Line A',
                code: 'PKG-A',
                type: 'PACKAGING_AUTOMATED',
                status: 'INACTIVE',
              },
            ]),
          }),
        }),
      }),
    } as unknown as Database;

    departmentsService = new DepartmentsService(mockDb);

    const result = await departmentsService.update(tenantA, 'dept-1', {
      name: 'Packaging Line A',
      code: 'PKG-A',
      type: 'PACKAGING_AUTOMATED',
      status: 'INACTIVE',
    });

    expect(result.name).toBe('Packaging Line A');
    expect(result.code).toBe('PKG-A');
    expect(result.type).toBe('PACKAGING_AUTOMATED');
    expect(result.status).toBe('INACTIVE');
  });

  it('lists departments strictly scoped to tenantId', async () => {
    const tenantDepts = [
      { id: 'dept-1', tenantId: tenantA, name: 'Reception', code: 'REC', status: 'ACTIVE' },
      { id: 'dept-2', tenantId: tenantA, name: 'Production', code: 'PROD', status: 'ACTIVE' },
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
    expect(result[0].code).toBe('REC');
  });
});
