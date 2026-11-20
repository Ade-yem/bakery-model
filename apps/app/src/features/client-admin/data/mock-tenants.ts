/**
 * @file Multi-tenant mock data fixtures for Cadence Client Admin workspaces.
 */

import type {
  ClientBusinessProfile,
  BusinessSubscriptionSnapshot,
  ClientBranch,
  ClientDepartment,
  ClientDepartmentConfig,
  ClientStaffMember,
  ClientRole,
  ClientShift,
  BusinessPerformanceOverview,
  BusinessActivityRecord,
  BusinessSettings,
} from './types';
import { CLIENT_PERMISSIONS } from './permissions';

/**
 * Tenant 1: Golden Crust Bakery Works (Large commercial bakery, Business Plan with multi-branch).
 */
export const MOCK_BUSINESS_GOLDEN_CRUST: ClientBusinessProfile = {
  id: 'TEN-001',
  name: 'Golden Crust Bakery Works',
  logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=128&q=80',
  email: 'info@goldencrust.ng',
  phone: '+234 802 345 6789',
  address: '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  businessType: 'Commercial Bakery & Pastry Chain',
  registrationNumber: 'RC-1849204',
  approvedFields: {
    taxIdentificationNumber: 'TIN-98741029',
    foodSafetyPermit: 'FSP-LAG-2026-081',
  },
  createdAt: '2026-01-12T08:00:00Z',
  updatedAt: '2026-02-15T10:00:00Z',
};

export const MOCK_SUBSCRIPTION_GOLDEN_CRUST: BusinessSubscriptionSnapshot = {
  planId: 'plan-business-m',
  planName: 'Business Monthly',
  tier: 'GROWTH',
  status: 'active',
  currentPeriodEnd: '2027-01-12T00:00:00Z',
  maxBranches: 5,
  maxStaff: 40,
  maxDepartments: 8,
  enabledModules: ['inventory', 'sales', 'orders', 'procurement', 'production', 'payments', 'credits'],
  isMultiBranchSupported: true,
};

/**
 * Tenant 2: Ikeja Artisan Flour House (Artisan bakery, Starter Plan, single branch, basic modules).
 */
export const MOCK_BUSINESS_IKEJA_ARTISAN: ClientBusinessProfile = {
  id: 'TEN-003',
  name: 'Ikeja Artisan Flour House',
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&q=80',
  email: 'contact@ikejaflour.ng',
  phone: '+234 805 444 5566',
  address: '22 Allen Avenue, Ikeja, Lagos, Nigeria',
  businessType: 'Artisan Bakery',
  registrationNumber: 'RC-2049182',
  approvedFields: {
    taxIdentificationNumber: 'TIN-44589211',
  },
  createdAt: '2026-03-18T09:00:00Z',
  updatedAt: '2026-03-18T09:00:00Z',
};

export const MOCK_SUBSCRIPTION_IKEJA_ARTISAN: BusinessSubscriptionSnapshot = {
  planId: 'plan-starter-m',
  planName: 'Starter Monthly',
  tier: 'STARTER',
  status: 'active',
  currentPeriodEnd: '2026-12-18T00:00:00Z',
  maxBranches: 1,
  maxStaff: 5,
  maxDepartments: 2,
  enabledModules: ['sales', 'orders'],
  isMultiBranchSupported: false,
};

/**
 * Initial branches for Golden Crust (TEN-001).
 */
