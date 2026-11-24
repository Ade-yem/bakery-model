/** @file Pure deterministic domain logic for E-Procurement workflows. */
import type {
  CreatePoInput,
  CreateSupplierInput,
  DirectReceiptInput,
  ProcurementKpis,
  ProcurementLine,
  ProcurementReceipt,
  ProcurementSnapshot,
  PurchaseOrder,
  RawMaterial,
  ReceivePoInput,
  StockMovement,
  StockStatus,
  Supplier,
} from './types';

/**
 * @description Converts a decimal Naira input string into safe integer kobo without floating-point arithmetic.
 * @param text Unsigned decimal currency string with at most two decimal places.
 * @returns Nonnegative integer kobo value, or null when malformed or out of safe integer range.
 * @example
 * parseMoney('1250.50'); // 125050
 */
export function parseMoney(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ''] = trimmed.split('.');
  const value = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}

/**
 * @description Formats an integer kobo amount as an NGN currency string.
 * @param kobo Nonnegative integer amount in kobo.
 * @returns Formatted Naira string (e.g., "₦152,500.00").
 */
export function formatMoney(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * @description Sums line quantities and integer kobo unit costs safely.
 * @param lines Array of line items containing integer quantity and unitCostKobo.
 * @returns Safe integer total in kobo.
 * @throws {Error} When any quantity is <= 0, non-integer, unitCostKobo < 0, or total overflows safe integers.
 */
export function calculateLinesTotal(
  lines: ReadonlyArray<{ quantity: number; unitCostKobo: number }>
): number {
  let total = 0;
  for (const line of lines) {
    if (
      !Number.isSafeInteger(line.quantity) ||
      line.quantity <= 0 ||
      !Number.isSafeInteger(line.unitCostKobo) ||
      line.unitCostKobo < 0
    ) {
      throw new Error('Line items require positive whole quantities and nonnegative unit costs.');
    }
    total += line.quantity * line.unitCostKobo;
    if (!Number.isSafeInteger(total)) {
      throw new Error('Order total exceeds the supported safe integer range.');
    }
  }
  return total;
}

/**
 * @description Classifies a raw material's stock health against its minimum threshold.
 * @param currentStock Current available stock count.
 * @param minThreshold Configured minimum reorder threshold.
 * @returns 'CRITICAL' at zero, 'LOW' at or below threshold, otherwise 'OK'.
 */
export function getStockStatus(currentStock: number, minThreshold: number): StockStatus {
  if (currentStock <= 0) return 'CRITICAL';
  if (currentStock <= minThreshold) return 'LOW';
  return 'OK';
}

function nextSequentialId(prefix: string, existingIds: readonly string[], startAt: number): string {
  let maxNum = startAt - 1;
  for (const id of existingIds) {
    const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (parsed > maxNum) maxNum = parsed;
    }
  }
  return `${prefix}-${String(maxNum + 1).padStart(prefix === 'SUP' ? 3 : 4, '0')}`;
}

function buildValidatedLines(
  materials: readonly RawMaterial[],
  rawLines: ReadonlyArray<{ materialId: string; quantity: number; unitCostKobo: number }>
): ProcurementLine[] {
  if (rawLines.length === 0) {
    throw new Error('Add at least one line item.');
  }
  const byId = new Map(materials.map((m) => [m.id, m]));
  return rawLines.map((line) => {
    const material = byId.get(line.materialId);
    if (!material) {
      throw new Error(`Unknown raw material: ${line.materialId}`);
    }
    calculateLinesTotal([{ quantity: line.quantity, unitCostKobo: line.unitCostKobo }]);
    return {
      materialId: material.id,
      materialName: material.name,
      unit: material.unit,
      quantity: line.quantity,
      unitCostKobo: line.unitCostKobo,
    };
  });
}

