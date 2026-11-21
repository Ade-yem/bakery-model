import { describe, expect, it, vi } from 'vitest';
import { createAuthClient } from './auth-client';
import { ApiError, type ApiClient } from './http';
const user = { id: 'user', email: 'staff@example.test', name: 'Assigned staff' };
function setup() {
  let signedIn = true,
    hasTenant = true;
  const stored = new Map<string, string>();
  const storage = {
    getItem: (k: string) => stored.get(k) ?? null,
    setItem: (k: string, v: string) => stored.set(k, v),
    removeItem: (k: string) => {
      stored.delete(k);
    },
  };
  const context = {
    tenantId: 'tenant',
    membershipId: 'member',
    role: 'MANAGER',
    permissions: [
      'branches:read',
      'departments:read',
      'items:read',
      'suppliers:read',
      'suppliers:manage',
    ],
  };
  const request = vi.fn<ApiClient['request']>(async (path) => {
    if (path === '/api/auth/get-session')
      return signedIn
        ? {
            user,
            session: {
              userId: user.id,
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
              token: 'never-copy-this-token',
            },
          }
        : null;
    if (path === '/api/v1/me')
      return {
        user,
        memberships: hasTenant
          ? [{ id: 'member', tenantId: 'tenant', role: 'MANAGER', status: 'ACTIVE' }]
          : [],
        activeContext: hasTenant ? context : null,
      };
    if (path === '/api/v1/branches')
      return [
        {
          id: 'branch',
          tenantId: 'tenant',
          name: 'Assigned branch',
          status: 'ACTIVE',
          timezone: 'Africa/Lagos',
        },
      ];
    if (path === '/api/v1/departments')
      return [
        {
          id: 'department',
          tenantId: 'tenant',
          branchId: 'branch',
          name: 'Warehouse',
          type: 'STORE',
          status: 'ACTIVE',
        },
      ];
    if (path === '/api/auth/sign-in/email') {
      signedIn = true;
      return { user, token: 'not-a-browser-token' };
    }
    if (path === '/api/auth/sign-out') {
      signedIn = false;
      return { success: true };
    }
    if (path === '/api/auth/sign-up/email') {
      signedIn = true;
      return { user };
    }
    if (path === '/api/v1/tenants') {
      hasTenant = true;
      return { tenant: { id: 'tenant' } };
    }
    throw new Error(`Unexpected path ${path}`);
  });
  return {
    client: createAuthClient({ request }, storage),
    request,
    stored,
    context,
    signOut: () => {
      signedIn = false;
    },
    withoutTenant: () => {
      hasTenant = false;
    },
  };
}
describe('documented cookie authentication', () => {
  it('keeps onboarding unconfirmed if the refreshed context differs from the created tenant', async () => {
    const { client, request, withoutTenant } = setup();
    withoutTenant();
    const original = request.getMockImplementation()!;
    request.mockImplementation(async (path, options) => {
      const result = await original(path, options);
      return path === '/api/v1/tenants' ? { tenant: { id: 'different-tenant' } } : result;
    });
    await expect(client.onboardBusiness!('Bakery')).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      outcomeUnknown: true,
    });
    expect(request.mock.calls.filter(([path]) => path === '/api/v1/tenants')).toHaveLength(1);
  });
  it('verifies get-session and /me without inventing a workspace, plan or permissions', async () => {
    const { client, context } = setup();
    const session = await client.getSession();
    expect(session).toMatchObject({
      userId: user.id,
      department: null,
      subscriptionStatus: 'UNKNOWN',
      tenantName: null,
      enabledModules: [],
      planModules: [],
      permissions: context.permissions,
    });
  });
  it('signs in with email and obtains the actual cookie session', async () => {
    const { client, request, signOut } = setup();
    signOut();
    await client.signIn(user.email, 'test-password');
    expect(request).toHaveBeenCalledWith('/api/auth/sign-in/email', {
      method: 'POST',
      body: { email: user.email, password: 'test-password', rememberMe: false },
    });
    expect(request).toHaveBeenCalledWith('/api/auth/get-session');
    expect(request).toHaveBeenCalledWith('/api/v1/me');
  });
  it('does not report signed-in success if the cookie session is missing', async () => {
    const { client, request } = setup();
    request.mockImplementation(async (path) =>
      path === '/api/auth/get-session' ? null : { user }
    );
    await expect(client.signIn(user.email, 'test-password')).rejects.toMatchObject({
      code: 'SESSION_UNAVAILABLE',
    });
  });
  it('validates chosen branch and department on the server before remembering selectors', async () => {
    const { client, request, stored } = setup();
    const session = await client.selectWorkspace!('branch', 'department');
    expect(session).toMatchObject({
      department: 'procurement',
      departmentId: 'department',
      branchName: 'Assigned branch',
      role: 'MANAGER',
    });
    expect(request).toHaveBeenCalledWith('/api/v1/departments', {
      scope: { tenantId: 'tenant', branchId: 'branch', departmentId: 'department' },
    });
    expect([...stored.values()].join('')).not.toContain('token');
    expect(await client.getSession()).toMatchObject({ department: 'procurement' });
  });
  it('does not accept forged selectors or authorization fields from browser storage', async () => {
    const { client, stored } = setup();
    stored.set(
      'cadence:workspace-selection:v1',
      JSON.stringify({
        userId: 'other',
        tenantId: 'tenant',
        branchId: 'branch',
        departmentId: 'department',
        permissions: ['everything'],
      })
    );
    expect(await client.getSession()).toMatchObject({ department: null });
  });
  it('rejects a forbidden scope without saving it or granting default actions', async () => {
    const { client, request, stored } = setup();
    const real = request.getMockImplementation()!;
    request.mockImplementation(async (path, options) => {
      if (options?.scope?.branchId)
        throw new ApiError(403, 'SCOPE_FORBIDDEN', 'Forbidden workspace');
      return real(path, options);
    });
    await expect(client.selectWorkspace!('branch', 'department')).rejects.toMatchObject({
      status: 403,
    });
    expect(stored.size).toBe(0);
  });
  it('rejects mismatched /me identity', async () => {
    const { client, request } = setup(),
      real = request.getMockImplementation()!;
    request.mockImplementation(async (path, options) =>
      path === '/api/v1/me'
        ? { ...((await real(path, options)) as object), user: { ...user, id: 'someone-else' } }
        : real(path, options)
    );
    await expect(client.getSession()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
  it('registers only documented identity fields and leaves business creation separate', async () => {
    const { client, request } = setup();
    await client.register(
      {
        businessName: 'Business',
        fullName: user.name,
        email: user.email,
        username: 'not-supported',
        password: 'test-password',
        confirmPassword: 'test-password',
        agreeToTerms: true,
      },
      'starter'
    );
    expect(request).toHaveBeenCalledWith('/api/auth/sign-up/email', {
      method: 'POST',
      body: { name: user.name, email: user.email, password: 'test-password' },
    });
    expect(request).not.toHaveBeenCalledWith('/api/v1/tenants', expect.anything());
  });
  it('creates a business only after authenticated onboarding and avoids repeating an existing setup', async () => {
    const { client, request, withoutTenant } = setup();
    withoutTenant();
    await client.onboardBusiness!('Bakery');
    expect(request).toHaveBeenCalledWith('/api/v1/tenants', {
      method: 'POST',
      body: { name: 'Bakery' },
    });
    await client.onboardBusiness!('Bakery');
    expect(request.mock.calls.filter(([path]) => path === '/api/v1/tenants')).toHaveLength(1);
  });
  it('does not fabricate a reset email when backend delivery is unconfigured', async () => {
    const { client, request } = setup();
    expect(client.passwordResetAvailable).toBe(false);
    await expect(client.requestPasswordReset(user.email)).rejects.toMatchObject({
      code: 'RESET_UNAVAILABLE',
    });
    expect(request).not.toHaveBeenCalled();
  });
  it('signs out on the server and clears only scope selectors', async () => {
    const { client, stored } = setup();
    stored.set('retained-draft', 'evidence');
    await client.selectWorkspace!('branch', 'department');
    await client.signOut();
    expect(await client.getSession()).toBeNull();
    expect(stored.get('retained-draft')).toBe('evidence');
    expect(stored.size).toBe(1);
  });
});

it('keeps inactive memberships out of business onboarding and operational access', async () => {
  const { client, request } = setup(),
    real = request.getMockImplementation()!;
  request.mockImplementation(async (path, options) =>
    path === '/api/v1/me'
      ? {
          user,
          memberships: [{ id: 'member', tenantId: 'tenant', role: 'MANAGER', status: 'SUSPENDED' }],
          activeContext: null,
        }
      : real(path, options)
  );
  expect(await client.getSession()).toMatchObject({
    accountStatus: 'SUSPENDED',
    department: null,
    permissions: [],
  });
  await expect(client.onboardBusiness!('Business')).rejects.toMatchObject({
    code: 'ACCOUNT_UNAVAILABLE',
  });
  expect(request).not.toHaveBeenCalledWith('/api/v1/tenants', expect.anything());
});
