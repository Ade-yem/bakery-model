import { afterEach, describe, expect, it, vi } from 'vitest';
import { productionTransfers, pushedOrders } from './operations';
import { makeBatch, batchKey } from '../staff-workspace/production-store';
import { storageKey as orderKey } from '../staff-workspace/reception/storage';
import { receptionOrders, receptionProducts } from '../staff-workspace/reception/data';
import {
  applyAction,
  balances,
  initialState,
  parseState,
} from '../staff-workspace/disbursement/model';
afterEach(() => vi.unstubAllGlobals());
describe('connected staff transport', () => {
  function seed(status = 'PUSHED') {
    const batch = makeBatch(
      { product: 'Family loaf · 500g', output: '200', flour: '4', waste: '0', note: '' },
      'BAT-connected'
    );
    const order = {
      id: 'ORD-connected',
      customer: 'Private customer',
      contact: 'private-contact',
      createdAt: '2026-11-16T12:00:00Z',
      lines: [
        { ...receptionProducts[0], quantity: 5 },
        { ...receptionProducts[1], quantity: 2 },
      ],
      payments: [{ method: 'CASH', amount: 1250000, reference: '' }],
      status,
      creditAuthorized: false,
    };
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) =>
        key === batchKey
          ? JSON.stringify([batch])
          : key === orderKey
            ? JSON.stringify([...receptionOrders, order])
            : null,
    });
  }
  it('projects pending batches and only explicitly pushed orders without private fields', () => {
    seed();
    expect(productionTransfers().find((r) => r.id === 'TRF-connected')?.submitted).toBe(200);
    const projected = pushedOrders().find((r) => r.id === 'ORD-connected')!;
    expect(projected.lines).toEqual([
      { product: 'loaf', quantity: 5 },
      { product: 'sandwich', quantity: 2 },
    ]);
    expect(JSON.stringify(projected)).not.toMatch(
      /Private customer|private-contact|amount|unitPrice|payments|customer/
    );
    seed('PAID_PENDING_DISPATCH');
    expect(pushedOrders().some((r) => r.id === 'ORD-connected')).toBe(false);
  });
  it('atomically fulfills all product lines, replays safely and rejects a repeat', () => {
    seed();
    const accepted = applyAction(initialState, {
      kind: 'accept',
      id: 'TRF-connected',
      quantity: 198,
      note: 'Two damaged units',
    });
    const fulfilled = applyAction(accepted, { kind: 'fulfill', id: 'ORD-connected' });
    expect(balances(fulfilled)).toEqual({ loaf: 273, sandwich: 38, pie: 24 });
    expect(parseState(JSON.stringify(fulfilled))).toEqual(fulfilled);
    expect(() => applyAction(fulfilled, { kind: 'fulfill', id: 'ORD-connected' })).toThrow();
    expect(accepted.events).toHaveLength(1);
  });
});
