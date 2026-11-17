import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceRoute } from '../staff-workspace/WorkspaceRoute';
import { authenticateDemo, DEMO_PASSWORD } from './session';

afterEach(() => vi.unstubAllGlobals());
function render(
  path: string,
  department?: 'production' | 'reception' | 'disbursement' | 'procurement'
) {
  vi.stubGlobal('sessionStorage', {
    getItem: () =>
      department
        ? JSON.stringify(authenticateDemo(`${department}@demo.tallybakery.test`, DEMO_PASSWORD))
        : null,
  });
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <WorkspaceRoute />
    </MemoryRouter>
  );
}
describe('mock staff route boundaries', () => {
  it('routes Procurement to its own workspace only', () => {
    expect(render('/workspace/procurement', 'procurement')).toContain('Good morning, Bisi.');
    expect(render('/workspace/reception', 'procurement')).toContain('Access denied');
  });
  it('opens Disbursement without access to Reception records', () => {
    expect(render('/workspace/disbursement', 'disbursement')).toContain('Good morning, Chidi.');
    expect(render('/workspace/reception/records', 'disbursement')).toContain('Access denied');
  });
  it('does not render staff data without demo login', () => {
    expect(render('/workspace/production')).not.toContain('Ada Okonkwo');
  });
  it('denies another department including nested routes', () => {
    expect(render('/workspace/reception/records', 'production')).toContain('Access denied');
  });
  it('keeps production pages isolated and links inside demo routes', () => {
    const html = render('/workspace/production/records', 'production');
    expect(html).toContain('href="/workspace/production/tasks"');
    expect(html).toContain('Log out');
    expect(html).not.toMatch(/₦|Customer credit/);
  });
});

describe('canonical staff routing', () => {
  const departments = ['production', 'reception', 'disbursement', 'procurement'] as const;
  for (const current of departments) {
    it(`keeps ${current} on product routes with the staff application shell`, () => {
      const html = render(`/workspace/${current}`, current);
      expect(html).toContain('Staff navigation');
      expect(html).toContain(`href="/workspace/${current}/tasks"`);
      expect(html).toContain('Log out');
      expect(html).toContain('Log out');
      expect(html).not.toContain('Sample data');
      for (const other of departments.filter((name) => name !== current)) {
        expect(render(`/workspace/${other}/records`, current)).toContain('Access denied');
      }
    });
  }
});

it('renders expired and unavailable-account states without department records', () => {
  for (const state of [
    { expiresAt: 1 },
    { expiresAt: Date.now() + 10000, accountStatus: 'SUSPENDED' },
    { expiresAt: Date.now() + 10000, subscriptionStatus: 'EXPIRED' },
  ]) {
    vi.stubGlobal('sessionStorage', {
      getItem: () => JSON.stringify({ department: 'production', ...state }),
    });
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/workspace/production']}>
        <WorkspaceRoute />
      </MemoryRouter>
    );
    expect(html).not.toContain('BAT-0186');
    expect(html).toMatch(/Session expired|Account unavailable|Business subscription expired/);
  }
});
it('denies direct operational URLs when assigned modules or permissions are absent', () => {
  vi.stubGlobal('sessionStorage', {
    getItem: () =>
      JSON.stringify({
        department: 'production',
        expiresAt: Date.now() + 10000,
        enabledModules: [],
        permissions: [],
      }),
  });
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/workspace/production/records/BAT-0186']}>
      <WorkspaceRoute />
    </MemoryRouter>
  );
  expect(html).toContain('Access denied');
  expect(html).not.toContain('250 units');
});

it('checks plan availability separately from department permissions', () => {
  vi.stubGlobal('sessionStorage', {
    getItem: () =>
      JSON.stringify({ department: 'production', expiresAt: Date.now() + 10000, planModules: [] }),
  });
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/workspace/production']}>
      <WorkspaceRoute />
    </MemoryRouter>
  );
  expect(html).toContain('Feature unavailable');
  expect(html).not.toContain('BAT-0186');
});
