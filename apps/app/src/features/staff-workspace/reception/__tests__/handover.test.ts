import { describe, expect, it } from 'vitest';
import { cashSummary } from '../handover';
import { receptionOrders } from '../../__tests__/fixtures/reception';
import { submitOutgoing } from '../../handover/model';
describe('Reception cash reconciliation', () => {
  it('uses supplied opening cash plus cash tender minus approved expenses, excluding transfers/debt', () => {
    expect(cashSummary(receptionOrders, 1000000, 150000)).toEqual({
      opening: 1000000,
      received: 5620000,
      expenses: 150000,
      expected: 6470000,
    });
  });
  it('requires explanations for deficits and preserves independent count evidence', () => {
    const lines = [{ id: 'cash', label: 'Cash drawer', expected: 6470000, scale: 100 as const }];
    expect(() => submitOutgoing(lines, { cash: '64000' }, '', 'outgoing-user')).toThrow();
    const record = submitOutgoing(lines, { cash: '64000' }, 'Count short', 'outgoing-user');
    expect(record.status).toBe('AWAITING_INCOMING_SIGNOFF');
    expect(record.outgoing.counts.cash).toBe(6400000);
    expect(record.lines[0].expected).toBe(6470000);
  });
  it('rejects unsafe or negative ledger values', () => {
    expect(() => cashSummary([], -1, 0)).toThrow();
    expect(() => cashSummary([], Number.MAX_SAFE_INTEGER, 0, 1)).toThrow();
  });
  it('includes cash repayments separately from transfer/debt allocations', () => {
    expect(cashSummary([], 100000, 5000, 1025).expected).toBe(96025);
    expect(() => cashSummary([], 0, 0, -1)).toThrow();
  });
});
