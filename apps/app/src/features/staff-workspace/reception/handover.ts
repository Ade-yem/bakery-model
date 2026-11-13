/** @file Preview-only deterministic Reception cash reconciliation. */
import { parseMoney, type ReceptionOrder } from './orders';
/**
 * @description Separates physical cash from transfer evidence and receivables.
 * @param orders Recorded sample Reception orders.
 * @param opening Acknowledged opening drawer float in integer kobo.
 * @param expenses Approved petty-cash outflows in integer kobo.
 * @returns Source amounts and expected physical cash; no shift is sealed.
 * @throws {Error} For invalid or unsafe currency values.
 */
export function cashSummary(orders: ReceptionOrder[], opening: number, expenses: number) {
  if (![opening, expenses].every((value) => Number.isSafeInteger(value) && value >= 0))
    throw new Error('Invalid opening cash or approved expense amount.');
  const received = orders
    .flatMap((order) => order.payments)
    .filter((payment) => payment.method === 'CASH')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const expected = opening + received - expenses;
  if (
    !Number.isSafeInteger(received) ||
    !Number.isSafeInteger(opening + received) ||
    !Number.isSafeInteger(expected)
  )
    throw new Error('Cash totals exceed the supported range.');
  return { opening, received, expenses, expected };
}
/**
 * @description Records outgoing count evidence without impersonating incoming staff or finalizing a shift.
 * @param expected Derived physical drawer amount in integer kobo.
 * @param physical Unsigned decimal physical count entered by the outgoing cashier.
 * @param note Explanation required for any nonzero variance.
 * @returns An outgoing sample draft; canonical sealing awaits the server and both signoffs.
 * @throws {Error} For malformed counts or an unexplained difference.
 */
export function prepareHandover(expected: number, physical: string, note: string) {
  const counted = parseMoney(physical);
  if (counted === null || !Number.isSafeInteger(expected))
    throw new Error('Enter a valid physical cash count with at most two decimal places.');
  const variance = counted - expected;
  if (!Number.isSafeInteger(variance)) throw new Error('Variance exceeds the supported range.');
  if (variance !== 0 && !note.trim())
    throw new Error('Explain the cash difference before saving your outgoing handover.');
  return { counted, variance, note: note.trim(), state: 'OUTGOING_DRAFT' as const };
}
/**
 * @description Recovers known outgoing count fields without finalizing or trusting unknown browser properties.
 * @param raw Locally stored sample draft JSON.
 * @returns Valid count evidence or null for missing/corrupt data.
 */
export function parseOutgoingDraft(
  raw: string | null
): { physical: string; note: string; expected: number } | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      !('physical' in value) ||
      !('note' in value) ||
      !('expected' in value) ||
      typeof value.physical !== 'string' ||
      typeof value.note !== 'string' ||
      typeof value.expected !== 'number'
    )
      return null;
    prepareHandover(value.expected, value.physical, value.note);
    return { physical: value.physical, note: value.note, expected: value.expected };
  } catch {
    return null;
  }
}
