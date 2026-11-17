import { describe, expect, it } from 'vitest';
import { makeRepayment, outstanding } from '../repayments';
import { receptionOrders } from '../data';
describe('customer repayments', () => {
  const order = receptionOrders.find((o) => o.payments.some((p) => p.method === 'DEBT'))!;
  it('reduces debt through linked evidence without changing the original order', () => {
    const debt = outstanding(order, []);
    const entry = makeRepayment(receptionOrders, [], {
      id: 'RP-one',
      orderId: order.id,
      amount: '10.25',
      method: 'CASH',
      reference: '',
    });
    expect(outstanding(order, [entry])).toBe(debt - 1025);
    expect(outstanding(order, [])).toBe(debt);
    expect(() =>
      makeRepayment(receptionOrders, [entry], {
        id: 'RP-one',
        orderId: order.id,
        amount: '10.25',
        method: 'CASH',
        reference: '',
      })
    ).toThrow();
  });
  it('requires transfer evidence and rejects overpayments', () => {
    expect(() =>
      makeRepayment(receptionOrders, [], {
        id: 'RP-new',
        orderId: order.id,
        amount: '10',
        method: 'TRANSFER',
        reference: '',
      })
    ).toThrow();
    expect(() =>
      makeRepayment(receptionOrders, [], {
        id: 'RP-new',
        orderId: order.id,
        amount: '999999999',
        method: 'CASH',
        reference: '',
      })
    ).toThrow();
  });
});
