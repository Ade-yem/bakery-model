/**
 * @file Realistic mock data for the Cadence Platform Admin interface.
 */

import type {
  AdminNavGroup,
  PlatformMetric,
  TenantBusinessSummary,
  PlatformActivityItem,
  RevenueMetrics,
  RegistrationTrendPoint,
  SubscriptionDistribution,
} from './types';
import { PLATFORM_PERMISSIONS } from './permissions';

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    groupTitle: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    ],
  },
  {
    groupTitle: 'Platform Management',
    items: [
      { label: 'Businesses', path: '/admin/businesses', icon: 'Building2', badge: '48' },
      { label: 'Client Admin Accounts', path: '/admin/client-admins', icon: 'Users' },
    ],
  },
  {
    groupTitle: 'Billing Management',
    items: [
      { label: 'Subscription Plans', path: '/admin/plans', icon: 'Layers' },
      { label: 'Subscriptions', path: '/admin/subscriptions', icon: 'CreditCard' },
    ],
  },
  {
    groupTitle: 'System',
    items: [
      { label: 'Audit and Activity', path: '/admin/audit', icon: 'ShieldAlert' },
      { label: 'Platform Settings', path: '/admin/settings', icon: 'Settings' },
    ],
  },
];

export const MOCK_PLATFORM_METRICS: PlatformMetric[] = [
  {
    id: 'tenants',
    label: 'Total businesses',
    value: '48',
    change: '+12% this month',
    trend: 'up',
    subtext: 'Registered commercial enterprises',
    iconName: 'Building2',
    targetPath: '/admin/businesses',
    requiredPermission: PLATFORM_PERMISSIONS.BUSINESSES_VIEW,
  },
  {
    id: 'active_subscriptions',
    label: 'Active subscriptions',
    value: '42',
    change: '87.5% retention',
    trend: 'up',
    subtext: 'Growth & Business tiers',
    iconName: 'CreditCard',
    targetPath: '/admin/subscriptions',
    requiredPermission: PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
  },
  {
    id: 'pending_accounts',
    label: 'Pending accounts',
    value: '4',
    change: 'Needs verification',
    trend: 'neutral',
    subtext: 'Awaiting primary admin check',
    iconName: 'Clock3',
    targetPath: '/admin/businesses',
    requiredPermission: PLATFORM_PERMISSIONS.BUSINESSES_VIEW,
  },
  {
    id: 'expired_plans',
    label: 'Expired plans',
    value: '2',
    change: 'Requires renewal',
    trend: 'down',
    subtext: 'Grace period follow-up',
    iconName: 'CheckCircle2',
    targetPath: '/admin/subscriptions',
    requiredPermission: PLATFORM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
  },
];

export const MOCK_REVENUE_ANALYTICS: RevenueMetrics = {
  totalRevenueFormatted: '₦18,450,000',
  mrrFormatted: '₦14,800,000',
  changePercentage: '+14.2% vs previous period',
  periodLabel: 'Last 30 days',
  trendPoints: [
    { date: 'Oct 20', amount: 2400000, formatted: '₦2.4M' },
    { date: 'Oct 27', amount: 3100000, formatted: '₦3.1M' },
    { date: 'Nov 03', amount: 4200000, formatted: '₦4.2M' },
    { date: 'Nov 10', amount: 3900000, formatted: '₦3.9M' },
    { date: 'Nov 17', amount: 4850000, formatted: '₦4.85M' },
  ],
};

export const MOCK_REGISTRATION_TRENDS: {
  monthly: RegistrationTrendPoint[];
  weekly: RegistrationTrendPoint[];
} = {
  monthly: [
    { period: 'Jun', newRegistrations: 4 },
    { period: 'Jul', newRegistrations: 6 },
    { period: 'Aug', newRegistrations: 9 },
    { period: 'Sep', newRegistrations: 11 },
    { period: 'Oct', newRegistrations: 14 },
    { period: 'Nov', newRegistrations: 18 },
  ],
  weekly: [
    { period: 'Week 1', newRegistrations: 3 },
    { period: 'Week 2', newRegistrations: 4 },
    { period: 'Week 3', newRegistrations: 5 },
    { period: 'Week 4', newRegistrations: 6 },
  ],
};

export const MOCK_SUBSCRIPTION_DISTRIBUTION: SubscriptionDistribution = {
  active: 42,
  pending: 4,
  expired: 2,
  cancelled: 1,
};

