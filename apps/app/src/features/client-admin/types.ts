/**
 * @file Type definitions and contracts for the Cadence Client Admin Dashboard.
 */

import type { SubscriptionTier } from '@repo/shared';

/**
 * Operational modules available across the Cadence platform.
 */
export type OperationalModuleKey =
  | 'inventory'
  | 'sales'
  | 'orders'
  | 'procurement'
  | 'production'
  | 'payments'
  | 'credits';

/**
 * Client business organization profile.
 */
export interface ClientBusinessProfile {
  id: string;
  name: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  registrationNumber?: string;
  approvedFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tenant subscription snapshot resolved for the business workspace.
 */
export interface BusinessSubscriptionSnapshot {
  planId: string;
  planName: string;
  tier: SubscriptionTier;
  status: 'active' | 'trialing' | 'past_due' | 'suspended' | 'canceled';
  currentPeriodEnd: string;
  maxBranches: number;
  maxStaff: number;
  maxDepartments: number;
  enabledModules: OperationalModuleKey[];
  isMultiBranchSupported: boolean;
}

/**
 * Branch location belonging to a client business.
 */
export interface ClientBranch {
  id: string;
  businessId: string;
  name: string;
  code: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  managerName?: string;
  managerId?: string;
  status: 'active' | 'inactive';
  isPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dynamic department within a business.
 */
export interface ClientDepartment {
  id: string;
  businessId: string;
  name: string;
  description: string;
  managerName?: string;
  managerId?: string;
  status: 'active' | 'inactive';
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Specific operational duty assigned within a department.
 */
export interface DepartmentDuty {
  id: string;
  title: string;
  description: string;
  assignedRoleIds: string[];
  assignedStaffIds: string[];
}

/**
 * Granular configuration for a department.
 */
export interface ClientDepartmentConfig {
  departmentId: string;
  businessId: string;
  duties: DepartmentDuty[];
  enabledModules: OperationalModuleKey[];
  availableActions: ('create' | 'view' | 'edit' | 'approve' | 'delete')[];
  recordTypes: string[];
  permissionRules: {
    canCrossBranchView: boolean;
    requireShiftActive: boolean;
  };
  updatedAt: string;
}

/**
 * Staff member in a business workspace.
 */
export interface ClientStaffMember {
  id: string;
  businessId: string;
  staffId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  departmentId: string;
  departmentName: string;
  roleId: string;
  roleName: string;
  branchId?: string;
  branchName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastActive?: string;
}

/**
 * Granular business role with assigned permissions.
 */
export interface ClientRole {
  id: string;
  businessId: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  status: 'active' | 'inactive';
  permissions: string[];
  departmentIds?: string[];
  staffCount: number;
  createdAt: string;
}

/**
 * Shift definition within a business.
 */
export interface ClientShift {
  id: string;
  businessId: string;
  name: string;
  shiftType: 'day' | 'evening' | 'night' | 'custom';
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  assignedDepartmentId: string;
  assignedBranchId?: string;
  assignedStaffIds: string[];
  shiftDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  rotationPattern: 'fixed' | 'weekly_rotation' | 'biweekly_rotation';
  status: 'active' | 'inactive';
  createdAt: string;
}

/**
 * Shift scheduling conflict descriptor.
 */
export interface ShiftConflict {
  type: 'time_overlap' | 'duplicate_staff' | 'invalid_time_range';
  message: string;
  staffId?: string;
  staffName?: string;
  conflictingShiftId?: string;
  conflictingShiftName?: string;
}

/**
 * Summary metrics displayed on the Business Dashboard Overview.
 */
export interface BusinessPerformanceOverview {
  totalOrdersCount: number;
  totalOrdersAmount: number;
  totalSalesAmount: number;
  inventoryAlertsCount: number;
  totalStockBatches: number;
  activeBatchesCount: number;
  completedBatchesToday: number;
  procurementPendingCount: number;
  procurementPendingAmount: number;
  outstandingCreditsCount: number;
  outstandingCreditsAmount: number;
  currency: string;
}

/**
 * Business activity audit record.
 */
export interface BusinessActivityRecord {
  id: string;
  businessId: string;
  type: 'order' | 'sale' | 'production' | 'shift' | 'staff' | 'config';
  title: string;
  description: string;
  actorId: string;
  actorName: string;
  departmentName?: string;
  timestamp: string;
}

/**
 * Business workspace preferences & configuration.
 */
export interface BusinessSettings {
  businessId: string;
  general: {
    businessDisplayName: string;
    operatingHoursStart: string;
    operatingHoursEnd: string;
    autoSealShifts: boolean;
  };
  localization: {
    currency: string;
    timeZone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  workspace: {
    requireBranchSelection: boolean;
    allowCrossBranchTransfers: boolean;
  };
  notifications: {
    emailAlertsEnabled: boolean;
    smsAlertsEnabled: boolean;
    lowStockThresholdPercent: number;
    dailyDigestEmail: string;
  };
  security: {
    sessionTimeoutMinutes: number;
    enforceTwoFactor: boolean;
    passwordExpirationDays: number;
  };
}
