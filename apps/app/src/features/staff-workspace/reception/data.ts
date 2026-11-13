/** @file Synthetic Reception fixtures. Never import Production records into this feature. */
import type { ReceptionOrder } from './orders';
export const receptionAccess = {
  enabledModules: ['orders', 'payments', 'customers'],
  permissions: [
    'orders:view',
    'payments:view',
    'customers:view',
    'records:view',
    'history:view',
    'schedule:view',
  ],
};
export const receptionProducts = [
  { sku: 'FG-001', name: 'Family loaf · 500g', unitPrice: 150000 },
  { sku: 'FG-002', name: 'Sandwich bread · 1kg', unitPrice: 250000 },
  { sku: 'FG-003', name: 'Meat pie', unitPrice: 120000 },
];
export const receptionOrders: ReceptionOrder[] = [
  {
    id: 'ORD-0248',
    customer: 'Adebayo Stores',
    contact: 'sample-contact-01',
    createdAt: '2026-11-04T08:42:00Z',
    lines: [{ ...receptionProducts[0], quantity: 120 }],
    payments: [{ method: 'TRANSFER', amount: 18000000, reference: 'SAMPLE-BANK-082' }],
    status: 'PAID_PENDING_DISPATCH',
    creditAuthorized: false,
  },
  {
    id: 'ORD-0247',
    customer: 'Walk-in customer',
    contact: '',
    createdAt: '2026-11-04T08:36:00Z',
    lines: [{ ...receptionProducts[2], quantity: 6 }],
    payments: [{ method: 'CASH', amount: 720000, reference: '' }],
    status: 'PUSHED',
    creditAuthorized: false,
  },
  {
    id: 'ORD-0246',
    customer: 'The Breakfast Club',
    contact: 'sample-contact-02',
    createdAt: '2026-11-04T08:18:00Z',
    lines: [{ ...receptionProducts[1], quantity: 40 }],
    payments: [
      { method: 'CASH', amount: 4000000, reference: '' },
      { method: 'DEBT', amount: 6000000, reference: '' },
    ],
    status: 'CREDIT_APPROVED_PENDING_DISPATCH',
    creditAuthorized: true,
  },
  {
    id: 'ORD-0245',
    customer: 'Grace Okafor',
    contact: 'sample-contact-03',
    createdAt: '2026-11-04T07:54:00Z',
    lines: [{ ...receptionProducts[0], quantity: 12 }],
    payments: [{ method: 'CASH', amount: 900000, reference: '' }],
    status: 'PENDING_SETTLEMENT',
    creditAuthorized: false,
  },
];
export const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
});
export const statusLabels = {
  PENDING_SETTLEMENT: 'Settlement required',
  PAID_PENDING_DISPATCH: 'Paid · awaiting push',
  CREDIT_APPROVED_PENDING_DISPATCH: 'Approved credit · awaiting push',
  PUSHED: 'Pushed to Disbursement',
};
