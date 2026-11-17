import { readRecord } from '../journal/store';
import { parseMoney, type ReceptionOrder } from './orders';
export interface Repayment {
  id: string;
  orderId: string;
  amount: number;
  method: 'CASH' | 'TRANSFER';
  reference: string;
  at: string;
}
export const repaymentKey = 'tallybakery:reception-repayments:v1';
export function outstanding(order: ReceptionOrder, entries: Repayment[]): number {
  return (
    order.payments.filter((p) => p.method === 'DEBT').reduce((sum, p) => sum + p.amount, 0) -
    entries.filter((p) => p.orderId === order.id).reduce((sum, p) => sum + p.amount, 0)
  );
}
export function makeRepayment(
  orders: ReceptionOrder[],
  entries: Repayment[],
  input: { id: string; orderId: string; amount: string; method: string; reference: string }
): Repayment {
  const order = orders.find((item) => item.id === input.orderId);
  const amount = parseMoney(input.amount);
  if (!order || !amount || amount > outstanding(order, entries))
    throw new Error('Enter an amount greater than zero and no more than the outstanding debt.');
  if (!/^RP-[a-z0-9-]+$/i.test(input.id) || entries.some((e) => e.id === input.id))
    throw new Error('Repayment reference already recorded or invalid.');
  if (!['CASH', 'TRANSFER'].includes(input.method))
    throw new Error('Choose cash or bank transfer.');
  if (input.reference.length > 100 || (input.method === 'TRANSFER' && !input.reference.trim()))
    throw new Error('Enter a bank transfer reference of up to 100 characters.');
  return {
    id: input.id,
    orderId: order.id,
    amount,
    method: input.method as Repayment['method'],
    reference: input.reference.trim(),
    at: new Date().toISOString(),
  };
}
export function loadRepayments(orders: ReceptionOrder[]): { entries: Repayment[]; error: string } {
  if (typeof window === 'undefined') return { entries: [], error: '' };
  try {
    const raw = readRecord(repaymentKey);
    if (!raw) return { entries: [], error: '' };
    const values = JSON.parse(raw);
    if (!Array.isArray(values) || values.length > 10000) throw new Error();
    const entries: Repayment[] = [];
    for (const value of values) {
      if (
        !value ||
        !Number.isSafeInteger(value.amount) ||
        typeof value.at !== 'string' ||
        !Number.isFinite(Date.parse(value.at))
      )
        throw new Error();
      const canonical = makeRepayment(orders, entries, {
        ...value,
        amount: `${Math.floor(value.amount / 100)}.${String(value.amount % 100).padStart(2, '0')}`,
      });
      entries.push({ ...canonical, at: value.at });
    }
    return { entries, error: '' };
  } catch {
    return {
      entries: [],
      error:
        'Saved repayment evidence is unavailable or invalid. It has not been overwritten. Restore valid storage and retry.',
    };
  }
}
