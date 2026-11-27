import { describe, expect, it, vi } from 'vitest';
import { createApiClient, ApiError } from './http';
import { parseCookieSession, parseIdentity } from './contracts';
describe('live API transport', () => {
  it('sends cookie credentials and explicit scope without bearer tokens', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]'));
    await createApiClient({ fetcher }).request('/api/v1/items', {
      scope: { tenantId: 'tenant', branchId: 'branch', departmentId: 'department' },
    });
    expect(fetcher).toHaveBeenCalledWith(
      '/api/v1/items',
      expect.objectContaining({
        credentials: 'include',
        cache: 'no-store',
        headers: expect.objectContaining({
          'x-tenant-id': 'tenant',
          'x-branch-id': 'branch',
          'x-department-id': 'department',
        }),
      })
    );
    expect(fetcher.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
  });
  it('does not retry uncertain writes or expose backend internals', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('private connection details'));
    await expect(
      createApiClient({ fetcher }).request('/api/v1/suppliers', {
        method: 'POST',
        body: { name: 'Supplier' },
      })
    ).rejects.toMatchObject({ outcomeUnknown: true, status: 0 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockResolvedValue(
      new Response(JSON.stringify({ message: 'secret SQL error' }), { status: 500 })
    );
    await expect(createApiClient({ fetcher }).request('/api/v1/items')).rejects.toThrow(
      'temporarily unavailable'
    );
  });
  it('handles scope rejection, malformed success and cancellation', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: 'SCOPE_FORBIDDEN' }), { status: 403 })
      );
    await expect(createApiClient({ fetcher }).request('/api/v1/items')).rejects.toMatchObject({
      code: 'SCOPE_FORBIDDEN',
    });
    fetcher.mockResolvedValue(new Response('<html>not JSON</html>'));
    await expect(createApiClient({ fetcher }).request('/api/v1/items')).rejects.toBeInstanceOf(
      ApiError
    );
    expect(() =>
      parseCookieSession({
        session: { userId: 'other', expiresAt: 'bad' },
        user: { id: 'user', email: 'a@example.test', name: 'Staff' },
      })
    ).toThrow();
    expect(parseCookieSession(null)).toBeNull();
  });
  it('rejects mismatched active memberships rather than granting default access', () => {
    expect(() =>
      parseIdentity({
        user: { id: 'user', email: 'a@example.test', name: 'Staff' },
        memberships: [],
        activeContext: {
          tenantId: 't',
          membershipId: 'm',
          role: 'OWNER',
          permissions: ['items:read'],
        },
      })
    ).toThrow();
  });
});
