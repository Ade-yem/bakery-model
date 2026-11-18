/**
 * @file TypeScript contracts and interfaces for Cadence Platform Admin interface.
 */

export interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

export interface AdminNavGroup {
  groupTitle: string;
  items: AdminNavItem[];
}

export interface PlatformMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
  iconName: string;
  targetPath?: string;
  requiredPermission?: string;
}

export interface TenantBusinessSummary {
  id: string;
  name: string;
  ownerName: string;
  primaryAdminEmail?: string;
  email: string;
  plan: 'Starter' | 'Growth' | 'Business';
  branchesCount: number;
  activeShifts: number;
  status: 'active' | 'trial' | 'past_due' | 'suspended';
  joinedDate: string;
  lastActive: string;
}

export interface RevenueTrendPoint {
  date: string;
  amount: number;
  formatted: string;
}

export interface RevenueMetrics {
  totalRevenueFormatted: string;
  mrrFormatted: string;
  changePercentage: string;
  periodLabel: string;
  trendPoints: RevenueTrendPoint[];
}

export interface RegistrationTrendPoint {
  period: string;
  newRegistrations: number;
}

export interface SubscriptionDistribution {
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
}

export interface PlatformActivityItem {
  id: string;
  type:
    | 'business_registered'
    | 'subscription_activated'
    | 'subscription_expired'
    | 'plan_modified'
    | 'account_suspended'
    | 'settings_updated'
    | 'tenant_joined'
    | 'plan_upgraded'
    | 'sync_warning'
    | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
  tenantName?: string;
  relatedEntity?: string;
}

/**
 * Detailed business account entity for Platform Management.
 */
export interface PlatformBusiness {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber: string;
  primaryAdminName: string;
  primaryAdminEmail: string;
  primaryAdminPhone: string;
  plan: 'Starter' | 'Growth' | 'Business';
  billingCycle: 'Monthly' | 'Annual';
  subscriptionPrice: string;
  subscriptionStatus: 'active' | 'pending' | 'expired' | 'cancelled';
  subscriptionStartDate: string;
  subscriptionExpiryDate: string;
  accountStatus: 'active' | 'pending' | 'suspended';
  branchesCount: number;
  activeShifts: number;
  registrationDate: string;
  lastActive: string;
  recentActivity?: PlatformActivityItem[];
}

/**
 * Primary client administrator account linked to a tenant business.
 * Excludes client business staff.
 */
export interface PlatformClientAdmin {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  businessId: string;
  businessName: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  lastLoginAt: string;
  roleTitle: string;
}

/**
 * State filter parameters for the Businesses directory.
 */
export interface BusinessFilterState {
  search: string;
  status: 'all' | 'active' | 'pending' | 'suspended';
  plan: 'all' | 'Starter' | 'Growth' | 'Business';
  dateRange: 'all' | '30d' | '90d' | 'year';
}

/**
 * State filter parameters for the Client Admin Accounts directory.
 */
export interface ClientAdminFilterState {
  search: string;
  businessId: string;
  status: 'all' | 'active' | 'pending' | 'suspended';
}

/**
 * Cadence subscription plan entity managed by Platform Admins.
 */
export interface PlatformSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  includedModules: string[];
  usageLimits: {
    staffAccounts: number | 'unlimited';
    departments: number | 'unlimited';
    storageAllowance: string;
    branches: number | 'unlimited';
  };
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  subscribersCount: number;
}

/**
 * Filter criteria for the Subscription Plans table.
 */
export interface PlanFilterState {
  search: string;
  status: 'all' | 'active' | 'archived';
  billingPeriod: 'all' | 'monthly' | 'quarterly' | 'annual';
}

/**
 * Verified payment record for a client subscription.
 */
export interface PlatformPaymentRecord {
  id: string;
  reference: string;
  transactionReference: string;
  amount: number;
  currency: string;
  paymentMethod: 'Bank Transfer' | 'Card' | 'Flutterwave' | 'Cash/Direct';
  paymentDate: string;
  paymentStatus: 'successful' | 'pending' | 'failed';
  status: 'successful' | 'pending' | 'failed';
  receiptUrl?: string;
}

/**
 * Audit event item for subscription history timeline.
 */
export interface PlatformSubscriptionHistoryEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  type: 'created' | 'plan_changed' | 'payment_received' | 'extended' | 'cancelled' | 'reactivated';
}

/**
 * Subscription record for a client business on the platform.
 */
export interface PlatformSubscription {
  id: string;
  businessId: string;
  businessName: string;
  planId: string;
  planName: string;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  price: number;
  currency: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  nextRenewalDate?: string;
  includedModules: string[];
  usageLimits: {
    staffAccounts: number | 'unlimited';
    departments: number | 'unlimited';
    storageAllowance: string;
    branches: number | 'unlimited';
  };
  lastPayment?: PlatformPaymentRecord;
  paymentRecords: PlatformPaymentRecord[];
  paymentHistory: PlatformPaymentRecord[];
  historyEvents: PlatformSubscriptionHistoryEvent[];
}

/**
 * Filter criteria for the Subscriptions directory table.
 */
export interface SubscriptionFilterState {
  search: string;
  subscriptionStatus: 'all' | 'active' | 'pending' | 'expired' | 'cancelled';
  paymentStatus: 'all' | 'paid' | 'pending' | 'failed' | 'refunded';
  plan: 'all' | string;
  billingPeriod: 'all' | 'monthly' | 'quarterly' | 'annual';
  dateRange: 'all' | '30d' | '90d' | 'year';
}

/**
 * Audit log entry tracking administrative events across the platform.
 */
export interface PlatformAuditRecord {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  actionType:
    | 'business_activated'
    | 'business_suspended'
    | 'plan_created'
    | 'plan_updated'
    | 'plan_archived'
    | 'subscription_extended'
    | 'subscription_cancelled'
    | 'subscription_plan_changed'
    | 'settings_updated'
    | 'client_admin_status_changed'
    | 'security_event';
  module:
    | 'Businesses'
    | 'Subscription Plans'
    | 'Subscriptions'
    | 'Client Admins'
    | 'Platform Settings'
    | 'Security / Auth';
  description: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'warning' | 'failure';
  relatedEntity?: {
    type: 'business' | 'subscription' | 'plan' | 'client_admin' | 'settings';
    id: string;
    name: string;
  };
  diff?: {
    field: string;
    previousValue: string;
    newValue: string;
  }[];
}

/**
 * Filter criteria for the Audit and Activity log table.
 */
export interface AuditFilterState {
  search: string;
  module: 'all' | string;
  actionType: 'all' | string;
  administrator: 'all' | string;
  dateRange: 'all' | 'today' | '7d' | '30d';
  status: 'all' | 'success' | 'warning' | 'failure';
}

/**
 * Global Cadence platform-wide configuration settings.
 */
export interface PlatformSettings {
  /** General Platform Information */
  platformName: string;
  platformDescription: string;
  platformLogoUrl: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;

  /** Platform Preferences */
  defaultCurrency: string;
  defaultTimeZone: string;
  dateFormat: string;
  timeFormat: string;
  defaultLanguage: string;

  /** Notification Preferences */
  notifyNewRegistration: boolean;
  notifySubscriptionExpiry: boolean;
  notifyPaymentFailure: boolean;
  notifyAdminAlerts: boolean;
  alertEmail: string;

  /** Security Policies */
  sessionTimeoutMinutes: number;
  requireMfaForAdmins: boolean;
  passwordMinLength: number;
  requireSpecialChar: boolean;

  /** Metadata */
  lastUpdated: string;
  updatedBy: string;
}


