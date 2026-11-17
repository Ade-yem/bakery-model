/** @file Reception preview calculations and dispatch boundaries, tested before implementation. */
import { describe, expect, it } from 'vitest';
import {
  parseMoney,
  orderTotal,
  validateOrder,
  recordPayment,
  pushOrder,
  parseOrders,
} from '../orders';
import type { ReceptionOrder } from '../orders';
const order: ReceptionOrder = {
  id: 'ORD-TEST',
  customer: 'Walk-in customer',
  contact: '',
  createdAt: '2026-11-04T09:00:00Z',
  lines: [{ sku: 'FG-001', name: 'Family loaf · 500g', quantity: 2, unitPrice: 150000 }],
  payments: [],
  status: 'PENDING_SETTLEMENT',
  creditAuthorized: false,
};
describe('Reception money and settlement', () => {
  it('parses currency exactly into safe integer kobo', () => {
    expect(parseMoney('1500.25')).toBe(150025);
    expect(parseMoney('0')).toBe(0);
    for (const text of ['-1', '1.005', '1e3', 'Infinity', '', '9007199254740991'])
      expect(parseMoney(text)).toBeNull();
  });
  it('calculates line totals without floating point currency', () => {
    expect(orderTotal(order.lines)).toBe(300000);
    expect(orderTotal([{ ...order.lines[0], quantity: 3, unitPrice: 125025 }])).toBe(375075);
  });
  it('requires positive whole quantities and at least one product', () => {
    expect(validateOrder({ ...order, lines: [] })).toContain('Add at least one product.');
    expect(
      validateOrder({ ...order, lines: [{ ...order.lines[0], quantity: 0 }] }).length
    ).toBeGreaterThan(0);
    expect(
      validateOrder({ ...order, lines: [{ ...order.lines[0], quantity: 1.5 }] }).length
    ).toBeGreaterThan(0);
  });
  it('requires a reference for bank transfers and customer contact for debt', () => {
    expect(
      validateOrder({
        ...order,
        payments: [{ method: 'TRANSFER', amount: 300000, reference: '' }],
      }).join(' ')
    ).toContain('reference');
    expect(
      validateOrder({
        ...order,
        payments: [{ method: 'DEBT', amount: 300000, reference: '' }],
      }).join(' ')
    ).toContain('customer');
  });
  it('allows split tender, excludes transfer/debt from cash received and blocks overpayment', () => {
    const result = recordPayment(order, [
      { method: 'CASH', amount: 100000, reference: '' },
      { method: 'TRANSFER', amount: 200000, reference: 'BANK-42' },
    ]);
    expect(result.status).toBe('PAID_PENDING_DISPATCH');
    expect(
      result.payments.filter((p) => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0)
    ).toBe(100000);
    expect(() =>
      recordPayment(order, [{ method: 'CASH', amount: 300001, reference: '' }])
    ).toThrow();
  });
  it('keeps credit separate from received money and requires authorized credit before dispatch', () => {
    const result = recordPayment(
      { ...order, customer: 'Breakfast Club', contact: 'sample-contact' },
      [{ method: 'DEBT', amount: 300000, reference: '' }]
    );
    expect(result.status).toBe('PENDING_SETTLEMENT');
    expect(() => pushOrder(result)).toThrow();
    expect(
      recordPayment(
        { ...order, customer: 'Breakfast Club', contact: 'sample-contact', creditAuthorized: true },
        [{ method: 'DEBT', amount: 300000, reference: '' }]
      ).status
    ).toBe('CREDIT_APPROVED_PENDING_DISPATCH');
  });
});
describe('Explicit manual dispatch', () => {
  it('does not push an order just because it is paid', () => {
    const paid = recordPayment(order, [{ method: 'CASH', amount: 300000, reference: '' }]);
    expect(paid.status).toBe('PAID_PENDING_DISPATCH');
    expect(pushOrder(paid).status).toBe('PUSHED');
    expect(paid.status).toBe('PAID_PENDING_DISPATCH');
  });
  it('makes repeat dispatch safe and never fulfills or changes stock', () => {
    const pushed = pushOrder(
      recordPayment(order, [{ method: 'CASH', amount: 300000, reference: '' }])
    );
    expect(pushOrder(pushed)).toEqual(pushed);
    expect(pushed).not.toHaveProperty('stock');
    expect(() => recordPayment(pushed, [{ method: 'CASH', amount: 1, reference: '' }])).toThrow();
  });
  it('recovers valid preview records and rejects corrupt or inconsistent saved data', () => {
    expect(parseOrders(JSON.stringify([order]))).toEqual([order]);
    for (const raw of [
      null,
      '{',
      '{}',
      '[{"id":"x"}]',
      JSON.stringify([
        {
          ...order,
          payments: [{ method: 'CASH', amount: 300000, reference: '' }],
          status: 'FULFILLED',
        },
      ]),
    ])
      expect(parseOrders(raw)).toBeNull();
  });
});

describe('Tender input capture', () => {
  it('omits zero allocations and rejects malformed currency before constructing tenders', async () => {
    const { captureTenders } = await import('../orders');
    expect(captureTenders({ cash: '1500.25', transfer: '0', debt: '0', reference: '' })).toEqual([
      { method: 'CASH', amount: 150025, reference: '' },
    ]);
    expect(() => captureTenders({ cash: '-1', transfer: '0', debt: '0', reference: '' })).toThrow();
  });
});
