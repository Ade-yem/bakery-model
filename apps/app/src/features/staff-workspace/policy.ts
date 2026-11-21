import { createContext, useContext } from 'react';
import type { Department } from '../integration/auth';
import { canAccessStaffPage, type StaffAccess } from './access';
export const AssignedAccess = createContext<StaffAccess | null>(null);
export function useStaffActions() {
  const access = useContext(AssignedAccess);
  const allowed = (action: string) => Boolean(access?.permissions.includes(action));
  return {
    allowed,
    require: (action: string) => {
      if (!allowed(action)) throw new Error('Your assigned permissions do not allow this action.');
    },
  };
}
export function canOpenStaffPath(
  department: Department,
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
  const routes: Record<Department, string[]> = {
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

export function isKnownStaffPath(department: Department, page: string): boolean {
  if (
    ['', '/tasks', '/records', '/history', '/schedule', '/profile', '/sync'].includes(page) ||
    /^\/records\/[^/]+$/.test(page)
  )
    return true;
  const extra: Record<Department, string[]> = {
    production: [],
    reception: ['/orders/new', '/handover', '/customers', '/credits', '/repayments'],
    disbursement: ['/stock', '/handover'],
    procurement: ['/receipts/new', '/suppliers'],
  };
  return extra[department].includes(page);
}
