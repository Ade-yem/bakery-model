/**
 * @file Multi-tenant React Context Provider managing active business workspace state,
 * subscription feature limits, and tenant-scoped data mutations.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { AuthenticatedActor } from '../../../components/layout/types';
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
} from '../types';
import { CLIENT_PERMISSIONS } from '../permissions';
import {
  MOCK_BUSINESS_GOLDEN_CRUST,
  MOCK_SUBSCRIPTION_GOLDEN_CRUST,
  MOCK_BUSINESS_IKEJA_ARTISAN,
  MOCK_SUBSCRIPTION_IKEJA_ARTISAN,
  INITIAL_BRANCHES,
  INITIAL_DEPARTMENTS,
  INITIAL_DEPARTMENT_CONFIGS,
  INITIAL_ROLES,
  INITIAL_STAFF,
  INITIAL_SHIFTS,
  MOCK_PERFORMANCE_GOLDEN_CRUST,
  INITIAL_ACTIVITY,
  INITIAL_SETTINGS,
} from '../data/mock-tenants';

export interface TenantContextValue {
  currentBusiness: ClientBusinessProfile;
  subscription: BusinessSubscriptionSnapshot;
  actor: AuthenticatedActor;
  availableBusinesses: ClientBusinessProfile[];
  branches: ClientBranch[];
  departments: ClientDepartment[];
  staff: ClientStaffMember[];
  roles: ClientRole[];
  shifts: ClientShift[];
  performance: BusinessPerformanceOverview;
  activity: BusinessActivityRecord[];
  settings: BusinessSettings;
  switchTenant: (businessId: string) => void;
  updateBusinessProfile: (updates: Partial<ClientBusinessProfile>) => void;
  createBranch: (data: Omit<ClientBranch, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  updateBranch: (id: string, updates: Partial<ClientBranch>) => void;
  toggleBranchStatus: (id: string) => void;
  createDepartment: (data: Omit<ClientDepartment, 'id' | 'businessId' | 'staffCount' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  updateDepartment: (id: string, updates: Partial<ClientDepartment>) => void;
  toggleDepartmentStatus: (id: string) => { success: boolean; error?: string };
  deleteDepartment: (id: string) => { success: boolean; error?: string };
  getDepartmentConfig: (departmentId: string) => ClientDepartmentConfig | undefined;
  saveDepartmentConfig: (config: ClientDepartmentConfig) => void;
  createStaff: (data: Omit<ClientStaffMember, 'id' | 'businessId' | 'createdAt'>) => { success: boolean; error?: string };
  updateStaff: (id: string, updates: Partial<ClientStaffMember>) => void;
  toggleStaffStatus: (id: string) => void;
  createRole: (data: Omit<ClientRole, 'id' | 'businessId' | 'staffCount' | 'createdAt'>) => { success: boolean; error?: string };
  updateRole: (id: string, updates: Partial<ClientRole>) => void;
  createShift: (data: Omit<ClientShift, 'id' | 'businessId' | 'createdAt'>) => { success: boolean; error?: string };
  updateShift: (id: string, updates: Partial<ClientShift>) => void;
  deleteShift: (id: string) => void;
  updateSettings: (updates: Partial<BusinessSettings>) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

const TENANT_OPTIONS = [MOCK_BUSINESS_GOLDEN_CRUST, MOCK_BUSINESS_IKEJA_ARTISAN];

export function TenantProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('TEN-001');

  // Business state
  const [businesses, setBusinesses] = useState<ClientBusinessProfile[]>(TENANT_OPTIONS);

  // Tenant-scoped datasets
  const [allBranches, setAllBranches] = useState<ClientBranch[]>(INITIAL_BRANCHES);
  const [allDepartments, setAllDepartments] = useState<ClientDepartment[]>(INITIAL_DEPARTMENTS);
  const [allDepartmentConfigs, setAllDepartmentConfigs] = useState<Record<string, ClientDepartmentConfig>>(INITIAL_DEPARTMENT_CONFIGS);
  const [allRoles, setAllRoles] = useState<ClientRole[]>(INITIAL_ROLES);
  const [allStaff, setAllStaff] = useState<ClientStaffMember[]>(INITIAL_STAFF);
  const [allShifts, setAllShifts] = useState<ClientShift[]>(INITIAL_SHIFTS);
  const [activityRecords, setActivityRecords] = useState<BusinessActivityRecord[]>(INITIAL_ACTIVITY);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);

  const currentBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || businesses[0],
    [businesses, selectedBusinessId]
  );

  const subscription = useMemo<BusinessSubscriptionSnapshot>(() => {
    if (currentBusiness.id === 'TEN-003') {
      return MOCK_SUBSCRIPTION_IKEJA_ARTISAN;
    }
    return MOCK_SUBSCRIPTION_GOLDEN_CRUST;
  }, [currentBusiness.id]);

  const actor = useMemo<AuthenticatedActor>(() => {
    return {
      id: `actor-${currentBusiness.id}`,
      fullName: currentBusiness.id === 'TEN-003' ? 'Chioma Adeleke' : 'Adaeze Okonkwo',
      email: currentBusiness.email,
      designation: currentBusiness.id === 'TEN-003' ? 'Bakery Owner' : 'Operations Director',
      roleBadge: 'Business Admin',
      initials: currentBusiness.id === 'TEN-003' ? 'CA' : 'AO',
      tenantName: currentBusiness.name,
      permissions: Object.values(CLIENT_PERMISSIONS),
    };
  }, [currentBusiness]);

  // Strict tenant filtering
  const branches = useMemo(
    () => allBranches.filter((b) => b.businessId === currentBusiness.id),
    [allBranches, currentBusiness.id]
  );

  const departments = useMemo(
    () => allDepartments.filter((d) => d.businessId === currentBusiness.id),
    [allDepartments, currentBusiness.id]
  );

  const staff = useMemo(
    () => allStaff.filter((s) => s.businessId === currentBusiness.id),
    [allStaff, currentBusiness.id]
  );

  const roles = useMemo(
    () => allRoles.filter((r) => r.businessId === currentBusiness.id),
    [allRoles, currentBusiness.id]
  );

  const shifts = useMemo(
    () => allShifts.filter((s) => s.businessId === currentBusiness.id),
    [allShifts, currentBusiness.id]
  );

  const activity = useMemo(
    () => activityRecords.filter((a) => a.businessId === currentBusiness.id),
    [activityRecords, currentBusiness.id]
  );

  const switchTenant = (businessId: string) => {
    setSelectedBusinessId(businessId);
  };

  const updateBusinessProfile = (updates: Partial<ClientBusinessProfile>) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === currentBusiness.id
          ? { ...b, ...updates, updatedAt: new Date().toISOString() }
          : b
      )
    );
  };

  // Branch operations with subscription limit enforcement
  const createBranch = (data: Omit<ClientBranch, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    if (!subscription.isMultiBranchSupported) {
      return { success: false, error: 'Your current subscription plan does not include multi-branch support.' };
    }
    if (branches.length >= subscription.maxBranches) {
      return { success: false, error: `Branch limit of ${subscription.maxBranches} reached for plan ${subscription.planName}.` };
    }
    const newBranch: ClientBranch = {
      ...data,
      id: `br-${Date.now()}`,
      businessId: currentBusiness.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllBranches((prev) => [newBranch, ...prev]);
    return { success: true };
  };

  const updateBranch = (id: string, updates: Partial<ClientBranch>) => {
    setAllBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
  };

  const toggleBranchStatus = (id: string) => {
    setAllBranches((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() } : b
      )
    );
  };

  // Department operations
  const createDepartment = (data: Omit<ClientDepartment, 'id' | 'businessId' | 'staffCount' | 'createdAt' | 'updatedAt'>) => {
    if (departments.length >= subscription.maxDepartments) {
      return { success: false, error: `Department limit of ${subscription.maxDepartments} reached for plan ${subscription.planName}.` };
    }
    const newDept: ClientDepartment = {
      ...data,
      id: `dept-${Date.now()}`,
      businessId: currentBusiness.id,
      staffCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllDepartments((prev) => [...prev, newDept]);
    return { success: true };
  };

  const updateDepartment = (id: string, updates: Partial<ClientDepartment>) => {
    setAllDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  };

  const toggleDepartmentStatus = (id: string) => {
    const target = departments.find((d) => d.id === id);
    if (!target) return { success: false, error: 'Department not found' };
    if (target.status === 'active' && target.staffCount > 0) {
      return {
        success: false,
        error: `Cannot deactivate department with ${target.staffCount} assigned staff members. Please reassign them first.`,
      };
    }
    setAllDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d))
    );
    return { success: true };
  };

  const deleteDepartment = (id: string) => {
    const target = departments.find((d) => d.id === id);
    if (!target) return { success: false, error: 'Department not found' };
    if (target.staffCount > 0) {
      return {
        success: false,
        error: `Cannot delete department with ${target.staffCount} assigned staff members. Please reassign them first.`,
      };
    }
    setAllDepartments((prev) => prev.filter((d) => d.id !== id));
    return { success: true };
  };

  const getDepartmentConfig = (departmentId: string): ClientDepartmentConfig | undefined => {
    return allDepartmentConfigs[departmentId] || {
      departmentId,
      businessId: currentBusiness.id,
      duties: [],
      enabledModules: subscription.enabledModules,
      availableActions: ['view', 'create'],
      recordTypes: ['GeneralRecord'],
      permissionRules: { canCrossBranchView: false, requireShiftActive: false },
      updatedAt: new Date().toISOString(),
    };
  };

  const saveDepartmentConfig = (config: ClientDepartmentConfig) => {
    setAllDepartmentConfigs((prev) => ({
      ...prev,
      [config.departmentId]: config,
    }));
  };

  // Staff operations with limit enforcement
  const createStaff = (data: Omit<ClientStaffMember, 'id' | 'businessId' | 'createdAt'>) => {
    if (staff.length >= subscription.maxStaff) {
      return { success: false, error: `Staff account limit of ${subscription.maxStaff} reached for plan ${subscription.planName}.` };
    }
    const newStaff: ClientStaffMember = {
      ...data,
      id: `staff-${Date.now()}`,
      businessId: currentBusiness.id,
      createdAt: new Date().toISOString(),
    };
    setAllStaff((prev) => [...prev, newStaff]);
    // Increment department staff count
    setAllDepartments((prev) =>
      prev.map((d) => (d.id === data.departmentId ? { ...d, staffCount: d.staffCount + 1 } : d))
    );
    return { success: true };
  };

  const updateStaff = (id: string, updates: Partial<ClientStaffMember>) => {
    setAllStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleStaffStatus = (id: string) => {
    setAllStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
    );
  };

  // Roles operations
  const createRole = (data: Omit<ClientRole, 'id' | 'businessId' | 'staffCount' | 'createdAt'>) => {
    const newRole: ClientRole = {
      ...data,
      id: `role-${Date.now()}`,
      businessId: currentBusiness.id,
      staffCount: 0,
      createdAt: new Date().toISOString(),
    };
    setAllRoles((prev) => [...prev, newRole]);
    return { success: true };
  };

  const updateRole = (id: string, updates: Partial<ClientRole>) => {
    setAllRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  // Shift operations
  const createShift = (data: Omit<ClientShift, 'id' | 'businessId' | 'createdAt'>) => {
    const newShift: ClientShift = {
      ...data,
      id: `sh-${Date.now()}`,
      businessId: currentBusiness.id,
      createdAt: new Date().toISOString(),
    };
    setAllShifts((prev) => [...prev, newShift]);
    return { success: true };
  };

  const updateShift = (id: string, updates: Partial<ClientShift>) => {
    setAllShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteShift = (id: string) => {
    setAllShifts((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const value: TenantContextValue = {
    currentBusiness,
    subscription,
    actor,
    availableBusinesses: businesses,
    branches,
    departments,
    staff,
    roles,
    shifts,
    performance: MOCK_PERFORMANCE_GOLDEN_CRUST,
    activity,
    settings,
    switchTenant,
    updateBusinessProfile,
    createBranch,
    updateBranch,
    toggleBranchStatus,
    createDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    deleteDepartment,
    getDepartmentConfig,
    saveDepartmentConfig,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    createRole,
    updateRole,
    createShift,
    updateShift,
    deleteShift,
    updateSettings,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
