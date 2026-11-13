/** @file Deterministic preview calculations, never authoritative financial posting. */
export type OrderStatus =
  'PENDING_SETTLEMENT' | 'PAID_PENDING_DISPATCH' | 'CREDIT_APPROVED_PENDING_DISPATCH' | 'PUSHED';
export interface OrderLine {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}
export interface Tender {
  method: 'CASH' | 'TRANSFER' | 'DEBT';
  amount: number;
  reference: string;
}
export interface ReceptionOrder {
  id: string;
  customer: string;
  contact: string;
  createdAt: string;
  lines: OrderLine[];
  payments: Tender[];
  status: OrderStatus;
  creditAuthorized: boolean;
}
/**
 * @description Converts a decimal naira input into integer kobo without fractional currency arithmetic.
 * @param text Unsigned currency text, maximum two decimal places.
 * @returns A safe nonnegative kobo integer, or null when malformed/out of range.
 */
export function parseMoney(text: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(text.trim())) return null;
  const [whole, fraction = ''] = text.trim().split('.');
  const value = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}
/**
 * @description Sums line quantities and integer unit prices; invalid lines never create a plausible total.
 * @param lines Product lines with prices in kobo.
 * @returns Safe integer total in kobo.
 * @throws {Error} For invalid quantities, prices or an unsafe sum.
 */
export function orderTotal(lines: readonly OrderLine[]): number {
  let total = 0;
  for (const line of lines) {
    if (
      !Number.isSafeInteger(line.quantity) ||
      line.quantity <= 0 ||
      !Number.isSafeInteger(line.unitPrice) ||
      line.unitPrice < 0
    )
      throw new Error('Invalid product quantity or price.');
    total += line.quantity * line.unitPrice;
    if (!Number.isSafeInteger(total)) throw new Error('Order total exceeds the supported range.');
  }
  return total;
}
/**
 * @description Validates preview order input and tender evidence without inventing a credit approval policy.
 * @param order Unposted Reception preview order.
 * @returns Validation messages; empty means the input is well formed, not necessarily dispatchable.
 */
export function validateOrder(order: ReceptionOrder): string[] {
  const errors: string[] = [];
  if (!order.lines.length) errors.push('Add at least one product.');
  let total = 0;
  try {
    total = orderTotal(order.lines);
  } catch {
    errors.push('Use positive whole quantities and valid product prices.');
  }
  let allocated = 0;
  for (const payment of order.payments) {
    if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0)
      errors.push('Payment amounts must be positive, exact currency values.');
    if (payment.method === 'TRANSFER' && !payment.reference.trim())
      errors.push('A bank transfer reference is required.');
    if (
      payment.method === 'DEBT' &&
      (!order.customer.trim() || order.customer === 'Walk-in customer' || !order.contact.trim())
    )
      errors.push('Debt requires a named customer and contact details.');
    allocated += payment.amount;
  }
  if (!Number.isSafeInteger(allocated) || allocated > total)
    errors.push('Tender allocations cannot exceed the order total.');
  return errors;
}
/**
 * @description Resolves settlement from tender components; debt is never counted as received money.
 * @param order Existing unpaid preview order.
 * @param payments Additional positive tender components.
 * @returns An immutable updated order waiting for explicit dispatch or further settlement.
 * @throws {Error} When input is invalid, overpaid or already dispatched.
 */
export function recordPayment(order: ReceptionOrder, payments: readonly Tender[]): ReceptionOrder {
  if (order.status === 'PUSHED') throw new Error('A dispatched record is read-only.');
  const result = { ...order, payments: [...order.payments, ...payments] };
  const errors = validateOrder(result);
  if (errors.length) throw new Error(errors.join(' '));
  const allocated = result.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const debt = result.payments.some((payment) => payment.method === 'DEBT');
  const status: OrderStatus =
    allocated !== orderTotal(order.lines)
      ? 'PENDING_SETTLEMENT'
      : debt
        ? order.creditAuthorized
          ? 'CREDIT_APPROVED_PENDING_DISPATCH'
          : 'PENDING_SETTLEMENT'
        : 'PAID_PENDING_DISPATCH';
  return { ...result, status };
}
/**
 * @description Models the separate, explicit Reception dispatch action, with no fulfillment or inventory write.
 * @param order Settled or explicitly credit-authorized preview order.
 * @returns The same immutable record marked pushed; repeat requests are harmless.
 * @throws {Error} If tender allocation or credit authorization does not permit dispatch.
 */
