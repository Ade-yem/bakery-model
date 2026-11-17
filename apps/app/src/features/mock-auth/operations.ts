/** Mock transport projections. Consumers receive only the fields their department needs. */
import { loadBatches } from '../staff-workspace/production-store';
import { loadReceptionRecords } from '../staff-workspace/reception/storage';
export type StockProduct = 'loaf' | 'sandwich' | 'pie';
export interface StockLine {
  product: StockProduct;
  quantity: number;
}
export interface TransferProjection {
  id: string;
  batchId?: string;
  product: StockProduct;
  submitted: number;
  time: string;
}
export interface OrderProjection {
  id: string;
  reference: string;
  product: StockProduct;
  quantity: number;
  time: string;
  lines?: StockLine[];
}
const productBySku: Record<string, StockProduct> = {
  'FG-001': 'loaf',
  'FG-002': 'sandwich',
  'FG-003': 'pie',
};
export function productionTransfers(): TransferProjection[] {
  const source = loadBatches();
  if (source.error) throw new Error(source.error);
  return source.records
    .filter((batch) => batch.state === 'Pending acceptance')
    .map((batch) => ({
      id: batch.id === 'BAT-0186' ? 'TRF-0186' : `TRF-${batch.id.slice(4)}`,
      batchId: batch.id,
      product: batch.product === 'Family loaf · 500g' ? 'loaf' : 'sandwich',
      submitted: batch.quantity,
      time: batch.time,
    }));
}
export function pushedOrders(): OrderProjection[] {
  const source = loadReceptionRecords();
  if (source.error) throw new Error(source.error);
  return source.orders
    .filter((order) => order.status === 'PUSHED')
    .map((order) => {
      const grouped = new Map<StockProduct, number>();
      for (const line of order.lines) {
        const product = productBySku[line.sku];
        if (!product) throw new Error(`Unsupported fulfillment product on ${order.id}.`);
        grouped.set(product, (grouped.get(product) ?? 0) + line.quantity);
      }
      const lines = [...grouped].map(([product, quantity]) => ({ product, quantity }));
      return {
        id: order.id,
        reference: `Pickup ${order.id}`,
        product: lines[0].product,
        quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
        lines,
        time: new Date(order.createdAt).toLocaleTimeString('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });
}
