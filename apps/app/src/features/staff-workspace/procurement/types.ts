/** @file Domain types and data contracts for the E-Procurement preview workspace. */

export type PurchaseOrderStatus = 'OPEN' | 'RECEIVED' | 'CANCELLED';

export type StockStatus = 'OK' | 'LOW' | 'CRITICAL';

export type StockMovementType = 'INBOUND_PROCUREMENT';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number;
}

export interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  lastUnitCostKobo: number;
  preferredSupplierId: string;
}

export interface ProcurementLine {
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitCostKobo: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedDate: string;
  lines: ProcurementLine[];
  totalAmountKobo: number;
  notes: string;
}

export interface ProcurementReceipt {
  id: string;
  receiptNumber: string;
  poId: string | null;
  supplierId: string;
  reference: string;
  receivedAt: string;
  receivedBy: string;
  lines: ProcurementLine[];
  totalAmountKobo: number;
  notes: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  type: StockMovementType;
  quantityDelta: number;
  receiptId: string;
  createdAt: string;
  actor: string;
}

export interface ProcurementSnapshot {
  suppliers: Supplier[];
  materials: RawMaterial[];
  purchaseOrders: PurchaseOrder[];
  receipts: ProcurementReceipt[];
  movements: StockMovement[];
}

export interface ProcurementKpis {
  openPoCount: number;
  todaySpendKobo: number;
  lowStockCount: number;
  postedReceiptsCount: number;
}

export interface CreatePoInput {
  supplierId: string;
  expectedDate: string;
  notes?: string;
  lines: Array<{
    materialId: string;
    quantity: number;
    unitCostKobo: number;
  }>;
}

export interface ReceivePoInput {
  poId: string;
  reference: string;
  receivedBy: string;
  notes?: string;
  lines?: Array<{
    materialId: string;
    quantity: number;
  }>;
}

export interface DirectReceiptInput {
  supplierId: string;
  reference: string;
  receivedBy: string;
  notes?: string;
  lines: Array<{
    materialId: string;
    quantity: number;
    unitCostKobo: number;
  }>;
}

export interface CreateSupplierInput {
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number;
}