function applyReceiptToSnapshot(
  snapshot: ProcurementSnapshot,
  params: {
    poId: string | null;
    supplierId: string;
    reference: string;
    receivedBy: string;
    notes: string;
    lines: ProcurementLine[];
    nowIso: string;
  }
): ProcurementSnapshot {
  const reference = params.reference.trim();
  if (!reference) {
    throw new Error('Supplier invoice or delivery reference is required.');
  }
  const receivedBy = params.receivedBy.trim() || 'Storekeeper';
  const totalAmountKobo = calculateLinesTotal(params.lines);
  const receiptId = nextSequentialId(
    'REC',
    snapshot.receipts.map((r) => r.id),
    201
  );

  const receipt: ProcurementReceipt = {
    id: receiptId,
    receiptNumber: receiptId,
    poId: params.poId,
    supplierId: params.supplierId,
    reference,
    receivedAt: params.nowIso,
    receivedBy,
    lines: params.lines,
    totalAmountKobo,
    notes: params.notes.trim(),
  };

  const qtyByMaterial = new Map<string, { qty: number; unitCostKobo: number }>();
  for (const line of params.lines) {
    const existing = qtyByMaterial.get(line.materialId);
    qtyByMaterial.set(line.materialId, {
      qty: (existing?.qty ?? 0) + line.quantity,
      unitCostKobo: line.unitCostKobo,
    });
  }

  const nextMaterials = snapshot.materials.map((material) => {
    const delta = qtyByMaterial.get(material.id);
    if (!delta) return material;
    return {
      ...material,
      currentStock: material.currentStock + delta.qty,
      lastUnitCostKobo: delta.unitCostKobo,
    };
  });

  const existingMovementIds = snapshot.movements.map((m) => m.id);
  const newMovements: StockMovement[] = [];
  for (const line of params.lines) {
    const movementId = nextSequentialId(
      'MOV',
      [...existingMovementIds, ...newMovements.map((m) => m.id)],
      301
    );
    newMovements.push({
      id: movementId,
      materialId: line.materialId,
      type: 'INBOUND_PROCUREMENT',
      quantityDelta: line.quantity,
      receiptId,
      createdAt: params.nowIso,
      actor: receivedBy,
    });
  }

  const nextPurchaseOrders = params.poId
    ? snapshot.purchaseOrders.map((po) =>
        po.id === params.poId ? { ...po, status: 'RECEIVED' as const } : po
      )
    : snapshot.purchaseOrders;

  return {
    ...snapshot,
    materials: nextMaterials,
    purchaseOrders: nextPurchaseOrders,
    receipts: [receipt, ...snapshot.receipts],
    movements: [...newMovements, ...snapshot.movements],
  };
}

/**
 * @description Validates input and prepends a new OPEN Purchase Order to the snapshot.
 * @param snapshot Current procurement state.
 * @param input Supplier, expected delivery date, notes, and line items.
 * @param nowIso Optional ISO timestamp override for deterministic testing.
 * @returns Updated snapshot containing the new Purchase Order.
 * @throws {Error} When supplier is unknown, expectedDate is empty, or lines are invalid.
 */
export function createPurchaseOrder(
  snapshot: ProcurementSnapshot,
  input: CreatePoInput,
  nowIso: string = new Date().toISOString()
): ProcurementSnapshot {
  const supplierExists = snapshot.suppliers.some((s) => s.id === input.supplierId);
  if (!supplierExists) {
    throw new Error('Select a valid supplier before creating a purchase order.');
  }
  if (!input.expectedDate.trim()) {
    throw new Error('Expected delivery date is required.');
  }
  const lines = buildValidatedLines(snapshot.materials, input.lines);
  const totalAmountKobo = calculateLinesTotal(lines);
  const poNumber = nextSequentialId(
    'PO',
    snapshot.purchaseOrders.map((po) => po.id),
    101
  );

  const newPo: PurchaseOrder = {
    id: poNumber,
    poNumber,
    supplierId: input.supplierId,
    status: 'OPEN',
    createdAt: nowIso,
    expectedDate: input.expectedDate,
    lines,
    totalAmountKobo,
    notes: (input.notes ?? '').trim(),
  };

  return {
    ...snapshot,
    purchaseOrders: [newPo, ...snapshot.purchaseOrders],
  };
}

/**
 * @description Transitions an OPEN Purchase Order to CANCELLED without altering stock or receipts.
 * @param snapshot Current procurement state.
 * @param poId Identifier of the Purchase Order to cancel.
 * @returns Updated snapshot with the PO marked CANCELLED.
 * @throws {Error} When the PO does not exist or is not in OPEN status.
 */
export function cancelPurchaseOrder(
  snapshot: ProcurementSnapshot,
  poId: string
): ProcurementSnapshot {
  const target = snapshot.purchaseOrders.find((po) => po.id === poId);
  if (!target) {
    throw new Error(`Purchase order ${poId} was not found.`);
  }
  if (target.status !== 'OPEN') {
    throw new Error(`Only OPEN purchase orders can be cancelled (current: ${target.status}).`);
  }

  return {
    ...snapshot,
    purchaseOrders: snapshot.purchaseOrders.map((po) =>
      po.id === poId ? { ...po, status: 'CANCELLED' } : po
    ),
  };
}

/**
 * @description Atomically receives an OPEN Purchase Order, incrementing stock and appending receipt & movements.
 * @param snapshot Current procurement state.
 * @param input PO identifier, delivery reference, receiving actor, and optional quantity overrides.
 * @param nowIso Optional ISO timestamp override for deterministic testing.
 * @returns Updated snapshot with PO marked RECEIVED, incremented stock, and appended ledger records.
 * @throws {Error} When PO is missing/not OPEN, reference is blank, or quantities are invalid.
 */
