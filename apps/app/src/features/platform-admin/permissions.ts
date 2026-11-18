/**
 * @file Declares strongly-typed Platform Admin permissions, access scopes, and module descriptors.
 * Aligns strictly with the TallyBakery Platform Admin specification:
 * - Overview: platform.dashboard.view
 * - Business Management: platform.businesses.view, platform.businesses.manage
 * - Subscription Plans: platform.plans.view, platform.plans.manage
 * - Subscriptions: platform.subscriptions.view, platform.subscriptions.manage
 * - Client Admin Accounts: platform.client_admins.view
 * - Platform Settings: platform.settings.view, platform.settings.manage
 * - Audit and Activity: platform.audit.view
 */

/**
 * Platform Admin action permissions matching system authorization gates.
 */
export const PLATFORM_PERMISSIONS = {
  /** View platform metrics and activity. */
  DASHBOARD_VIEW: 'platform.dashboard.view',
  /** View, search, filter and inspect businesses. */
  BUSINESSES_VIEW: 'platform.businesses.view',
  /** Update business account status. */
  BUSINESSES_MANAGE: 'platform.businesses.manage',
  /** View available subscription plans. */
  PLANS_VIEW: 'platform.plans.view',
  /** Create, edit, activate and archive plans. */
  PLANS_MANAGE: 'platform.plans.manage',
  /** View subscription details and payment status. */
  SUBSCRIPTIONS_VIEW: 'platform.subscriptions.view',
  /** Manage subscription changes. */
  SUBSCRIPTIONS_MANAGE: 'platform.subscriptions.manage',
  /** Cancel active client subscriptions. */
  SUBSCRIPTIONS_CANCEL: 'platform.subscriptions.cancel',
  /** Extend subscription validity or terms. */
  SUBSCRIPTIONS_EXTEND: 'platform.subscriptions.extend',
  /** View primary administrators and account status. */
  CLIENT_ADMINS_VIEW: 'platform.client_admins.view',
  /** Update client administrator status or associations. */
  CLIENT_ADMINS_MANAGE: 'platform.client_admins.manage',
  /** View platform settings. */
  SETTINGS_VIEW: 'platform.settings.view',
  /** Update platform settings. */
  SETTINGS_MANAGE: 'platform.settings.manage',
  /** View significant platform actions. */
  AUDIT_VIEW: 'platform.audit.view',
} as const;

/**
 * Union of all valid Platform Admin permission strings.
 */
export type PlatformPermission =
  (typeof PLATFORM_PERMISSIONS)[keyof typeof PLATFORM_PERMISSIONS];

/**
 * Platform Admin module descriptor metadata.
 */
export interface PlatformAdminModuleDescriptor {
  /** Unique module identifier. */
  id: string;
  /** Display title for the module. */
  name: string;
  /** Primary view permission required for access and navigation visibility. */
  viewPermission: PlatformPermission;
  /** Optional operational mutation permission. */
  managePermission?: PlatformPermission;
  /** Target link route path. */
  path: string;
  /** Access summary description. */
  accessDescription: string;
}

/**
 * Authoritative registry of all Platform Admin modules and their access specifications.
 */
export const PLATFORM_ADMIN_MODULES: readonly PlatformAdminModuleDescriptor[] = [
  {
    id: 'overview',
    name: 'Overview',
    viewPermission: PLATFORM_PERMISSIONS.DASHBOARD_VIEW,
    path: '/admin/dashboard',
    accessDescription: 'View platform metrics and activity',
  },
  {
    id: 'businesses',
    name: 'Business Management',
    viewPermission: PLATFORM_PERMISSIONS.BUSINESSES_VIEW,
    managePermission: PLATFORM_PERMISSIONS.BUSINESSES_MANAGE,
    path: '/admin/businesses',
    accessDescription: 'View, search, filter and inspect businesses',
  },
  {
    id: 'plans',
    name: 'Subscription Plans',
    viewPermission: PLATFORM_PERMISSIONS.PLANS_VIEW,
    managePermission: PLATFORM_PERMISSIONS.PLANS_MANAGE,
    path: '/admin/plans',
    accessDescription: 'View available plans and configure pricing tiers',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    viewPermission: PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
    managePermission: PLATFORM_PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    path: '/admin/subscriptions',
    accessDescription: 'View subscription details, payment status, and tier changes',
  },
  {
    id: 'client_admins',
    name: 'Client Admin Accounts',
    viewPermission: PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW,
    managePermission: PLATFORM_PERMISSIONS.CLIENT_ADMINS_MANAGE,
    path: '/admin/client-admins',
    accessDescription: 'View primary administrators and account status',
  },
  {
    id: 'settings',
    name: 'Platform Settings',
    viewPermission: PLATFORM_PERMISSIONS.SETTINGS_VIEW,
    managePermission: PLATFORM_PERMISSIONS.SETTINGS_MANAGE,
    path: '/admin/settings',
    accessDescription: 'View and update platform settings',
  },
  {
    id: 'audit',
    name: 'Audit and Activity',
    viewPermission: PLATFORM_PERMISSIONS.AUDIT_VIEW,
    path: '/admin/audit',
    accessDescription: 'View significant platform actions and system audit logs',
  },
] as const;

/**
 * Route-to-title map for breadcrumbs and top navigation bar display.
 */
export const ROUTE_TITLE_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/businesses': 'Businesses',
  '/admin/plans': 'Subscription Plans',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/client-admins': 'Client Admin Accounts',
  '/admin/users': 'Client Admin Accounts',
  '/admin/settings': 'Platform Settings',
  '/admin/audit': 'Audit and Activity',
  '/admin/transactions': 'Transactions',
  '/admin/support': 'Support',
  '/admin/notifications': 'Notifications',
  '/admin/analytics': 'Analytics',
};

/**
 * @description Evaluates whether an authenticated actor possesses a specific Platform Admin permission.
 * Strictly separates Platform Admin permissions from client business permissions.
 * @param {{ permissions?: readonly string[] } | undefined} actor - Authenticated administrator actor.
 * @param {string | undefined} permission - The required Platform Admin permission string.
 * @returns {boolean} True if the actor holds the required permission or '*' wildcard.
 * @example
 * ```ts
 * const canEditPlans = hasPlatformPermission(actor, PLATFORM_PERMISSIONS.PLANS_MANAGE);
 * ```
 */
export function hasPlatformPermission(
  actor?: { permissions?: readonly string[] },
  permission?: string
): boolean {
  if (!actor || !actor.permissions || !permission) {
    return false;
  }
  return actor.permissions.includes('*') || actor.permissions.includes(permission);
}
