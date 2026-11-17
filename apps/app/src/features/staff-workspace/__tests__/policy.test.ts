import { describe, expect, it } from 'vitest';
import { canOpenStaffPath, departmentAccess } from '../policy';
describe('staff route and module policy', () => {
  it('requires an enabled department module as well as permissions', () => {
    const access = departmentAccess('production');
    expect(canOpenStaffPath('production', '', access)).toBe(true);
    expect(
      canOpenStaffPath('production', '/records/BAT-1', {
        ...access,
        permissions: ['production:view'],
      })
    ).toBe(false);
    expect(canOpenStaffPath('production', '', { ...access, enabledModules: [] })).toBe(false);
    expect(canOpenStaffPath('production', '/orders/new', access)).toBe(false);
    expect(
      canOpenStaffPath('production', '/profile', { enabledModules: [], permissions: [] })
    ).toBe(true);
  });
});

it('does not allow entry forms through direct URLs on a view-only assignment', () => {
  const access = departmentAccess('reception');
  const restricted = {
    ...access,
    permissions: access.permissions.filter((p) => p.endsWith(':view')),
  };
  expect(canOpenStaffPath('reception', '/records', restricted)).toBe(true);
  expect(canOpenStaffPath('reception', '/orders/new', restricted)).toBe(false);
  expect(canOpenStaffPath('reception', '/repayments', restricted)).toBe(false);
});
