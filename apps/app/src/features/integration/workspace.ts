import { createContext, useContext } from 'react';
import type { StaffSession, Department } from './auth';
import { useAuth } from './auth';
import type { BatchRecord } from '../staff-workspace/production-store';
import type { BatchDraftValues } from '../staff-workspace/draft';
import type { ReceptionOrder, Tender } from '../staff-workspace/reception/orders';
import type { Repayment } from '../staff-workspace/reception/repayments';
import type {
  Receipt,
  ReceiptInput,
  Supplier,
  Material,
} from '../staff-workspace/procurement/model';
import type {
  State,
  Action,
  TransferProjection,
  OrderProjection,
} from '../staff-workspace/disbursement/model';
import type { Handover } from '../staff-workspace/handover/model';

export interface ShiftAssignment {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  status: string;
}
export interface ProductionTask {
  id: string;
  title: string;
  detail: string;
  note: string;
  action: string;
  kind: 'batch' | 'review';
  batchId?: string;
}
export interface PendingWork {
  id: string;
  sequence: number;
  recordKey: string;
  at: string;
  state: 'PENDING' | 'CONFLICT' | 'ACKNOWLEDGED';
  message?: string;
}
interface CommonData {
  pendingWork: PendingWork[] | null;
  scope: Pick<StaffSession, 'tenantId' | 'branchId' | 'userId' | 'department'>;
  version: string;
  shift: ShiftAssignment | null;
  schedule: ShiftAssignment[];
  handover: Handover | null;
}
export interface ProductionData extends CommonData {
  department: 'production';
  records: BatchRecord[];
  products: string[];
  tasks: ProductionTask[];
}
export interface ReceptionData extends CommonData {
  department: 'reception';
  orders: ReceptionOrder[];
  products: { sku: string; name: string; unitPrice: number }[];
  repayments: Repayment[];
  openingCash: number | null;
  approvedExpenses: number | null;
}
export interface DisbursementData extends CommonData {
  department: 'disbursement';
  products: Record<string, string>;
  opening: Record<string, number>;
  transfers: TransferProjection[];
  orders: OrderProjection[];
  state: State;
}
export interface ProcurementData extends CommonData {
  department: 'procurement';
  receipts: Receipt[];
  suppliers: Supplier[];
  materials: Material[];
}
export type WorkspaceSnapshot = ProductionData | ReceptionData | DisbursementData | ProcurementData;
/** Domain intents, not replacement ledger snapshots. The adapter must enforce authorization and idempotency. */
export type WorkspaceCommand =
  | { type: 'production:create'; id: string; values: BatchDraftValues }
  | { type: 'orders:create'; order: ReceptionOrder }
  | { type: 'payments:create'; orderId: string; payments: Tender[] }
  | { type: 'orders:push'; orderId: string }
  | { type: 'repayments:create'; entry: Repayment }
  | { type: 'transfer:accept' | 'orders:fulfill' | 'stock:count'; action: Action }
  | { type: 'procurement:create'; receipt: ReceiptInput }
  | { type: 'handover:submit' | 'handover:sign'; counts: Record<string, string>; note: string };
export interface WorkspaceAdapter {
  load(session: StaffSession): Promise<WorkspaceSnapshot>;
  /** Resolve only after an authoritative acknowledgement or durable, explicitly pending repository write. */
  mutate(
    session: StaffSession,
    request: { eventId: string; expectedVersion: string; command: WorkspaceCommand }
  ): Promise<WorkspaceSnapshot>;
}
export function validateWorkspaceScope(
  data: WorkspaceSnapshot,
  session: StaffSession
): WorkspaceSnapshot {
  if (
    !data ||
    data.department !== session.department ||
    !data.scope ||
    (['tenantId', 'branchId', 'userId', 'department'] as const).some(
      (key) => data.scope[key] !== session[key]
    ) ||
    typeof data.version !== 'string' ||
    !data.version
  )
    throw new Error('Workspace access could not be verified.');
  if (
    !Array.isArray(data.schedule) ||
    (data.pendingWork !== null && !Array.isArray(data.pendingWork))
  )
    throw new Error('Workspace status is unavailable.');
  const requiredArrays: Record<Department, string[]> = {
    production: ['records', 'products', 'tasks'],
    reception: ['orders', 'products', 'repayments'],
    disbursement: ['transfers', 'orders'],
    procurement: ['receipts', 'suppliers', 'materials'],
  };
  if (
    requiredArrays[data.department].some(
      (key) => !Array.isArray((data as unknown as Record<string, unknown>)[key])
    )
  )
    throw new Error('Workspace records are unavailable.');
  if (data.department === 'disbursement') {
    if (
      !data.products ||
      !data.opening ||
      !data.state ||
      !Array.isArray(data.state.events) ||
      Object.keys(data.products).some(
        (id) => !Number.isSafeInteger(data.opening[id]) || data.opening[id] < 0
      )
    )
      throw new Error('Verified opening stock is required.');
  }
  if (
    data.department === 'reception' &&
    [data.openingCash, data.approvedExpenses].some(
      (amount) => amount !== null && (!Number.isSafeInteger(amount) || amount < 0)
    )
  )
    throw new Error('Cash reconciliation values are invalid.');
  return data;
}
export interface WorkspaceContextValue {
  data: WorkspaceSnapshot;
  busy: boolean;
  submit: (command: WorkspaceCommand) => Promise<void>;
  reload: () => Promise<void>;
}
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('Workspace data is unavailable.');
  return context;
}
export function useDepartmentData<T extends Department>(
  department: T
): Extract<WorkspaceSnapshot, { department: T }> {
  const { data } = useWorkspace();
  if (data.department !== department)
    throw new Error('This workspace belongs to another department.');
  return data as Extract<WorkspaceSnapshot, { department: T }>;
}
export function useDraftKey(kind: string) {
  const { session } = useAuth();
  const { data } = useWorkspace();
  if (!session) throw new Error('Sign in before saving a draft.');
  return [
    'cadence',
    'draft',
    session.tenantId,
    session.branchId,
    session.userId,
    data.shift?.id ?? 'unassigned',
    kind,
  ]
    .map(encodeURIComponent)
    .join(':');
}
