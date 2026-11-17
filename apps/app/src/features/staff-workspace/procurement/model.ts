import { readRecord } from '../journal/store';
/** Isolated sample procurement contracts; no operational stock posting. */
export const suppliers = [
  { id: 'mill', name: 'Golden Grain Mills', contact: 'Toyin Adeyemi', phone: '+234 800 000 0101' },
  {
    id: 'ingredients',
    name: 'Prime Ingredients',
    contact: 'Emeka Obi',
    phone: '+234 800 000 0102',
  },
];
export const materials = [
  { id: 'flour', name: 'Wheat flour', unit: 'BAG (50kg)' },
  { id: 'sugar', name: 'Granulated sugar', unit: 'KILOGRAM' },
  { id: 'yeast', name: 'Instant yeast', unit: 'KILOGRAM' },
];
export interface ReceiptLine {
  materialId: string;
  quantity: string;
  unitCost: string;
}
export interface ReceiptInput {
  additionalLines?: ReceiptLine[];
  id: string;
  supplierId: string;
  materialId: string;
  quantity: string;
  unitCost: string;
  reference: string;
  receivedOn: string;
  note: string;
}
export interface Receipt extends ReceiptInput {
  total: number;
  recordedAt: string;
}
function scaled(value: string, precision: number): bigint {
  if (typeof value !== 'string' || !new RegExp(`^\\d{1,7}(\\.\\d{1,${precision}})?$`).test(value))
    throw new Error(`Enter a positive number with up to ${precision} decimal places.`);
  const [whole, fraction = ''] = value.split('.');
  const result = BigInt(whole + fraction.padEnd(precision, '0'));
  if (result <= 0n || result > 1000000000n)
    throw new Error('Amount or quantity is outside the supported range.');
  return result;
}
/** Quantity to thousandths × cost to kobo, rounded half up to the nearest kobo. */
export function receiptTotal(quantity: string, unitCost: string): number {
  const result = (scaled(quantity, 3) * scaled(unitCost, 2) + 500n) / 1000n;
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Receipt total is too large.');
  return Number(result);
}
export function createReceipt(
  input: ReceiptInput,
  existing: Receipt[],
  recordedAt = new Date().toISOString()
): Receipt {
  if (!input) throw new Error('Receipt fields must be text.');
  if (input.additionalLines !== undefined) {
    if (!Array.isArray(input.additionalLines) || input.additionalLines.length > 49)
      throw new Error('A receipt supports up to 50 material lines.');
    const { additionalLines, ...header } = input;
    const first = createReceipt(header, existing, recordedAt);
    let total = first.total;
    const validated = additionalLines.map((line) => {
      if (
        !line ||
        typeof line.materialId !== 'string' ||
        typeof line.quantity !== 'string' ||
        typeof line.unitCost !== 'string'
      )
        throw new Error('Invalid material line.');
      const entry = createReceipt(
        {
          ...header,
          materialId: line.materialId,
          quantity: line.quantity,
          unitCost: line.unitCost,
        },
        [],
        recordedAt
      );
      total += entry.total;
      if (!Number.isSafeInteger(total)) throw new Error('Receipt total is too large.');
      return { materialId: entry.materialId, quantity: entry.quantity, unitCost: entry.unitCost };
    });
    return { ...first, additionalLines: validated, total };
  }

  const required = [
    'id',
    'supplierId',
    'materialId',
    'quantity',
    'unitCost',
    'reference',
    'receivedOn',
    'note',
  ] as const;
  if (required.some((key) => typeof input[key] !== 'string'))
    throw new Error('Missing receipt fields.');
  if (!/^REC-[\w-]{1,80}$/.test(input.id)) throw new Error('Invalid receipt reference.');
  if (
    !suppliers.some((s) => s.id === input.supplierId) ||
    !materials.some((m) => m.id === input.materialId)
  )
    throw new Error('Choose a listed supplier and material.');
  const reference = input.reference.trim();
  if (!reference || reference.length > 80)
    throw new Error('Enter an invoice or delivery reference of up to 80 characters.');
  if (input.note.length > 500) throw new Error('Keep notes within 500 characters.');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.receivedOn) ||
    !Number.isFinite(Date.parse(input.receivedOn)) ||
    new Date(input.receivedOn).toISOString().slice(0, 10) !== input.receivedOn
  )
    throw new Error('Enter a valid receipt date.');
  if (
    existing.some(
      (r) =>
        r.id === input.id ||
        (r.supplierId === input.supplierId && r.reference.toLowerCase() === reference.toLowerCase())
    )
  )
    throw new Error('This receipt or supplier invoice reference has already been recorded.');
  return { ...input, reference, total: receiptTotal(input.quantity, input.unitCost), recordedAt };
}
export const sampleReceipts: Receipt[] = [
  createReceipt(
    {
      id: 'REC-0101',
      supplierId: 'mill',
      materialId: 'flour',
      quantity: '10',
      unitCost: '18500',
      reference: 'GG-INV-904',
      receivedOn: '2026-11-04',
      note: 'Bags checked at the receiving bay.',
    },
    [],
    '2026-11-04T07:20:00.000Z'
  ),
];
export function parseReceipts(raw: string): Receipt[] | null {
  try {
    const values = JSON.parse(raw);
    if (!Array.isArray(values) || values.length > 10000) return null;
    const receipts: Receipt[] = [];
    for (const value of values) {
      if (
        !value ||
        typeof value.recordedAt !== 'string' ||
        !Number.isFinite(Date.parse(value.recordedAt))
      )
        return null;
      const receipt = createReceipt(value, receipts, value.recordedAt);
      if (receipt.total !== value.total) return null;
      receipts.push(receipt);
    }
    return receipts;
  } catch {
    return null;
  }
}
export const storageKey = 'tallybakery:procurement-records:v1';
export const draftKey = 'tallybakery:procurement-draft:v1';
export function loadReceipts(): { receipts: Receipt[]; error: string } {
  if (typeof window === 'undefined') return { receipts: sampleReceipts, error: '' };
  try {
    const raw = readRecord(storageKey);
    const receipts = raw === null ? sampleReceipts : parseReceipts(raw);
    return receipts
      ? { receipts, error: '' }
      : {
          receipts: [],
          error:
            'Saved receipts are invalid. They have not been overwritten. Restore valid browser data and retry.',
        };
  } catch {
    return {
      receipts: [],
      error:
        'Browser storage is unavailable or contains invalid evidence. Saved receipts have not been overwritten. Allow storage or restore valid data and retry.',
    };
  }
}
export function parseDraft(raw: string | null): ReceiptInput | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || !/^REC-[\w-]{1,80}$/.test(value.id)) return null;
    const fields = [
      'supplierId',
      'materialId',
      'quantity',
      'unitCost',
      'reference',
      'receivedOn',
      'note',
    ] as const;
    if (fields.some((key) => typeof value[key] !== 'string' || value[key].length > 500))
      return null;
    if (
      !suppliers.some((s) => s.id === value.supplierId) ||
      !materials.some((m) => m.id === value.materialId)
    )
      return null;
    if (
      value.additionalLines !== undefined &&
      (!Array.isArray(value.additionalLines) ||
        value.additionalLines.length > 49 ||
        value.additionalLines.some(
          (line: ReceiptLine) =>
            !line ||
            !materials.some((m) => m.id === line.materialId) ||
            typeof line.quantity !== 'string' ||
            typeof line.unitCost !== 'string' ||
            line.quantity.length > 100 ||
            line.unitCost.length > 100
        ))
    )
      return null;
    return {
      id: value.id,
      ...Object.fromEntries(fields.map((key) => [key, value[key]])),
      ...(value.additionalLines ? { additionalLines: value.additionalLines } : {}),
    } as ReceiptInput;
  } catch {
    return null;
  }
}
export const formatMoney = (minor: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(minor / 100);
