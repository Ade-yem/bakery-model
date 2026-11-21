import { describe, expect, it, vi } from 'vitest';
import { CatalogController } from './catalog.controller.js';
import type { CatalogService } from './catalog.service.js';
import type { ActorContext } from '../auth/actor-context.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../access-control/permissions.js';

const items = ['RAW_MATERIAL', 'FINISHED_GOOD', 'PACKAGING'].map(
  (itemType) => ({
    id: itemType,
    tenantId: 'tenant-a',
    itemType,
    name: itemType,
    sellingPrice: '12.5000',
    currency: 'USD',
  }),
);

function actor(role: string): ActorContext {
  return {
    requestId: 'request-1',
    authUserId: 'user-1',
    membershipId: 'membership-1',
    tenantId: 'tenant-a',
    // The API's seeded role keys differ from the legacy shared RoleKey names.
    role: role as ActorContext['role'],
    branchIds: [],
    departmentIds: [],
    permissions: new Set(DEFAULT_ROLE_PERMISSIONS[role]),
  };
}

function controller() {
  const service = { list: vi.fn().mockResolvedValue(items) };
  return {
    service,
    controller: new CatalogController(service as unknown as CatalogService),
  };
}

describe('CatalogController directory visibility', () => {
  it.each([
    ['PRODUCTION_SUPERVISOR', 'RAW_MATERIAL'],
    ['DISPATCH_OFFICER', 'FINISHED_GOOD'],
    ['RECEPTIONIST', 'FINISHED_GOOD'],
  ] as const)('limits %s to %s records', async (role, itemType) => {
    const { controller: subject, service } = controller();
    const result = await subject.list(actor(role));
    expect(result.map((item) => item.itemType)).toEqual([itemType]);
    expect(service.list).toHaveBeenCalledWith('tenant-a');
  });

  it.each(['PRODUCTION_SUPERVISOR', 'DISPATCH_OFFICER'] as const)(
    'redacts prices in the %s response',
    async (role) => {
      const { controller: subject } = controller();
      expect(await subject.list(actor(role))).toEqual([
        expect.objectContaining({ sellingPrice: null, currency: null }),
      ]);
      expect(items[0].sellingPrice).toBe('12.5000');
    },
  );

  it('uses effective price permissions even for a manager', async () => {
    const caller = actor('MANAGER');
    caller.permissions = new Set(['items:read']);
    const { controller: subject } = controller();
    const result = await subject.list(caller);
    expect(result).toHaveLength(3);
    expect(
      result.every(
        (item) => item.sellingPrice === null && item.currency === null,
      ),
    ).toBe(true);
  });

  it.each(['OWNER', 'MANAGER'] as const)(
    'preserves the full catalogue for an authorized %s',
    async (role) => {
      const { controller: subject } = controller();
      expect(await subject.list(actor(role))).toEqual(items);
    },
  );

  it('preserves prices for a receptionist with price permission', async () => {
    const { controller: subject } = controller();
    expect(await subject.list(actor('RECEPTIONIST'))).toEqual([items[1]]);
  });
});
