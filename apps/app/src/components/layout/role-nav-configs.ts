/**
 * @file Declares role-specific navigation configurations with declared permission gates.
 */

import type { LayoutNavGroup } from './types';
import { PLATFORM_PERMISSIONS } from '../../features/platform-admin/permissions';

/**
 * Platform Administrator navigation structure aligned with the official modules and access specification.
 */
export const PLATFORM_ADMIN_NAV_GROUPS: LayoutNavGroup[] = [
  {
    groupTitle: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: [PLATFORM_PERMISSIONS.DASHBOARD_VIEW],
      },
    ],
  },
  {
    groupTitle: 'Platform Management',
    items: [
      {
        label: 'Businesses',
        path: '/admin/businesses',
        icon: 'Building2',
        badge: '48',
        requiredPermissions: [PLATFORM_PERMISSIONS.BUSINESSES_VIEW],
      },
      {
        label: 'Client Admin Accounts',
        path: '/admin/client-admins',
        icon: 'Users',
        requiredPermissions: [PLATFORM_PERMISSIONS.CLIENT_ADMINS_VIEW],
      },
    ],
  },
  {
    groupTitle: 'Billing Management',
    items: [
      {
        label: 'Subscription Plans',
        path: '/admin/plans',
        icon: 'Layers',
        requiredPermissions: [PLATFORM_PERMISSIONS.PLANS_VIEW],
      },
      {
        label: 'Subscriptions',
        path: '/admin/subscriptions',
        icon: 'CreditCard',
        requiredPermissions: [PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW],
      },
    ],
  },
  {
    groupTitle: 'System',
    items: [
      {
        label: 'Audit and Activity',
        path: '/admin/audit',
        icon: 'ShieldAlert',
        requiredPermissions: [PLATFORM_PERMISSIONS.AUDIT_VIEW],
      },
      {
        label: 'Platform Settings',
        path: '/admin/settings',
        icon: 'Settings',
        requiredPermissions: [PLATFORM_PERMISSIONS.SETTINGS_VIEW],
      },
    ],
  },
];

/**
 * Commercial Bakery Owner navigation structure.
 */
export const BUSINESS_OWNER_NAV_GROUPS: LayoutNavGroup[] = [
  {
    groupTitle: 'Bakery Management',
    items: [
      {
        label: 'Dashboard',
        path: '/owner/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: ['owner:dashboard:view'],
      },
      {
        label: 'Branches',
        path: '/owner/branches',
        icon: 'Store',
        requiredPermissions: ['owner:branches:view'],
      },
      {
        label: 'Financials & Revenue',
        path: '/owner/finances',
        icon: 'DollarSign',
        requiredPermissions: ['owner:finances:view'],
      },
    ],
  },
  {
    groupTitle: 'Operations & People',
    items: [
      {
        label: 'Central Inventory',
        path: '/owner/inventory',
        icon: 'Package',
        requiredPermissions: ['owner:inventory:view'],
      },
      {
        label: 'Staff & Payroll',
        path: '/owner/staff',
        icon: 'Users',
        requiredPermissions: ['owner:staff:view'],
      },
      {
        label: 'Executive Reports',
        path: '/owner/reports',
        icon: 'FileText',
        requiredPermissions: ['owner:reports:view'],
      },
      {
        label: 'Business Settings',
        path: '/owner/settings',
        icon: 'Settings',
        requiredPermissions: ['owner:settings:view'],
      },
    ],
  },
];

/**
 * Branch Operations Manager navigation structure.
 */
export const MANAGER_NAV_GROUPS: LayoutNavGroup[] = [
  {
    groupTitle: 'Branch Operations',
    items: [
      {
        label: 'Shift Dashboard',
        path: '/manager/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: ['manager:dashboard:view'],
      },
      {
        label: 'Active Shifts',
        path: '/manager/shifts',
        icon: 'Clock',
        requiredPermissions: ['manager:shifts:view'],
      },
      {
        label: 'Production Orders',
        path: '/manager/production',
        icon: 'Layers',
        requiredPermissions: ['manager:production:view'],
      },
      {
        label: 'Reception & Sales',
        path: '/manager/reception',
        icon: 'Receipt',
        requiredPermissions: ['manager:reception:view'],
      },
    ],
  },
  {
    groupTitle: 'Branch Inventory & Team',
    items: [
      {
        label: 'Branch Stock',
        path: '/manager/inventory',
        icon: 'Package',
        requiredPermissions: ['manager:inventory:view'],
      },
      {
        label: 'Staff Attendance',
        path: '/manager/staff',
        icon: 'Users',
        requiredPermissions: ['manager:staff:view'],
      },
    ],
  },
];

/**
 * Department Staff Workspace navigation structure.
 */
export const STAFF_NAV_GROUPS: LayoutNavGroup[] = [
  {
    groupTitle: 'My Workspace',
    items: [
      {
        label: 'Overview',
        path: '/workspace',
        icon: 'LayoutDashboard',
        end: true,
      },
      {
        label: 'Department Tasks',
        path: '/workspace/tasks',
        icon: 'ClipboardList',
        requiredPermissions: ['production:view'],
      },
      {
        label: 'My Records',
        path: '/workspace/records',
        icon: 'Files',
        requiredPermissions: ['records:view'],
      },
      {
        label: 'Activity History',
        path: '/workspace/history',
        icon: 'History',
        requiredPermissions: ['history:view'],
      },
      {
        label: 'My Schedule',
        path: '/workspace/schedule',
        icon: 'CalendarDays',
        requiredPermissions: ['schedule:view'],
      },
      {
        label: 'My Profile',
        path: '/workspace/profile',
        icon: 'UserRound',
      },
    ],
  },
];
