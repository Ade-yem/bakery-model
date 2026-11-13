/** @file Validated browser storage for synthetic Reception records only. */
import { receptionOrders } from './data';
import { parseOrders, type ReceptionOrder } from './orders';
export const storageKey = 'tallybakery:reception-preview:v1';
interface Snapshot {
  orders: ReceptionOrder[];
  error: string;
}
/**
 * @description Recovers only validated local sample data, preserving corrupt storage instead of overwriting it.
 * @returns Existing preview orders, initial fixtures or an explicit recoverable storage error.
 */
export function loadReceptionPreview(): Snapshot {
  if (typeof window === 'undefined') return { orders: receptionOrders, error: '' };
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return { orders: receptionOrders, error: '' };
    const orders = parseOrders(raw);
    return orders
      ? { orders, error: '' }
      : {
          orders: [],
          error:
            'Saved preview records could not be read. They have not been overwritten. Restore a valid saved value or use another browser profile, then retry.',
        };
  } catch {
    return {
      orders: [],
      error:
        'Browser storage is unavailable. Allow local storage and retry; no order has been discarded or sent.',
    };
  }
}
