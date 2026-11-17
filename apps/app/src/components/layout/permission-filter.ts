/**
 * @file Pure domain utility for dynamic permission-based navigation filtering.
 */

import type { LayoutNavGroup, LayoutNavItem } from './types';

/**
 * @description Evaluates actor permissions against navigation groups and items, omitting unauthorized items and empty groups.
 * @param {LayoutNavGroup[]} groups - Navigation sections with declared permission constraints.
 * @param {readonly string[]} permissions - Active permissions resolved for the authenticated actor.
 * @returns {LayoutNavGroup[]} Permitted navigation groups without mutating inputs.
 * @example
 * ```ts
 * const visible = filterNavGroupsByPermissions(ADMIN_NAV_GROUPS, user.permissions);
 * ```
 */
export function filterNavGroupsByPermissions(
  groups: LayoutNavGroup[],
  permissions: readonly string[]
): LayoutNavGroup[] {
  const permSet = new Set(permissions);

  return groups
    .filter((group) => {
      // Check group-level permissions if defined
      if (group.requiredPermissions && group.requiredPermissions.length > 0) {
        const hasAllGroupPerms = group.requiredPermissions.every((perm) => permSet.has(perm));
        if (!hasAllGroupPerms) return false;
      }
      return true;
    })
    .map((group) => {
      // Filter items within the group
      const permittedItems: LayoutNavItem[] = group.items.filter((item) => {
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
          return true;
        }
        return item.requiredPermissions.every((perm) => permSet.has(perm));
      });

      return {
        ...group,
        items: permittedItems,
      };
    })
    .filter((group) => group.items.length > 0);
}
