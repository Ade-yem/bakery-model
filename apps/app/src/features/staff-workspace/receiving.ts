/** Quantity-only receiving result returned by the current mock transport. */
import { loadState } from './disbursement/model';
export function receivingResult(batchId: string): { quantity: number; note: string } | null {
  const source = loadState();
  if (source.error) throw new Error(source.error);
  const id = batchId === 'BAT-0186' ? 'TRF-0186' : `TRF-${batchId.slice(4)}`;
  const accepted = source.state.events.find((event) => event.kind === 'accept' && event.id === id);
  return accepted ? { quantity: accepted.quantity, note: accepted.note } : null;
}
export function fulfilledQuantity(orderId: string): number | null {
  const source = loadState();
  if (source.error) throw new Error(source.error);
  const entries = source.state.events.filter(
    (event) => event.kind === 'fulfill' && event.id === orderId
  );
  return entries.length ? entries.reduce((sum, event) => sum + event.quantity, 0) : null;
}
