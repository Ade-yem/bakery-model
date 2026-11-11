import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TenantScopeGuard } from './tenant-scope.guard.js';
import type { Database } from '../../database/database.types.js';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('TenantScopeGuard - Department Scope & Inactive Department Check', () => {
  let guard: TenantScopeGuard;
  let mockDb: any;

  const tenantId = 'tenant-111';
  const userId = 'user-111';
  const activeDeptId = 'dept-active-1';
  const inactiveDeptId = 'dept-inactive-2';

  const createMockContext = (headers: Record<string, string>): ExecutionContext => {
    const request = {
      headers,
      user: { id: userId },
      id: 'req-1',
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Test Coverage: blocks active operations when x-department-id points to an INACTIVE department', async () => {
    const mockMembership = {
      id: 'membership-1',
      tenantId,
      authUserId: userId,
      roleKey: 'MANAGER',
      status: 'ACTIVE',
    };

    let queryCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            queryCount++;
            if (queryCount === 1) {
              // Membership query
              return Promise.resolve([mockMembership]);
            }
            if (queryCount === 2) {
              // Branch rows
              return Promise.resolve([{ branchId: 'branch-1' }]);
            }
            if (queryCount === 3) {
              // Department rows (membership has inactiveDeptId assigned previously)
              return Promise.resolve([{ departmentId: inactiveDeptId }]);
            }
            if (queryCount === 4) {
              // Department record lookup: status is INACTIVE
              return Promise.resolve([
                { id: inactiveDeptId, tenantId, status: 'INACTIVE', name: 'Closed Store' },
              ]);
            }
            // Role permissions
            return Promise.resolve([]);
          }),
        }),
      }),
    } as unknown as Database;

    guard = new TenantScopeGuard(mockDb);
    const context = createMockContext({
      'x-tenant-id': tenantId,
      'x-department-id': inactiveDeptId,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('AC-4: blocks x-department-id if department belongs to a different tenant', async () => {
    const mockMembership = {
      id: 'membership-1',
      tenantId,
      authUserId: userId,
      roleKey: 'OWNER',
      status: 'ACTIVE',
    };

    let queryCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            queryCount++;
            if (queryCount === 1) {
              return Promise.resolve([mockMembership]);
            }
            if (queryCount === 2) {
              return Promise.resolve([{ branchId: 'branch-1' }]);
            }
            if (queryCount === 3) {
              return Promise.resolve([]);
            }
            if (queryCount === 4) {
              // Department lookup for tenantId returns empty (belongs to another tenant)
              return Promise.resolve([]);
            }
            return Promise.resolve([]);
          }),
        }),
      }),
    } as unknown as Database;

    guard = new TenantScopeGuard(mockDb);
    const context = createMockContext({
      'x-tenant-id': tenantId,
      'x-department-id': 'foreign-dept-id',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('AC-3: allows active operation when x-department-id points to an ACTIVE department in scope', async () => {
    const mockMembership = {
      id: 'membership-1',
      tenantId,
      authUserId: userId,
      roleKey: 'OWNER',
      status: 'ACTIVE',
    };

    let queryCount = 0;
    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            queryCount++;
            if (queryCount === 1) {
              return Promise.resolve([mockMembership]);
            }
            if (queryCount === 2) {
              return Promise.resolve([{ branchId: 'branch-1' }]);
            }
            if (queryCount === 3) {
              return Promise.resolve([{ departmentId: activeDeptId }]);
            }
            if (queryCount === 4) {
              // Department lookup: ACTIVE
              return Promise.resolve([
                { id: activeDeptId, tenantId, status: 'ACTIVE', name: 'Reception' },
              ]);
            }
            return Promise.resolve([]);
          }),
        }),
      }),
    } as unknown as Database;

    guard = new TenantScopeGuard(mockDb);
    const context = createMockContext({
      'x-tenant-id': tenantId,
      'x-department-id': activeDeptId,
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);

    const req = context.switchToHttp().getRequest() as any;
    expect(req.actorContext.activeDepartmentId).toBe(activeDeptId);
  });
});
