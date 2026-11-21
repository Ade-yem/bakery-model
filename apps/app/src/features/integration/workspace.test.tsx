import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, validateSession } from './auth';
import { WorkspaceRoute } from '../staff-workspace/WorkspaceRoute';
import { validateWorkspaceScope } from './workspace';
import { authState, sessionFor, dataFor } from '../staff-workspace/__tests__/fixtures/data';

function render(path: string, session = sessionFor('production')) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={authState(session)}>
      <MemoryRouter initialEntries={[path]}>
        <WorkspaceRoute />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
describe('authenticated workspace boundaries', () => {
  for (const department of ['production', 'reception', 'disbursement', 'procurement'] as const) {
    it(`keeps ${department} unavailable without a data adapter and denies other departments`, () => {
      const session = sessionFor(department);
      expect(render(`/workspace/${department}`, session)).toContain('Workspace unavailable');
      expect(render(`/workspace/${department}`, session)).not.toContain('Staff navigation');
      for (const other of ['production', 'reception', 'disbursement', 'procurement'].filter(
        (value) => value !== department
      ))
        expect(render(`/workspace/${other}/records`, session)).toContain('Access denied');
    });
    it(`validates ${department} data against tenant, branch, user and department`, () => {
      const session = sessionFor(department);
      const data = dataFor(department);
      expect(validateWorkspaceScope(data, session)).toBe(data);
      for (const field of ['tenantId', 'branchId', 'userId', 'department'] as const) {
        expect(() =>
          validateWorkspaceScope(
            { ...data, scope: { ...data.scope, [field]: 'another-scope' } },
            session
          )
        ).toThrow();
      }
    });
  }
  it('keeps expired, suspended and plan-disabled sessions out of operational pages', () => {
    expect(render('/workspace/production', sessionFor('production', { expiresAt: 1 }))).toContain(
      'Session expired'
    );
    expect(
      render('/workspace/production', sessionFor('production', { accountStatus: 'SUSPENDED' }))
    ).toContain('Account unavailable');
    expect(
      render('/workspace/production', sessionFor('production', { subscriptionStatus: 'EXPIRED' }))
    ).toContain('Business subscription expired');
    expect(
      render('/workspace/production', sessionFor('production', { planModules: [] }))
    ).toContain('Feature unavailable');
  });
  it('does not grant default permissions and preserves not-found handling', () => {
    expect(
      render('/workspace/production/records', sessionFor('production', { permissions: [] }))
    ).toContain('Access denied');
    expect(render('/workspace/production/unknown')).toContain('Page not found');
  });
  it('does not read or overwrite old device records to fill an unconfigured workspace', () => {
    const getItem = vi.fn(() => 'old data');
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem, setItem });
    try {
      expect(render('/workspace/production')).toContain('Workspace unavailable');
      expect(getItem).not.toHaveBeenCalled();
      expect(setItem).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('rejects incomplete claims rather than filling in missing grants', () => {
    expect(validateSession(sessionFor('production'))).toBeTruthy();
    for (const patch of [
      { permissions: undefined },
      { enabledModules: undefined },
      { planModules: undefined },
      { userId: '' },
      { expiresAt: NaN },
    ])
      expect(() => validateSession({ ...sessionFor('production'), ...patch })).toThrow();
  });
});
