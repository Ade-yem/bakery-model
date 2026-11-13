/** @file Reception reconciliation excludes bank transfers and debt from physical cash. */
import { describe, expect, it } from 'vitest';
import { cashSummary, prepareHandover } from '../handover';
import { receptionOrders } from '../data';
describe('Reception outgoing cash handover', () => {
  it('uses opening float plus cash tender minus approved petty cash only', () => {
    expect(cashSummary(receptionOrders, 1000000, 150000)).toEqual({
      opening: 1000000,
      received: 5620000,
      expenses: 150000,
      expected: 6470000,
    });
  });
  it('captures a balanced count as an outgoing draft, not a sealed shift', () => {
    expect(prepareHandover(6470000, '64700', '')).toEqual({
      counted: 6470000,
      variance: 0,
      note: '',
      state: 'OUTGOING_DRAFT',
    });
  });
  it('requires an explanation for both deficit and surplus while allowing an unbalanced draft', () => {
    expect(() => prepareHandover(6470000, '64000', '')).toThrow();
    expect(() => prepareHandover(6470000, '65000', '')).toThrow();
    expect(
      prepareHandover(6470000, '64000', 'Count is short; manager review requested.').variance
    ).toBe(-70000);
  });
  it('rejects invalid money inputs rather than rounding authoritative figures', () => {
    expect(() => prepareHandover(6470000, '1.005', 'test')).toThrow();
    expect(() => cashSummary(receptionOrders, -1, 0)).toThrow();
  });
});

describe('Outgoing handover draft recovery', () => {
  it('recovers count evidence and rejects corrupt saved input', async () => {
    const { parseOutgoingDraft } = await import('../handover');
    expect(
      parseOutgoingDraft(
        JSON.stringify({ physical: '64000', note: 'Count short', expected: 6470000 })
      )
    ).toEqual({ physical: '64000', note: 'Count short', expected: 6470000 });
    for (const raw of [
      null,
      '{}',
      'bad JSON',
      JSON.stringify({ physical: '-1', note: '', expected: 0 }),
    ])
      expect(parseOutgoingDraft(raw)).toBeNull();
  });
});