export const INITIAL_BRANCHES: ClientBranch[] = [
  {
    id: 'br-lekki',
    businessId: 'TEN-001',
    name: 'Lekki Main Branch',
    code: 'LEK-01',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    contactEmail: 'lekki@goldencrust.ng',
    contactPhone: '+234 802 345 6781',
    managerName: 'Adaeze Okonkwo',
    managerId: 'staff-adaeze',
    status: 'active',
    isPrimary: true,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'br-victoria',
    businessId: 'TEN-001',
    name: 'Victoria Island Outlet',
    code: 'VI-02',
    address: '25 Adeola Odeku St, Victoria Island, Lagos',
    contactEmail: 'vi@goldencrust.ng',
    contactPhone: '+234 802 345 6782',
    managerName: 'Femi Alabi',
    managerId: 'staff-femi',
    status: 'active',
    isPrimary: false,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'br-ikeja-hub',
    businessId: 'TEN-001',
    name: 'Ikeja Production Hub',
    code: 'IKJ-03',
    address: '88 Oba Akran Avenue, Ikeja Industrial Estate, Lagos',
    contactEmail: 'ikeja@goldencrust.ng',
    contactPhone: '+234 802 345 6783',
    managerName: 'Babatunde Adeleke',
    managerId: 'staff-baba',
    status: 'active',
    isPrimary: false,
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'br-surulere',
    businessId: 'TEN-001',
    name: 'Surulere Retail Shop',
    code: 'SRL-04',
    address: '56 Adeniran Ogunsanya St, Surulere, Lagos',
    contactEmail: 'surulere@goldencrust.ng',
    contactPhone: '+234 802 345 6784',
    managerName: 'Grace Eze',
    managerId: 'staff-grace',
    status: 'inactive',
    isPrimary: false,
    createdAt: '2026-02-14T09:00:00Z',
    updatedAt: '2026-02-14T09:00:00Z',
  },
  // Single branch for Ikeja Artisan (TEN-003)
  {
    id: 'br-ikeja-single',
    businessId: 'TEN-003',
    name: 'Allen Avenue Bakery',
    code: 'ALN-01',
    address: '22 Allen Avenue, Ikeja, Lagos',
    contactEmail: 'hello@ikejaflour.ng',
    contactPhone: '+234 805 444 5566',
    managerName: 'Chioma Adeleke',
    managerId: 'staff-chioma',
    status: 'active',
    isPrimary: true,
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-18T09:00:00Z',
  },
];

/**
 * Initial dynamically configured departments.
 */
export const INITIAL_DEPARTMENTS: ClientDepartment[] = [
  {
    id: 'dept-prod',
    businessId: 'TEN-001',
    name: 'Baking & Production',
    description: 'Dough preparation, oven operations, slicing and packaging batches.',
    managerName: 'Danladi Bello',
    managerId: 'staff-danladi',
    status: 'active',
    staffCount: 14,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'dept-sales',
    businessId: 'TEN-001',
    name: 'Sales & Front Counter',
    description: 'Cashier checkout, retail counters, walk-in customer reception, and daily cash balancing.',
    managerName: 'Chioma Okafor',
    managerId: 'staff-chioma-gc',
    status: 'active',
    staffCount: 8,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'dept-dispatch',
    businessId: 'TEN-001',
    name: 'Logistics & Dispatch',
    description: 'Distribution van loading, delivery manifests, wholesale customer drop-offs.',
    managerName: 'Emeka Nwosu',
    managerId: 'staff-emeka',
    status: 'active',
    staffCount: 6,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'dept-procure',
    businessId: 'TEN-001',
    name: 'Procurement & Storage',
    description: 'Raw materials receiving, flour sack tallying, vendor quality inspection.',
    managerName: 'Blessing Yusuf',
    managerId: 'staff-blessing',
    status: 'active',
    staffCount: 4,
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-01-18T08:00:00Z',
  },
  // Ikeja Artisan Departments (TEN-003)
  {
    id: 'dept-ikeja-front',
    businessId: 'TEN-003',
    name: 'Bakery Shop Floor',
    description: 'Daily artisan baking and front-desk customer sales.',
    managerName: 'Chioma Adeleke',
    managerId: 'staff-chioma',
    status: 'active',
    staffCount: 3,
    createdAt: '2026-03-18T09:00:00Z',
    updatedAt: '2026-03-18T09:00:00Z',
  },
];

/**
 * Department configuration fixtures.
 */
