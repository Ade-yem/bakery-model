import { createContext, useContext } from 'react';
import type { DemoDepartment } from '../mock-auth/session';
import { canAccessStaffPage, type StaffAccess } from './access';
export const AssignedAccess = createContext<StaffAccess | null>(null);
const actions: Record<DemoDepartment, string[]> = {
  production: ['production:create'],
  reception: [
    'orders:create',
    'payments:create',
    'orders:push',
    'repayments:create',
    'handover:submit',
    'handover:sign',
  ],
  disbursement: [
    'transfer:accept',
    'orders:fulfill',
    'stock:count',
    'handover:submit',
    'handover:sign',
  ],
  procurement: ['procurement:create'],
};
export function useStaffActions() {
  const access = useContext(AssignedAccess);
  const allowed = (action: string) => !access || access.permissions.includes(action);
  return {
    allowed,
    require: (action: string) => {
      if (!allowed(action)) throw new Error('Your assigned permissions do not allow this action.');
    },
  };
}
export function departmentAccess(department: DemoDepartment): StaffAccess {
  const module = department === 'reception' ? 'orders' : department;
  return {
    enabledModules: [module],
    permissions: [
      `${module}:view`,
      'records:view',
      'history:view',
      'schedule:view',
      ...actions[department],
    ],
  };
}
export function canOpenStaffPath(
  department: DemoDepartment,
  page: string,
  access: StaffAccess
): boolean {
  if (page === '/sync') return access.enabledModules.length > 0;
  if (page === '/profile') return true;
  const module = department === 'reception' ? 'orders' : department;
  if (!access.enabledModules.includes(module) || !access.permissions.includes(`${module}:view`))
    return false;
  if (/^\/records(?:\/[^/]+)?$/.test(page)) return access.permissions.includes('records:view');
  if (['', '/tasks', '/history', '/schedule'].includes(page))
    return canAccessStaffPage(`/workspace${page}`, access);
  const routes: Record<DemoDepartment, string[]> = {
    production: [],
    reception: ['/orders/new', '/handover', '/customers', '/credits', '/repayments'],
    disbursement: ['/stock', '/handover'],
    procurement: ['/receipts/new', '/suppliers'],
  };
  const action = (
    {
      '/orders/new': 'orders:create',
      '/receipts/new': 'procurement:create',
      '/repayments': 'repayments:create',
    } as Record<string, string>
  )[page];
  return routes[department].includes(page) && (!action || access.permissions.includes(action));
}

export function isKnownStaffPath(department: DemoDepartment, page: string): boolean {
  if (
    ['', '/tasks', '/records', '/history', '/schedule', '/profile', '/sync'].includes(page) ||
    /^\/records\/[^/]+$/.test(page)
  )
    return true;
  const extra: Record<DemoDepartment, string[]> = {
    production: [],
    reception: ['/orders/new', '/handover', '/customers', '/credits', '/repayments'],
    disbursement: ['/stock', '/handover'],
    procurement: ['/receipts/new', '/suppliers'],
  };
  return extra[department].includes(page);
}
