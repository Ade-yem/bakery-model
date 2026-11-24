/**
 * @file Dynamic navigation configuration generator for Cadence Client Admin Dashboard,
 * filtering sections by subscription features, branch limits, and user permissions.
 */

import type { LayoutNavGroup, LayoutNavItem } from '../../../components/layout/types';
import type { BusinessSubscriptionSnapshot, OperationalModuleKey } from '../types';
import { CLIENT_PERMISSIONS } from '../permissions';

export interface DynamicNavOptions {
  subscription: BusinessSubscriptionSnapshot;
  permissions: readonly string[];
  unreadNotificationsCount?: number;
}

/**
 * Metadata descriptor for an operational navigation item.
 */
interface OperationalNavSpec {
  key: OperationalModuleKey;
  label: string;
  path: string;
  icon: string;
  requiredPermission: string;
}

const ALL_OPERATIONAL_MODULES: OperationalNavSpec[] = [
  {
    key: 'inventory',
    label: 'Inventory',
    path: '/business/operations/inventory',
    icon: 'Package',
    requiredPermission: CLIENT_PERMISSIONS.INVENTORY_VIEW,
  },
  {
    key: 'sales',
    label: 'Sales',
    path: '/business/operations/sales',
    icon: 'BadgePercent',
    requiredPermission: CLIENT_PERMISSIONS.SALES_VIEW,
  },
  {
    key: 'orders',
    label: 'Orders',
    path: '/business/operations/orders',
    icon: 'ShoppingCart',
    requiredPermission: CLIENT_PERMISSIONS.ORDERS_VIEW,
  },
  {
    key: 'procurement',
    label: 'Procurement',
    path: '/business/operations/procurement',
    icon: 'Truck',
    requiredPermission: CLIENT_PERMISSIONS.PROCUREMENT_VIEW,
  },
  {
    key: 'production',
    label: 'Production',
    path: '/business/operations/production',
    icon: 'Flame',
    requiredPermission: CLIENT_PERMISSIONS.PRODUCTION_VIEW,
  },
  {
    key: 'payments',
    label: 'Payments',
    path: '/business/operations/payments',
    icon: 'CreditCard',
    requiredPermission: CLIENT_PERMISSIONS.PAYMENTS_VIEW,
  },
  {
    key: 'credits',
    label: 'Credits',
    path: '/business/operations/credits',
    icon: 'Wallet',
    requiredPermission: CLIENT_PERMISSIONS.CREDITS_VIEW,
  },
];

/**
 * @description Generates client business navigation groups dynamically based on subscription features and user permissions.
 * @param {DynamicNavOptions} options - Active subscription, permissions, and badge metrics.
 * @returns {LayoutNavGroup[]} Dynamically filtered navigation groups.
 */
export function getClientAdminNavGroups({
  subscription,
  permissions,
}: DynamicNavOptions): LayoutNavGroup[] {
  const permSet = new Set(permissions);

  // 1. Workspace Group
  const workspaceItems: LayoutNavItem[] = [
    {
      label: 'Overview',
      path: '/business/dashboard',
      icon: 'LayoutDashboard',
      requiredPermissions: [CLIENT_PERMISSIONS.OVERVIEW_VIEW],
      end: true,
    },
    {
      label: 'Business Profile',
      path: '/business/profile',
      icon: 'Building2',
      requiredPermissions: [CLIENT_PERMISSIONS.PROFILE_VIEW],
    },
  ];

  // Only show Branches when multi-branch is supported under the subscription
  if (subscription.isMultiBranchSupported && subscription.maxBranches > 1) {
    workspaceItems.push({
      label: 'Branches',
      path: '/business/branches',
      icon: 'Store',
      requiredPermissions: [CLIENT_PERMISSIONS.BRANCHES_VIEW],
    });
  }

  // 2. Business Structure Group
  const structureItems: LayoutNavItem[] = [
    {
      label: 'Departments',
      path: '/business/departments',
      icon: 'FolderTree',
      requiredPermissions: [CLIENT_PERMISSIONS.DEPARTMENTS_VIEW],
    },
    {
      label: 'Department Config',
      path: '/business/departments/config',
      icon: 'Sliders',
      requiredPermissions: [CLIENT_PERMISSIONS.DEPARTMENTS_CONFIG_VIEW],
    },
    {
      label: 'Staff',
      path: '/business/staff',
      icon: 'Users',
      requiredPermissions: [CLIENT_PERMISSIONS.STAFF_VIEW],
    },
    {
      label: 'Roles & Permissions',
      path: '/business/roles',
      icon: 'ShieldCheck',
      requiredPermissions: [CLIENT_PERMISSIONS.ROLES_VIEW],
    },
    {
      label: 'Shift Scheduling',
      path: '/business/shifts',
      icon: 'CalendarClock',
      requiredPermissions: [CLIENT_PERMISSIONS.SHIFTS_VIEW],
    },
  ];

  // 3. Operations Group (strictly filtered by subscription features)
  const operationItems: LayoutNavItem[] = ALL_OPERATIONAL_MODULES.filter((mod) =>
    subscription.enabledModules.includes(mod.key)
  ).map((mod) => ({
    label: mod.label,
    path: mod.path,
    icon: mod.icon,
    requiredPermissions: [mod.requiredPermission],
  }));

  // 4. Management Group
  const managementItems: LayoutNavItem[] = [
    {
      label: 'Reports & History',
      path: '/business/reports',
      icon: 'FileBarChart',
      requiredPermissions: [CLIENT_PERMISSIONS.REPORTS_VIEW],
    },
    {
      label: 'Settings',
      path: '/business/settings',
      icon: 'Settings',
      requiredPermissions: [CLIENT_PERMISSIONS.SETTINGS_VIEW],
    },
  ];

  const rawGroups: LayoutNavGroup[] = [
    {
      groupTitle: 'Workspace',
      items: workspaceItems,
    },
    {
      groupTitle: 'Business Structure',
      items: structureItems,
    },
    {
      groupTitle: 'Operations',
      items: operationItems,
    },
    {
      groupTitle: 'Management',
      items: managementItems,
    },
  ];

  // Filter items by resolved user permissions
  return rawGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
          return true;
        }
        return item.requiredPermissions.every((p) => permSet.has(p));
      }),
    }))
    .filter((group) => group.items.length > 0);
}
