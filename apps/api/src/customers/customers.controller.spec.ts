import { describe, expect, it, vi } from 'vitest';
import { CustomersController } from './customers.controller.js';
import type { CustomersService } from './customers.service.js';
import type { ActorContext } from '../auth/actor-context.js';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_KEYS,
} from '../access-control/permissions.js';

const customer = {
  id: 'customer-1',
  tenantId: 'tenant-a',
  displayName: 'Customer',
  phone: '+2348000000000',
  email: 'customer@example.com',
  creditCeiling: '100.0000',
  currency: 'NGN',
};

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
  const service = { list: vi.fn().mockResolvedValue([customer]) };
  return {
    service,
    controller: new CustomersController(service as unknown as CustomersService),
  };
}

describe('CustomersController directory visibility', () => {
  it('redacts contacts in the default receptionist response', async () => {
    const { controller: subject, service } = controller();
    expect(await subject.list(actor('RECEPTIONIST'))).toEqual([
      { ...customer, phone: null, email: null },
    ]);
    expect(service.list).toHaveBeenCalledWith('tenant-a');
    expect(customer.phone).toBe('+2348000000000');
  });

  it.each(['OWNER', 'MANAGER'] as const)(
    'preserves contacts for an authorized %s',
    async (role) => {
      const { controller: subject } = controller();
      expect(await subject.list(actor(role))).toEqual([customer]);
    },
  );

  it('preserves contacts when a receptionist is explicitly granted access', async () => {
    const caller = actor('RECEPTIONIST');
    caller.permissions = new Set([
      ...caller.permissions,
      PERMISSION_KEYS.CUSTOMERS_CONTACT_READ,
    ]);
    const { controller: subject } = controller();
    expect(await subject.list(caller)).toEqual([customer]);
  });

  it('redacts contacts when a manager lacks effective contact permission', async () => {
    const caller = actor('MANAGER');
    caller.permissions = new Set([PERMISSION_KEYS.CUSTOMERS_READ]);
    const { controller: subject } = controller();
    expect(await subject.list(caller)).toEqual([
      { ...customer, phone: null, email: null },
    ]);
  });
});
