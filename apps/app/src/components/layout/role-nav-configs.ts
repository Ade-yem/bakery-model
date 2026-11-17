/**
 * @file Declares role-specific navigation configurations with declared permission gates.
 */

import type { LayoutNavGroup } from './types';

/**
 * Platform Administrator navigation structure.
 */
export const PLATFORM_ADMIN_NAV_GROUPS: LayoutNavGroup[] = [
  {
    groupTitle: 'Core Platform',
    items: [
      {
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: ['admin:dashboard:view'],
      },
      {
        label: 'Analytics',
        path: '/admin/analytics',
        icon: 'TrendingUp',
        requiredPermissions: ['admin:analytics:view'],
      },
    ],
  },
  {
    groupTitle: 'Tenant Management',
    items: [
      {
        label: 'Businesses',
        path: '/admin/businesses',
        icon: 'Building2',
        badge: '48',
        requiredPermissions: ['admin:businesses:view'],
      },
      {
        label: 'Subscriptions',
        path: '/admin/subscriptions',
        icon: 'CreditCard',
        requiredPermissions: ['admin:subscriptions:view'],
      },
      {
        label: 'Plans',
        path: '/admin/plans',
        icon: 'Layers',
        requiredPermissions: ['admin:plans:view'],
      },
      {
        label: 'Transactions',
        path: '/admin/transactions',
        icon: 'Receipt',
        requiredPermissions: ['admin:transactions:view'],
      },
    ],
  },
  {
    groupTitle: 'Administration & Ops',
    items: [
      {
        label: 'Platform Users',
        path: '/admin/users',
        icon: 'Users',
        requiredPermissions: ['admin:users:view'],
      },
      {
        label: 'Support',
        path: '/admin/support',
        icon: 'LifeBuoy',
        badge: '3',
        requiredPermissions: ['admin:support:view'],
      },
      {
        label: 'Notifications',
        path: '/admin/notifications',
        icon: 'Bell',
        requiredPermissions: ['admin:notifications:view'],
      },
      {
        label: 'Settings',
        path: '/admin/settings',
        icon: 'Settings',
        requiredPermissions: ['admin:settings:view'],
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
