/** @file Client navigation hints; the API remains the authorization authority. */
export interface StaffAccess {
  enabledModules: readonly string[];
  permissions: readonly string[];
}
export interface StaffNavigationItem {
  path: string;
  label: string;
}
const pages: StaffNavigationItem[] = [
  { path: '/workspace', label: 'Overview' },
  { path: '/workspace/tasks', label: 'Department tasks' },
  { path: '/workspace/records', label: 'My records' },
  { path: '/workspace/history', label: 'Activity history' },
  { path: '/workspace/schedule', label: 'My schedule' },
  { path: '/workspace/profile', label: 'My profile' },
];
/**
 * @description Checks navigation visibility within an already established staff session, never server authorization.
 * @param path Canonical workspace page path.
 * @param access Backend-resolved department modules and granted actions.
 * @returns Whether this page should be offered by the client.
 */
export function canAccessStaffPage(path: string, access: StaffAccess): boolean {
  if (path === '/workspace' || path === '/workspace/profile') return true;
  if (path === '/workspace/tasks') {
    return access.enabledModules.some((module) => access.permissions.includes(`${module}:view`));
  }
  const permission = {
    '/workspace/records': 'records:view',
    '/workspace/history': 'history:view',
    '/workspace/schedule': 'schedule:view',
  }[path];
  return Boolean(permission && access.permissions.includes(permission));
}
/**
 * @description Builds staff-only links from assigned modules and permissions.
 * @param access Backend-resolved access claims; inputs are not modified.
 * @returns Permitted staff navigation links in display order.
 */
export function getStaffNavigation(access: StaffAccess): StaffNavigationItem[] {
  return pages.filter((page) => canAccessStaffPage(page.path, access));
}