export const MOCK_TENANT_BUSINESSES: TenantBusinessSummary[] = [
  {
    id: 'TEN-001',
    name: 'Golden Crust Bakery Works',
    ownerName: 'Adaeze Okonkwo',
    primaryAdminEmail: 'adaeze@goldencrust.ng',
    email: 'adaeze@goldencrust.ng',
    plan: 'Business',
    branchesCount: 4,
    activeShifts: 8,
    status: 'active',
    joinedDate: 'Jan 12, 2026',
    lastActive: '3 mins ago',
  },
  {
    id: 'TEN-002',
    name: 'Sweet Bakes Victoria Island',
    ownerName: 'Femi Alabi',
    primaryAdminEmail: 'femi@sweetbakes.com',
    email: 'femi@sweetbakes.com',
    plan: 'Growth',
    branchesCount: 2,
    activeShifts: 4,
    status: 'active',
    joinedDate: 'Feb 04, 2026',
    lastActive: '12 mins ago',
  },
  {
    id: 'TEN-003',
    name: 'Ikeja Artisan Flour House',
    ownerName: 'Chioma Adeleke',
    primaryAdminEmail: 'chioma@ikejaflour.ng',
    email: 'chioma@ikejaflour.ng',
    plan: 'Growth',
    branchesCount: 1,
    activeShifts: 2,
    status: 'active',
    joinedDate: 'Mar 18, 2026',
    lastActive: 'Just now',
  },
  {
    id: 'TEN-004',
    name: 'Daily Bread Express Ltd',
    ownerName: 'Emmanuel Adeyemi',
    primaryAdminEmail: 'emmanuel@dailybread.ng',
    email: 'emmanuel@dailybread.ng',
    plan: 'Starter',
    branchesCount: 1,
    activeShifts: 1,
    status: 'trial',
    joinedDate: 'Nov 01, 2026',
    lastActive: '45 mins ago',
  },
  {
    id: 'TEN-005',
    name: 'Obalende Dough & Pastry',
    ownerName: 'Blessing Udoh',
    primaryAdminEmail: 'blessing@obalendedough.com',
    email: 'blessing@obalendedough.com',
    plan: 'Starter',
    branchesCount: 1,
    activeShifts: 0,
    status: 'past_due',
    joinedDate: 'Aug 22, 2026',
    lastActive: '2 days ago',
  },
];

export const MOCK_PLATFORM_ACTIVITIES: PlatformActivityItem[] = [
  {
    id: 'act-1',
    type: 'business_registered',
    title: 'New business registered',
    description: 'Daily Bread Express Ltd completed registration for Starter Trial.',
    timestamp: '45 mins ago',
    actorName: 'Self-Service Portal',
    tenantName: 'Daily Bread Express Ltd',
    relatedEntity: 'TEN-004',
  },
  {
    id: 'act-2',
    type: 'subscription_activated',
    title: 'Subscription activated',
    description: 'Golden Crust Bakery Works activated Annual Business Tier.',
    timestamp: '2 hours ago',
    actorName: 'Amara Okafor (Super Admin)',
    tenantName: 'Golden Crust Bakery Works',
    relatedEntity: 'SUB-2026-08',
  },
  {
    id: 'act-3',
    type: 'plan_modified',
    title: 'Plan limits modified',
    description: 'Updated Growth Plan branch ceiling from 3 to 5 locations.',
    timestamp: '4 hours ago',
    actorName: 'Amara Okafor (Super Admin)',
    relatedEntity: 'PLAN-GROWTH',
  },
  {
    id: 'act-4',
    type: 'subscription_expired',
    title: 'Subscription expired',
    description: 'Obalende Dough & Pastry monthly tier reached end of cycle.',
    timestamp: '1 day ago',
    actorName: 'Billing Cron Gateway',
    tenantName: 'Obalende Dough & Pastry',
    relatedEntity: 'SUB-2026-01',
  },
  {
    id: 'act-5',
    type: 'account_suspended',
    title: 'Business account suspended',
    description: 'Highland Flour Mills suspended pending ownership re-verification.',
    timestamp: '2 days ago',
    actorName: 'Security Ops',
    tenantName: 'Highland Flour Mills',
    relatedEntity: 'TEN-009',
  },
  {
    id: 'act-6',
    type: 'settings_updated',
    title: 'Platform settings updated',
    description: 'Updated Flutterwave webhook security signing secret.',
    timestamp: '3 days ago',
    actorName: 'Amara Okafor (Super Admin)',
    relatedEntity: 'SECURITY_GATEWAY',
  },
];

export { MOCK_PLATFORM_BUSINESSES, MOCK_CLIENT_ADMINS } from './mock-businesses';


