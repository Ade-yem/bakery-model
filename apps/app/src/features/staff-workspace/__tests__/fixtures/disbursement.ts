import type { OrderProjection } from '../../disbursement/model';
export const products = {
  loaf: 'Family loaf · 500g',
  sandwich: 'Sandwich bread · 1kg',
  pie: 'Meat pie',
};
export type Product = keyof typeof products;
export const transfers: {
  id: string;
  product: keyof typeof products;
  submitted: number;
  time: string;
}[] = [
  { id: 'TRF-0186', product: 'loaf', submitted: 250, time: '09:35' },
  { id: 'TRF-0190', product: 'sandwich', submitted: 100, time: '08:40' },
];
/** Only explicitly pushed sample orders are supplied to this workspace. */
export const orders: OrderProjection[] = [
  { id: 'ORD-0241', reference: 'Pickup A-17', product: 'loaf', quantity: 50, time: '09:42' },
  { id: 'ORD-0242', reference: 'Pickup A-18', product: 'sandwich', quantity: 60, time: '09:50' },
];