export const INITIAL_DEPARTMENT_CONFIGS: Record<string, ClientDepartmentConfig> = {
  'dept-prod': {
    departmentId: 'dept-prod',
    businessId: 'TEN-001',
    duties: [
      {
        id: 'duty-mix',
        title: 'Morning Flour Mixing & Kneading',
        description: 'Verify recipe hydration ratios and yeast resting times.',
        assignedRoleIds: ['role-prod-sup'],
        assignedStaffIds: ['staff-danladi'],
      },
      {
        id: 'duty-bake',
        title: 'Oven Temperature Calibration & Loading',
        description: 'Operate stone rotary deck ovens at 230°C.',
        assignedRoleIds: ['role-baker'],
        assignedStaffIds: [],
      },
      {
        id: 'duty-tally',
        title: 'Batch Output Tallying & Waste Recording',
        description: 'Count finished bread loaves and seal shift batch records.',
        assignedRoleIds: ['role-prod-sup'],
        assignedStaffIds: ['staff-danladi'],
      },
    ],
    enabledModules: ['production', 'inventory'],
    availableActions: ['create', 'view', 'edit', 'approve'],
    recordTypes: ['ProductionBatch', 'MaterialRequisition', 'OvenLog', 'WasteReport'],
    permissionRules: {
      canCrossBranchView: false,
      requireShiftActive: true,
    },
    updatedAt: '2026-02-10T12:00:00Z',
  },
  'dept-sales': {
    departmentId: 'dept-sales',
    businessId: 'TEN-001',
    duties: [
      {
        id: 'duty-checkout',
        title: 'POS Tender Processing',
        description: 'Process card, cash, and bank transfer receipts.',
        assignedRoleIds: ['role-cashier'],
        assignedStaffIds: [],
      },
      {
        id: 'duty-shift-seal',
        title: 'End of Shift Drawer Reconciliation',
        description: 'Count physical drawer cash and match against POS expected total.',
        assignedRoleIds: ['role-mgr'],
        assignedStaffIds: ['staff-chioma-gc'],
      },
    ],
    enabledModules: ['sales', 'orders', 'payments', 'credits'],
    availableActions: ['create', 'view', 'edit'],
    recordTypes: ['SalesReceipt', 'CashDrawerCount', 'CustomerCredit'],
    permissionRules: {
      canCrossBranchView: false,
      requireShiftActive: true,
    },
    updatedAt: '2026-02-12T14:00:00Z',
  },
};

/**
 * Roles & permissions list.
 */
export const INITIAL_ROLES: ClientRole[] = [
  {
    id: 'role-admin',
    businessId: 'TEN-001',
    name: 'General Manager / Director',
    code: 'GM',
    description: 'Full workspace authority across all departments, branches, and financials.',
    isSystem: true,
    status: 'active',
    permissions: Object.values(CLIENT_PERMISSIONS),
    staffCount: 2,
    createdAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'role-mgr',
    businessId: 'TEN-001',
    name: 'Branch Operations Manager',
    code: 'BOM',
    description: 'Manages branch shifts, staff assignments, inventory tallies, and daily sales.',
    isSystem: false,
    status: 'active',
    permissions: [
      CLIENT_PERMISSIONS.OVERVIEW_VIEW,
      CLIENT_PERMISSIONS.BRANCHES_VIEW,
      CLIENT_PERMISSIONS.DEPARTMENTS_VIEW,
      CLIENT_PERMISSIONS.STAFF_VIEW,
      CLIENT_PERMISSIONS.SHIFTS_VIEW,
      CLIENT_PERMISSIONS.SHIFTS_MANAGE,
      CLIENT_PERMISSIONS.INVENTORY_VIEW,
      CLIENT_PERMISSIONS.INVENTORY_MANAGE,
      CLIENT_PERMISSIONS.SALES_VIEW,
      CLIENT_PERMISSIONS.ORDERS_VIEW,
      CLIENT_PERMISSIONS.PRODUCTION_VIEW,
      CLIENT_PERMISSIONS.REPORTS_VIEW,
    ],
    staffCount: 4,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'role-prod-sup',
    businessId: 'TEN-001',
    name: 'Production Supervisor',
    code: 'PSUP',
    description: 'Manages batch recipes, oven schedules, and raw material requisitions.',
    isSystem: false,
    status: 'active',
    permissions: [
      CLIENT_PERMISSIONS.OVERVIEW_VIEW,
      CLIENT_PERMISSIONS.DEPARTMENTS_VIEW,
      CLIENT_PERMISSIONS.SHIFTS_VIEW,
      CLIENT_PERMISSIONS.PRODUCTION_VIEW,
      CLIENT_PERMISSIONS.PRODUCTION_MANAGE,
      CLIENT_PERMISSIONS.INVENTORY_VIEW,
    ],
    staffCount: 3,
    createdAt: '2026-01-18T08:00:00Z',
  },
  {
    id: 'role-cashier',
    businessId: 'TEN-001',
    name: 'Sales Cashier',
    code: 'CSH',
    description: 'Handles customer checkout, payments, and receipt generation.',
    isSystem: false,
    status: 'active',
    permissions: [
      CLIENT_PERMISSIONS.SALES_VIEW,
      CLIENT_PERMISSIONS.SALES_MANAGE,
      CLIENT_PERMISSIONS.ORDERS_VIEW,
      CLIENT_PERMISSIONS.PAYMENTS_VIEW,
    ],
    staffCount: 8,
    createdAt: '2026-01-20T08:00:00Z',
  },
];

