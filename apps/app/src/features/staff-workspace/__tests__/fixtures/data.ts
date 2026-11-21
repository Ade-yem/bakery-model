import type { StaffSession, Department, AuthState } from '../../../integration/auth';
import type { WorkspaceSnapshot } from '../../../integration/workspace';
import { productionRecords, productionTasks } from './production';
import { receptionOrders, receptionProducts } from './reception';
import { sampleReceipts, suppliers, materials } from './procurement';
import { products, transfers, orders } from './disbursement';
export function accessFor(department: Department) {
  const module = department === 'reception' ? 'orders' : department;
  return {
    enabledModules: [module],
    permissions: [
      `${module}:view`,
      'records:view',
      'history:view',
      'schedule:view',
      'production:create',
      'orders:create',
      'payments:create',
      'orders:push',
      'repayments:create',
      'transfer:accept',
      'orders:fulfill',
      'stock:count',
      'handover:submit',
      'handover:sign',
      'procurement:create',
    ],
  };
}
export function sessionFor(
  department: Department,
  patch: Partial<StaffSession> = {}
): StaffSession {
  return {
    userId: `test-${department}`,
    email: `${department}@example.test`,
    displayName: 'Assigned staff member',
    role: department,
    tenantId: 'test-tenant',
    tenantName: 'Assigned business',
    branchId: 'test-branch',
    branchName: 'Assigned branch',
    department,
    expiresAt: Date.now() + 3600000,
    accountStatus: 'ACTIVE',
    subscriptionStatus: 'ACTIVE',
    planModules: [department === 'reception' ? 'orders' : department],
    ...accessFor(department),
    ...patch,
  };
}
export function dataFor(department: Department): WorkspaceSnapshot {
  const session = sessionFor(department);
  const common = {
    scope: {
      tenantId: session.tenantId,
      branchId: session.branchId,
      userId: session.userId,
      department,
    },
    version: 'test-version-1',
    shift: {
      id: 'test-shift',
      label: 'Assigned shift',
      startsAt: '2026-11-21T06:00:00Z',
      endsAt: '2026-11-21T14:00:00Z',
      timeZone: 'Africa/Lagos',
      status: 'OPEN',
    },
    schedule: [],
    handover: null,
    pendingWork: [],
  };
  if (department === 'production')
    return {
      ...common,
      department,
      products: ['Family loaf · 500g', 'Sandwich bread · 1kg'],
      tasks: productionTasks.map((task) => ({
        ...task,
        kind: task.kind === 'batch' ? 'batch' : 'review',
        batchId: 'BAT-0184',
      })),
      records: productionRecords,
    };
  if (department === 'reception')
    return {
      ...common,
      department,
      orders: receptionOrders,
      products: receptionProducts,
      repayments: [],
      openingCash: 1000000,
      approvedExpenses: 150000,
    };
  if (department === 'disbursement')
    return {
      ...common,
      department,
      products,
      transfers,
      orders,
      opening: { loaf: 80, sandwich: 40, pie: 24 },
      state: { events: [] },
    };
  return { ...common, department, receipts: sampleReceipts, suppliers, materials };
}
export function authState(session: StaffSession | null): AuthState {
  return {
    status: 'ready',
    session,
    client: null,
    refresh: async () => {},
    signIn: async () => {
      if (!session) throw new Error('No test session');
      return session;
    },
    signOut: async () => {},
  };
}
