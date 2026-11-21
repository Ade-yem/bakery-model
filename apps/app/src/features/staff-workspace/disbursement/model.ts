export type Product = string;
export interface StockLine {
  product: Product;
  quantity: number;
}
export interface TransferProjection {
  id: string;
  batchId?: string;
  product: Product;
  submitted: number;
  time: string;
}
export interface OrderProjection {
  id: string;
  reference: string;
  product: Product;
  quantity: number;
  time: string;
  lines?: StockLine[];
}
export interface StockSource {
  products: Record<string, string>;
  opening: Record<string, number>;
  transfers: TransferProjection[];
  orders: OrderProjection[];
}
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
export const initialState: State = { events: [] };
export function balances(state: State, opening: Record<string, number>): Record<Product, number> {
  const result = { ...opening };
  for (const event of state.events) {
    if (event.kind === 'accept') result[event.product] += event.quantity;
    if (event.kind === 'fulfill') result[event.product] -= event.quantity;
  }
  return result;
}
/** Append movement evidence. Reject duplicate transitions and never let counts rewrite stock. */
export function applyAction(
  state: State,
  action: Action,
  source: StockSource,
  at = new Date().toISOString()
): State {
  if (
    action.kind !== 'count' &&
    state.events.some((e) => e.kind === action.kind && e.id === action.id)
  )
    throw new Error('This record has already been completed.');
  if (action.kind === 'fulfill') {
    const order = source.orders.find((item) => item.id === action.id);
    if (!order) throw new Error('Only pushed orders can be fulfilled.');
    const lines = order.lines ?? [{ product: order.product, quantity: order.quantity }];
    const stock = balances(state, source.opening);
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
    const transfer = source.transfers.find((item) => item.id === action.id);
    if (!transfer) throw new Error('Transfer not found.');
    product = transfer.product;
    expected = transfer.submitted;
  } else {
    if (!Object.hasOwn(source.products, action.id)) throw new Error('Product not found.');
    product = action.id as Product;
    expected = balances(state, source.opening)[product];
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
export function parseState(raw: string, source: StockSource): State | null {
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
      const next = applyAction(state, action, source, event.at);
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