/**
 * Staff directory.
 */
export const INITIAL_STAFF: ClientStaffMember[] = [
  {
    id: 'staff-adaeze',
    businessId: 'TEN-001',
    staffId: 'STF-001',
    fullName: 'Adaeze Okonkwo',
    email: 'adaeze@goldencrust.ng',
    phone: '+234 802 345 6780',
    departmentId: 'dept-sales',
    departmentName: 'Sales & Front Counter',
    roleId: 'role-admin',
    roleName: 'General Manager / Director',
    branchId: 'br-lekki',
    branchName: 'Lekki Main Branch',
    status: 'active',
    createdAt: '2026-01-12T08:00:00Z',
    lastActive: 'Just now',
  },
  {
    id: 'staff-danladi',
    businessId: 'TEN-001',
    staffId: 'STF-002',
    fullName: 'Danladi Bello',
    email: 'danladi@goldencrust.ng',
    phone: '+234 802 111 2233',
    departmentId: 'dept-prod',
    departmentName: 'Baking & Production',
    roleId: 'role-prod-sup',
    roleName: 'Production Supervisor',
    branchId: 'br-lekki',
    branchName: 'Lekki Main Branch',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
    lastActive: '5 mins ago',
  },
  {
    id: 'staff-chioma-gc',
    businessId: 'TEN-001',
    staffId: 'STF-003',
    fullName: 'Chioma Okafor',
    email: 'chioma.o@goldencrust.ng',
    phone: '+234 802 999 8877',
    departmentId: 'dept-sales',
    departmentName: 'Sales & Front Counter',
    roleId: 'role-cashier',
    roleName: 'Sales Cashier',
    branchId: 'br-lekki',
    branchName: 'Lekki Main Branch',
    status: 'active',
    createdAt: '2026-01-16T10:00:00Z',
    lastActive: '12 mins ago',
  },
  {
    id: 'staff-femi',
    businessId: 'TEN-001',
    staffId: 'STF-004',
    fullName: 'Femi Alabi',
    email: 'femi@goldencrust.ng',
    phone: '+234 803 555 4433',
    departmentId: 'dept-sales',
    departmentName: 'Sales & Front Counter',
    roleId: 'role-mgr',
    roleName: 'Branch Operations Manager',
    branchId: 'br-victoria',
    branchName: 'Victoria Island Outlet',
    status: 'active',
    createdAt: '2026-01-20T11:00:00Z',
    lastActive: '1 hour ago',
  },
  {
    id: 'staff-emeka',
    businessId: 'TEN-001',
    staffId: 'STF-005',
    fullName: 'Emeka Nwosu',
    email: 'emeka@goldencrust.ng',
    phone: '+234 807 666 5544',
    departmentId: 'dept-dispatch',
    departmentName: 'Logistics & Dispatch',
    roleId: 'role-mgr',
    roleName: 'Branch Operations Manager',
    branchId: 'br-ikeja-hub',
    branchName: 'Ikeja Production Hub',
    status: 'active',
    createdAt: '2026-01-22T08:30:00Z',
    lastActive: '3 hours ago',
  },
];

/**
 * Shifts scheduled.
 */