export function pushOrder(order: ReceptionOrder): ReceptionOrder {
  if (order.status === 'PUSHED') return order;
  const settled = recordPayment(order, []);
  if (!['PAID_PENDING_DISPATCH', 'CREDIT_APPROVED_PENDING_DISPATCH'].includes(settled.status))
    throw new Error('Complete payment or obtain authorized credit approval before dispatch.');
  return { ...settled, status: 'PUSHED' };
}
/**
 * @description Validates each saved preview record before exposing browser-controlled data to the UI.
 * @param raw Saved JSON, untrusted even when produced by this browser.
 * @returns Recovered records or null; invalid storage is retained for recovery rather than overwritten.
 */
export function parseOrders(raw: string | null): ReceptionOrder[] | null {
  if (raw === null) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    const result: ReceptionOrder[] = [];
    for (const value of data) {
      if (
        !value ||
        typeof value !== 'object' ||
        typeof value.id !== 'string' ||
        typeof value.customer !== 'string' ||
        typeof value.contact !== 'string' ||
        typeof value.createdAt !== 'string' ||
        !Number.isFinite(Date.parse(value.createdAt)) ||
        typeof value.creditAuthorized !== 'boolean' ||
        !Array.isArray(value.lines) ||
        !Array.isArray(value.payments)
      )
        return null;
      const lines: OrderLine[] = [];
      for (const line of value.lines) {
        if (
          !line ||
          typeof line !== 'object' ||
          typeof line.sku !== 'string' ||
          typeof line.name !== 'string' ||
          typeof line.quantity !== 'number' ||
          typeof line.unitPrice !== 'number'
        )
          return null;
        lines.push({
          sku: line.sku,
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        });
      }
      const payments: Tender[] = [];
      for (const payment of value.payments) {
        if (
          !payment ||
          typeof payment !== 'object' ||
          !['CASH', 'TRANSFER', 'DEBT'].includes(payment.method) ||
          typeof payment.amount !== 'number' ||
          typeof payment.reference !== 'string'
        )
          return null;
        payments.push({
          method: payment.method,
          amount: payment.amount,
          reference: payment.reference,
        });
      }
      const candidate: ReceptionOrder = {
        id: value.id,
        customer: value.customer,
        contact: value.contact,
        createdAt: value.createdAt,
        creditAuthorized: value.creditAuthorized,
        lines,
        payments,
        status: 'PENDING_SETTLEMENT',
      };
      if (validateOrder(candidate).length) return null;
      const settled = recordPayment(candidate, []);
      if (value.status === 'PUSHED') {
        if (settled.status === 'PENDING_SETTLEMENT') return null;
        result.push({ ...settled, status: 'PUSHED' });
      } else if (value.status === settled.status) result.push(settled);
      else return null;
    }
    return new Set(result.map((order) => order.id)).size === result.length ? result : null;
  } catch {
    return null;
  }
}
export interface TenderInput {
  cash: string;
  transfer: string;
  debt: string;
  reference: string;
}
/**
 * @description Rejects malformed decimal fields before creating positive tender allocations.
 * @param input Cash, transfer and debt strings from the Reception form.
 * @returns Nonzero tender components with amounts in integer kobo.
 * @throws {Error} For negative, non-decimal or out-of-range amounts.
 */
export function captureTenders(input: TenderInput): Tender[] {
  const methods = [
    { field: input.cash, method: 'CASH' },
    { field: input.transfer, method: 'TRANSFER' },
    { field: input.debt, method: 'DEBT' },
  ] as const;
  const result: Tender[] = [];
  for (const { field, method } of methods) {
    const amount = parseMoney(field);
    if (amount === null)
      throw new Error('Enter nonnegative payment amounts with at most two decimal places.');
    if (amount > 0)
      result.push({ method, amount, reference: method === 'TRANSFER' ? input.reference : '' });
  }
  return result;
}
