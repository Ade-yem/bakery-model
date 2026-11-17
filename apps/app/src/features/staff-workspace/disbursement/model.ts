import { readRecord } from '../journal/store';
import {
  productionTransfers,
  pushedOrders,
  type TransferProjection,
  type OrderProjection,
} from '../../mock-auth/operations';
/** Synthetic quantity-only fixtures. Never import Reception financial records here. */
export const products = {
  loaf: 'Family loaf · 500g',
  sandwich: 'Sandwich bread · 1kg',
  pie: 'Meat pie',
};
export type Product = keyof typeof products;
export const transfers: { id: string; product: Product; submitted: number; time: string }[] = [
  { id: 'TRF-0186', product: 'loaf', submitted: 250, time: '09:35' },
  { id: 'TRF-0190', product: 'sandwich', submitted: 100, time: '08:40' },
];
/** Only explicitly pushed sample orders are supplied to this workspace. */
export const orders: OrderProjection[] = [
  { id: 'ORD-0241', reference: 'Pickup A-17', product: 'loaf', quantity: 50, time: '09:42' },
  { id: 'ORD-0242', reference: 'Pickup A-18', product: 'sandwich', quantity: 60, time: '09:50' },
];
export type Action =
  | { kind: 'accept' | 'count'; id: string; quantity: number; note: string }
  | { kind: 'fulfill'; id: string };
export interface Event {
  kind: Action['kind'];
  id: string;
  quantity: number;
  note: string;
  product: Product;
  expected: number;
  at: string;
}
export interface State {
  events: Event[];
}
export function getTransfers(): TransferProjection[] {
  const connected = productionTransfers();
  return [
    ...connected,
    ...transfers.filter((seed) => !connected.some((item) => item.id === seed.id)),
  ];
}
export function getOrders(): OrderProjection[] {
  const connected = pushedOrders();
  return [...connected, ...orders.filter((seed) => !connected.some((item) => item.id === seed.id))];
}
export const initialState: State = { events: [] };
export const storageKey = 'tallybakery:disbursement-records:v1';
export function balances(state: State): Record<Product, number> {
  const result = { loaf: 80, sandwich: 40, pie: 24 };
  for (const event of state.events) {
    if (event.kind === 'accept') result[event.product] += event.quantity;
    if (event.kind === 'fulfill') result[event.product] -= event.quantity;
  }
  return result;
}
/** Append sample evidence. Reject duplicate transitions and never let counts rewrite stock. */
export function applyAction(state: State, action: Action, at = new Date().toISOString()): State {
  if (
    action.kind !== 'count' &&
    state.events.some((e) => e.kind === action.kind && e.id === action.id)
  )
    throw new Error('This record has already been completed.');
  if (action.kind === 'fulfill') {
    const order = getOrders().find((item) => item.id === action.id);
    if (!order) throw new Error('Only pushed orders can be fulfilled.');
    const lines = order.lines ?? [{ product: order.product, quantity: order.quantity }];
    const stock = balances(state);
    if (lines.some((line) => stock[line.product] < line.quantity))
      throw new Error('Not enough accepted stock. Review incoming transfers first.');
    return {
      events: [
        ...state.events,
        ...lines.map((line) => ({
          kind: 'fulfill' as const,
          id: action.id,
          product: line.product,
          quantity: line.quantity,
          expected: line.quantity,
          note: '',
          at,
        })),
      ],
    };
  }
  const quantity = action.quantity;
  const note = action.note.trim();
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000)
    throw new Error('Enter a whole-unit count between 0 and 1,000,000.');
  if (note.length > 500) throw new Error('Keep the explanation within 500 characters.');
  let product: Product;
  let expected: number;
  if (action.kind === 'accept') {
    const transfer = getTransfers().find((item) => item.id === action.id);
    if (!transfer) throw new Error('Transfer not found.');
    product = transfer.product;
    expected = transfer.submitted;
  } else {
    if (!Object.hasOwn(products, action.id)) throw new Error('Product not found.');
    product = action.id as Product;
    expected = balances(state)[product];
  }
  if (quantity !== expected && !note)
    throw new Error('Explain the difference before confirming this count.');
  return {
    events: [
      ...state.events,
      { kind: action.kind, id: action.id, product, quantity, expected, note, at },
    ],
  };
}
/** Replay saved events through the same rules, retaining original evidence on invalid storage. */
export function parseState(raw: string): State | null {
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.events) || value.events.length > 10000) return null;
    let state = initialState;
    for (let index = 0; index < value.events.length;) {
      const event = value.events[index];
      if (
        !event ||
        !['accept', 'fulfill', 'count'].includes(event.kind) ||
        typeof event.id !== 'string' ||
        typeof event.note !== 'string' ||
        typeof event.at !== 'string' ||
        !Number.isFinite(Date.parse(event.at))
      )
        return null;
      const action =
        event.kind === 'fulfill'
          ? { kind: 'fulfill' as const, id: event.id }
          : { kind: event.kind, id: event.id, quantity: event.quantity, note: event.note };
      const next = applyAction(state, action, event.at);
      const added = next.events.slice(state.events.length);
      if (
        added.some(
          (canonical, offset) =>
            !value.events[index + offset] ||
            Object.keys(canonical).some(
              (key) => canonical[key as keyof Event] !== value.events[index + offset][key]
            )
        )
      )
        return null;
      index += added.length;
      state = next;
    }
    return state;
  } catch {
    return null;
  }
}
export function loadState(): { state: State; error: string } {
  if (typeof window === 'undefined') return { state: initialState, error: '' };
  try {
    getTransfers();
    getOrders();
    const raw = readRecord(storageKey);
    const state = raw === null ? initialState : parseState(raw);
    if (state) return { state, error: '' };
    return {
      state: initialState,
      error:
        'Saved records need attention. They have not been overwritten. Restore valid browser data or use another browser profile, then retry.',
    };
  } catch {
    return {
      state: initialState,
      error:
        'Browser storage is unavailable or contains invalid records. Saved evidence has not been overwritten. Allow storage or restore valid records, then retry.',
    };
  }
}
