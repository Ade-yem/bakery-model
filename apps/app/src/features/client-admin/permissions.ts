/**
 * @file Client Admin permission keys, definitions, and resolution utilities.
 */

import type { AuthenticatedActor } from '../../components/layout/types';
import type { BusinessSubscriptionSnapshot, OperationalModuleKey } from './types';

/**
 * Granular permission keys supported within the Client Business Workspace.
 */
export const CLIENT_PERMISSIONS = {
  // Workspace & Profile
  OVERVIEW_VIEW: 'business:overview:view',
  PROFILE_VIEW: 'business:profile:view',
  PROFILE_EDIT: 'business:profile:edit',

  // Branches
  BRANCHES_VIEW: 'branches:view',
  BRANCHES_MANAGE: 'branches:manage',

  // Departments
  DEPARTMENTS_VIEW: 'departments:view',
  DEPARTMENTS_MANAGE: 'departments:manage',
  DEPARTMENTS_CONFIG_VIEW: 'departments:config:view',
  DEPARTMENTS_CONFIG_MANAGE: 'departments:config:manage',

  // Staff
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',

  // Roles & Access
  ROLES_VIEW: 'roles:view',
  ROLES_MANAGE: 'roles:manage',

  // Shifts
  SHIFTS_VIEW: 'shifts:view',
  SHIFTS_MANAGE: 'shifts:manage',

  // Operations
  INVENTORY_VIEW: 'operations:inventory:view',
  INVENTORY_MANAGE: 'operations:inventory:manage',
  SALES_VIEW: 'operations:sales:view',
  SALES_MANAGE: 'operations:sales:manage',
  ORDERS_VIEW: 'operations:orders:view',
  ORDERS_MANAGE: 'operations:orders:manage',
  PROCUREMENT_VIEW: 'operations:procurement:view',
  PROCUREMENT_MANAGE: 'operations:procurement:manage',
  PRODUCTION_VIEW: 'operations:production:view',
  PRODUCTION_MANAGE: 'operations:production:manage',
  PAYMENTS_VIEW: 'operations:payments:view',
  PAYMENTS_MANAGE: 'operations:payments:manage',
  CREDITS_VIEW: 'operations:credits:view',
  CREDITS_MANAGE: 'operations:credits:manage',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export type ClientPermissionKey = (typeof CLIENT_PERMISSIONS)[keyof typeof CLIENT_PERMISSIONS];

/**
 * Maps operational module keys to their respective viewing permission.
 */
export const MODULE_VIEW_PERMISSIONS: Record<OperationalModuleKey, ClientPermissionKey> = {
  inventory: CLIENT_PERMISSIONS.INVENTORY_VIEW,
  sales: CLIENT_PERMISSIONS.SALES_VIEW,
  orders: CLIENT_PERMISSIONS.ORDERS_VIEW,
  procurement: CLIENT_PERMISSIONS.PROCUREMENT_VIEW,
  production: CLIENT_PERMISSIONS.PRODUCTION_VIEW,
  payments: CLIENT_PERMISSIONS.PAYMENTS_VIEW,
  credits: CLIENT_PERMISSIONS.CREDITS_VIEW,
};

/**
 * @description Evaluates whether an authenticated actor possesses a specific client admin permission.
 * @param {AuthenticatedActor | undefined} actor - Authenticated actor record.
 * @param {string} permission - Target permission to check.
 * @returns {boolean} True if the actor holds the permission.
 * @example
 * ```ts
 * const canEdit = hasClientPermission(actor, CLIENT_PERMISSIONS.PROFILE_EDIT);
 * ```
 */
export function hasClientPermission(
  actor: AuthenticatedActor | undefined,
  permission: string
): boolean {
  if (!actor || !actor.permissions) {
    return false;
  }
  return actor.permissions.includes(permission);
}

/**
 * @description Evaluates whether an authenticated actor holds all specified permissions.
 * @param {AuthenticatedActor | undefined} actor - Authenticated actor record.
 * @param {readonly string[]} permissions - Required permissions list.
 * @returns {boolean} True if all permissions are held.
 * @example
 * ```ts
 * const authorized = hasAllClientPermissions(actor, [CLIENT_PERMISSIONS.STAFF_VIEW, CLIENT_PERMISSIONS.STAFF_MANAGE]);
 * ```
 */
export function hasAllClientPermissions(
  actor: AuthenticatedActor | undefined,
  permissions: readonly string[]
): boolean {
  if (!actor || !actor.permissions) {
    return false;
  }
  const permSet = new Set(actor.permissions);
  return permissions.every((p) => permSet.has(p));
}

/**
 * @description Checks whether an operational module is included in the business's current subscription.
 * @param {BusinessSubscriptionSnapshot | undefined} subscription - Business subscription snapshot.
 * @param {OperationalModuleKey} moduleKey - Operational module key.
 * @returns {boolean} True if the module is enabled by subscription.
 * @example
 * ```ts
 * const enabled = isModuleSubscribed(subscription, 'production');
 * ```
 */
export function isModuleSubscribed(
  subscription: BusinessSubscriptionSnapshot | undefined,
  moduleKey: OperationalModuleKey
): boolean {
  if (!subscription || !subscription.enabledModules) {
    return false;
  }
  return subscription.enabledModules.includes(moduleKey);
}

/**
 * @description Checks whether multi-branch management is supported under the current subscription plan.
 * @param {BusinessSubscriptionSnapshot | undefined} subscription - Business subscription snapshot.
 * @returns {boolean} True if multi-branch is supported.
 * @example
 * ```ts
 * const canManageBranches = isMultiBranchSupported(subscription);
 * ```
 */
export function isMultiBranchSupported(
  subscription: BusinessSubscriptionSnapshot | undefined
): boolean {
  if (!subscription) {
    return false;
  }
  return subscription.isMultiBranchSupported && subscription.maxBranches > 1;
}
