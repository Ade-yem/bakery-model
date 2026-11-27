import { describe, expect, it, vi } from 'vitest';
import { loadReferenceData, createSupplier, createCustomer } from './reference-data';
import { sessionFor } from '../staff-workspace/__tests__/fixtures/data';
import type { ApiClient } from './http';
const item = {
  id: 'item',
  tenantId: 'test-tenant',
  itemType: 'FINISHED_GOOD',
  name: 'Bread',
  sku: 'BREAD',
  uom: 'EACH',
  status: 'ACTIVE',
  currency: 'NGN',
  sellingPrice: '1500.0000',
};
const supplier = { id: 'supplier', tenantId: 'test-tenant', name: 'Vendor', status: 'ACTIVE' };
function setup(
  department: 'production' | 'reception' | 'disbursement' | 'procurement',
  permissions: string[]
) {
  const session = sessionFor(department, { departmentId: 'assigned-department', permissions });
  const request = vi.fn<ApiClient['request']>(async (path) =>
    path === '/api/v1/items' ? [item] : path === '/api/v1/suppliers' ? [supplier] : []
  );
  return { session, api: { request }, request };
}
describe('role-scoped live directories', () => {
  it('blocks immediate retry when a write response cannot establish the created record', async () => {
    const { api, session, request } = setup('procurement', ['suppliers:manage']);
    for (const response of [{}, { ...supplier, tenantId: 'another-tenant' }]) {
      request.mockResolvedValue(response);
      await expect(createSupplier(api, session, { name: 'Vendor' })).rejects.toMatchObject({
        code: 'INVALID_RESPONSE',
        outcomeUnknown: true,
      });
    }
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('keeps Dispatch quantity-only and never fetches customers or suppliers', async () => {
    const { api, session, request } = setup('disbursement', [
      'items:read',
      'items:price:read',
      'customers:read',
      'suppliers:read',
    ]);
    const data = await loadReferenceData(api, session);
    expect(data.items?.[0]).toMatchObject({ sellingPrice: null, currency: null });
    expect(data.suppliers).toBeNull();
    expect(data.customers).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('does not show finished goods or selling prices to Production', async () => {
    const { api, session } = setup('production', ['items:read']);
    expect((await loadReferenceData(api, session)).items).toEqual([]);
  });
  it('treats no permission as unavailable rather than an empty successful directory', async () => {
    const { api, session, request } = setup('reception', []);
    expect(await loadReferenceData(api, session)).toEqual({
      items: null,
      suppliers: null,
      customers: null,
    });
    expect(request).not.toHaveBeenCalled();
  });
  it('rejects another tenant response instead of rendering it', async () => {
    const { api, session, request } = setup('reception', ['items:read']);
    request.mockResolvedValue([{ ...item, tenantId: 'another-tenant' }]);
    await expect(loadReferenceData(api, session)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });
  it('preserves exact API decimals and sends server-validated scope selectors', async () => {
    const { api, session, request } = setup('reception', ['items:read', 'items:price:read']);
    expect((await loadReferenceData(api, session)).items?.[0].sellingPrice).toBe('1500.0000');
    expect(request).toHaveBeenCalledWith(
      '/api/v1/items',
      expect.objectContaining({
        scope: {
          tenantId: 'test-tenant',
          branchId: 'test-branch',
          departmentId: 'assigned-department',
        },
      })
    );
  });
  it('posts only authorized supplier payloads and verifies returned tenant', async () => {
    const { api, session, request } = setup('procurement', ['suppliers:manage']);
    request.mockResolvedValue(supplier);
    await createSupplier(api, session, { name: 'Vendor', contactEmail: 'vendor@example.test' });
    expect(request).toHaveBeenCalledWith(
      '/api/v1/suppliers',
      expect.objectContaining({
        method: 'POST',
        body: { name: 'Vendor', contactEmail: 'vendor@example.test' },
      })
    );
    await expect(
      createSupplier(api, { ...session, permissions: [] }, { name: 'Vendor' })
    ).rejects.toMatchObject({ status: 403 });
  });
  it('does not allow customer creation in the wrong department', async () => {
    const { api, session, request } = setup('production', ['customers:manage']);
    await expect(
      createCustomer(api, session, { displayName: 'Customer', currency: 'NGN' })
    ).rejects.toMatchObject({
      status: 403,
    });
    expect(request).not.toHaveBeenCalled();
  });
});

it('requires an explicit currency and does not allow customer entry to grant credit', async () => {
  const { api, session, request } = setup('reception', ['customers:manage']);
  request.mockResolvedValue({
    id: 'customer',
    tenantId: session.tenantId,
    displayName: 'Customer',
    status: 'ACTIVE',
    currency: 'NGN',
    creditCeiling: '0.0000',
  });
  const input = {
    displayName: 'Customer',
    currency: 'NGN',
    creditCeiling: '99999.0000',
    tenantId: 'forged-tenant',
  };
  await createCustomer(api, session, input);
  expect(request).toHaveBeenCalledWith(
    '/api/v1/customers',
    expect.objectContaining({ body: { displayName: 'Customer', currency: 'NGN' } })
  );
  await expect(
    createCustomer(api, session, { displayName: 'Customer', currency: '' })
  ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
});
