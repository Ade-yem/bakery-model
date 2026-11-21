/**
 * @file Multi-tenant mock data fixtures for Cadence Client Admin workspaces.
 */

import type {
  ClientBusinessProfile,
  BusinessSubscriptionSnapshot,
  ClientBranch,
  ClientDepartment,
  ClientDepartmentConfig,
} from '../types';

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

export {
  INITIAL_ROLES,
  INITIAL_STAFF,
  INITIAL_SHIFTS,
  INITIAL_ACTIVITY,
  INITIAL_SETTINGS,
  MOCK_PERFORMANCE_GOLDEN_CRUST,
} from './mock-operations';