export const INITIAL_SHIFTS: ClientShift[] = [
  {
    id: 'sh-morning-lekki',
    businessId: 'TEN-001',
    name: 'Morning Artisanal Bake',
    shiftType: 'day',
    startTime: '05:30',
    endTime: '13:30',
    assignedDepartmentId: 'dept-prod',
    assignedBranchId: 'br-lekki',
    assignedStaffIds: ['staff-danladi'],
    shiftDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    rotationPattern: 'fixed',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'sh-retail-lekki',
    businessId: 'TEN-001',
    name: 'Front Counter Day Shift',
    shiftType: 'day',
    startTime: '07:30',
    endTime: '16:00',
    assignedDepartmentId: 'dept-sales',
    assignedBranchId: 'br-lekki',
    assignedStaffIds: ['staff-chioma-gc'],
    shiftDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    rotationPattern: 'weekly_rotation',
    status: 'active',
    createdAt: '2026-01-16T08:00:00Z',
  },
  {
    id: 'sh-night-prep',
    businessId: 'TEN-001',
    name: 'Overnight Yeast Fermentation',
    shiftType: 'night',
    startTime: '22:00',
    endTime: '05:00',
    assignedDepartmentId: 'dept-prod',
    assignedBranchId: 'br-ikeja-hub',
    assignedStaffIds: ['staff-emeka'],
    shiftDays: ['mon', 'wed', 'fri'],
    rotationPattern: 'biweekly_rotation',
    status: 'active',
    createdAt: '2026-01-25T08:00:00Z',
  },
];

/**
 * Business overview performance KPI snapshot.
 */
export const MOCK_PERFORMANCE_GOLDEN_CRUST: BusinessPerformanceOverview = {
  totalOrdersCount: 1428,
  totalOrdersAmount: 4890000,
  totalSalesAmount: 5120500,
  inventoryAlertsCount: 3,
  totalStockBatches: 28,
  activeBatchesCount: 4,
  completedBatchesToday: 18,
  procurementPendingCount: 2,
  procurementPendingAmount: 850000,
  outstandingCreditsCount: 6,
  outstandingCreditsAmount: 320000,
  currency: 'NGN',
};

/**
 * Activity log fixtures.
 */
export const INITIAL_ACTIVITY: BusinessActivityRecord[] = [
  {
    id: 'act-1',
    businessId: 'TEN-001',
    type: 'sale',
    title: 'Walk-in Register Sealed',
    description: 'Lekki Main Branch cashier drawer reconciled: ₦412,500 cash balanced.',
    actorId: 'staff-chioma-gc',
    actorName: 'Chioma Okafor',
    departmentName: 'Sales & Front Counter',
    timestamp: '15 mins ago',
  },
  {
    id: 'act-2',
    businessId: 'TEN-001',
    type: 'production',
    title: 'Batch Completed: Golden Brioche #482',
    description: 'Produced 450 units. Yield variance 0.4% within expected standard.',
    actorId: 'staff-danladi',
    actorName: 'Danladi Bello',
    departmentName: 'Baking & Production',
    timestamp: '42 mins ago',
  },
  {
    id: 'act-3',
    businessId: 'TEN-001',
    type: 'order',
    title: 'Wholesale Order Dispatched',
    description: 'Order #ORD-8419 (600 Sandwich Loaves) handed over to Logistics van #3.',
    actorId: 'staff-emeka',
    actorName: 'Emeka Nwosu',
    departmentName: 'Logistics & Dispatch',
    timestamp: '2 hours ago',
  },
  {
    id: 'act-4',
    businessId: 'TEN-001',
    type: 'staff',
    title: 'Shift Schedule Published',
    description: 'Next week roster for Lekki Main Branch verified and sealed without conflicts.',
    actorId: 'staff-adaeze',
    actorName: 'Adaeze Okonkwo',
    departmentName: 'Operations Directorate',
    timestamp: '5 hours ago',
  },
];

/**
 * Business workspace settings.
 */
export const INITIAL_SETTINGS: BusinessSettings = {
  businessId: 'TEN-001',
  general: {
    businessDisplayName: 'Golden Crust Bakery Works',
    operatingHoursStart: '06:00',
    operatingHoursEnd: '21:00',
    autoSealShifts: false,
  },
  localization: {
    currency: 'NGN',
    timeZone: 'Africa/Lagos (GMT+1)',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  workspace: {
    requireBranchSelection: true,
    allowCrossBranchTransfers: true,
  },
  notifications: {
    emailAlertsEnabled: true,
    smsAlertsEnabled: true,
    lowStockThresholdPercent: 15,
    dailyDigestEmail: 'digest@goldencrust.ng',
  },
  security: {
    sessionTimeoutMinutes: 60,
    enforceTwoFactor: true,
    passwordExpirationDays: 90,
  },
};