export function receivePurchaseOrder(
  snapshot: ProcurementSnapshot,
  input: ReceivePoInput,
  nowIso: string = new Date().toISOString()
): ProcurementSnapshot {
  const po = snapshot.purchaseOrders.find((item) => item.id === input.poId);
  if (!po) {
    throw new Error(`Purchase order ${input.poId} was not found.`);
  }
  if (po.status !== 'OPEN') {
    throw new Error(`Purchase order ${po.poNumber} is already ${po.status}.`);
  }

  const overrideMap = new Map(input.lines?.map((l) => [l.materialId, l.quantity]) ?? []);
  const linesToReceive = po.lines.map((line) => ({
    materialId: line.materialId,
    quantity: overrideMap.get(line.materialId) ?? line.quantity,
    unitCostKobo: line.unitCostKobo,
  }));

  const validatedLines = buildValidatedLines(snapshot.materials, linesToReceive);
  return applyReceiptToSnapshot(snapshot, {
    poId: po.id,
    supplierId: po.supplierId,
    reference: input.reference,
    receivedBy: input.receivedBy,
    notes: input.notes ?? po.notes,
    lines: validatedLines,
    nowIso,
  });
}

/**
 * @description Records a direct supplier delivery without a prior PO, updating stock and ledger atomically.
 * @param snapshot Current procurement state.
 * @param input Supplier, delivery reference, receiving actor, and delivered lines.
 * @param nowIso Optional ISO timestamp override for deterministic testing.
 * @returns Updated snapshot with appended receipt, incremented stock, and inbound movements.
 * @throws {Error} When supplier is invalid, reference is blank, or lines are invalid.
 */
export function recordDirectReceipt(
  snapshot: ProcurementSnapshot,
  input: DirectReceiptInput,
  nowIso: string = new Date().toISOString()
): ProcurementSnapshot {
  const supplierExists = snapshot.suppliers.some((s) => s.id === input.supplierId);
  if (!supplierExists) {
    throw new Error('Select a valid supplier before recording a receipt.');
  }
  const validatedLines = buildValidatedLines(snapshot.materials, input.lines);
  return applyReceiptToSnapshot(snapshot, {
    poId: null,
    supplierId: input.supplierId,
    reference: input.reference,
    receivedBy: input.receivedBy,
    notes: input.notes ?? '',
    lines: validatedLines,
    nowIso,
  });
}

/**
 * @description Validates and appends a new supplier to the procurement directory.
 * @param snapshot Current procurement state.
 * @param input New supplier details.
 * @returns Updated snapshot with the new supplier appended.
 * @throws {Error} When required fields are blank or leadTimeDays is invalid.
 */
export function addSupplier(
  snapshot: ProcurementSnapshot,
  input: CreateSupplierInput
): ProcurementSnapshot {
  const name = input.name.trim();
  const category = input.category.trim();
  const contactName = input.contactName.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();

  if (!name) throw new Error('Supplier name is required.');
  if (!category) throw new Error('Supplier category is required.');
  if (!contactName) throw new Error('Contact person name is required.');
  if (!Number.isSafeInteger(input.leadTimeDays) || input.leadTimeDays < 0) {
    throw new Error('Lead time must be a nonnegative whole number of days.');
  }

  const id = nextSequentialId(
    'SUP',
    snapshot.suppliers.map((s) => s.id),
    1
  );
  const supplier: Supplier = {
    id,
    name,
    category,
    contactName,
    phone,
    email,
    leadTimeDays: input.leadTimeDays,
  };

  return {
    ...snapshot,
    suppliers: [...snapshot.suppliers, supplier],
  };
}

/**
 * @description Derives Overview KPIs directly from the current procurement snapshot.
 * @param snapshot Current procurement state.
 * @param todayPrefix ISO date prefix (YYYY-MM-DD) used to filter today's spend.
 * @returns Derived open PO count, today's spend in kobo, low-stock count, and posted receipts count.
 */
export function deriveProcurementKpis(
  snapshot: ProcurementSnapshot,
  todayPrefix: string = new Date().toISOString().slice(0, 10)
): ProcurementKpis {
  const openPoCount = snapshot.purchaseOrders.filter((po) => po.status === 'OPEN').length;
  const todaySpendKobo = snapshot.receipts
    .filter((r) => r.receivedAt.startsWith(todayPrefix))
    .reduce((sum, r) => sum + r.totalAmountKobo, 0);
  const lowStockCount = snapshot.materials.filter(
    (m) => getStockStatus(m.currentStock, m.minThreshold) !== 'OK'
  ).length;
  const postedReceiptsCount = snapshot.receipts.length;

  return {
    openPoCount,
    todaySpendKobo,
    lowStockCount,
    postedReceiptsCount,
  };
}
