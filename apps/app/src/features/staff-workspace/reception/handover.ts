/** @file Workspace-only deterministic Reception cash reconciliation. */
import { type ReceptionOrder } from './orders';
/**
 * @description Separates physical cash from transfer evidence and receivables.
 * @param orders Recorded Reception orders.
 * @param opening Acknowledged opening drawer float in integer kobo.
 * @param expenses Approved petty-cash outflows in integer kobo.
 * @returns Source amounts and expected physical cash; no shift is sealed.
 * @throws {Error} For invalid or unsafe currency values.
 */
export function cashSummary(
  orders: ReceptionOrder[],
  opening: number,
  expenses: number,
  repayments = 0
) {
  if (![opening, expenses, repayments].every((value) => Number.isSafeInteger(value) && value >= 0))
    throw new Error('Invalid opening cash or approved expense amount.');
  const received = orders
    .flatMap((order) => order.payments)
    .filter((payment) => payment.method === 'CASH')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const expected = opening + received + repayments - expenses;
  if (
    !Number.isSafeInteger(received) ||
    !Number.isSafeInteger(opening + received) ||
    !Number.isSafeInteger(expected)
  )
    throw new Error('Cash totals exceed the supported range.');
  return { opening, received, expenses, expected };
}
