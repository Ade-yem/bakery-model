/**
 * @file Test-first access contract for staff workspace navigation.
 * Implementation follows after the required review of these assertions.
 */
import { describe, expect, it } from 'vitest';
import { getStaffNavigation, canAccessStaffPage } from '../access';

const reception = {
  enabledModules: ['orders', 'payments'],
  permissions: ['orders:view', 'payments:view', 'records:view', 'history:view', 'schedule:view'],
};

const production = {
  enabledModules: ['production'],
  permissions: ['production:view', 'records:view', 'history:view', 'schedule:view'],
};

const disbursement = {
  enabledModules: ['transfers', 'fulfillment'],
  permissions: ['transfers:view', 'fulfillment:view', 'records:view'],
};

describe('Staff workspace navigation', () => {
  it('always offers workspace home and own profile within an established staff session', () => {
    const links = getStaffNavigation({ enabledModules: [], permissions: [] });
    expect(links.map((link) => link.path)).toEqual(['/workspace', '/workspace/profile']);
  });

  it('offers only assigned reception tasks and permitted shared pages', () => {
    const paths = getStaffNavigation(reception).map((link) => link.path);
    expect(paths).toContain('/workspace/tasks');
    expect(paths).toContain('/workspace/records');
    expect(paths).toContain('/workspace/history');
    expect(paths).toContain('/workspace/schedule');
    expect(paths.every((path) => path.startsWith('/workspace'))).toBe(true);
  });

  it('requires an enabled department module as well as its task permission', () => {
    expect(
      canAccessStaffPage('/workspace/tasks', {
        enabledModules: [],
        permissions: ['orders:view'],
      })
    ).toBe(false);
    expect(
      canAccessStaffPage('/workspace/tasks', {
        enabledModules: ['orders'],
        permissions: [],
      })
    ).toBe(false);
    expect(canAccessStaffPage('/workspace/tasks', reception)).toBe(true);
  });

  it('allows production and disbursement task access through their own assigned modules', () => {
    expect(canAccessStaffPage('/workspace/tasks', production)).toBe(true);
    expect(canAccessStaffPage('/workspace/tasks', disbursement)).toBe(true);
  });

  it('does not grant shared record, history or schedule access implicitly', () => {
    const scope = { enabledModules: ['production'], permissions: ['production:view'] };
    expect(canAccessStaffPage('/workspace/records', scope)).toBe(false);
    expect(canAccessStaffPage('/workspace/history', scope)).toBe(false);
    expect(canAccessStaffPage('/workspace/schedule', scope)).toBe(false);
  });

  it('denies platform, business administration and unknown routes', () => {
    for (const path of [
      '/platform',
      '/platform/businesses',
      '/app/staff',
      '/app/departments',
      '/workspace/unknown',
    ]) {
      expect(canAccessStaffPage(path, reception)).toBe(false);
    }
  });

  it('does not mutate permission or module inputs', () => {
    const scope = {
      enabledModules: [...reception.enabledModules],
      permissions: [...reception.permissions],
    };
    const before = structuredClone(scope);
    getStaffNavigation(scope);
    expect(scope).toEqual(before);
  });
});
