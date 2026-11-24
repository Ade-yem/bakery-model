import { dataFor } from '../__tests__/fixtures/data';
import type { DisbursementData } from '../../integration/workspace';
import type { State, Action } from './model';
const source = dataFor('disbursement') as DisbursementData;
const applyAction = (state: State, action: Action) => apply(state, action, source);
const parseState = (raw: string) => parseLedger(raw, source);
import { describe, expect, it } from 'vitest';
import {
  applyAction as apply,
  balances as balance,
  initialState,
  parseState as parseLedger,
} from './model';

describe('Disbursement sample ledger', () => {
  it('adds only independently accepted quantities and preserves intake differences', () => {
    expect(balances(initialState).loaf).toBe(80);
    const next = applyAction(initialState, {
      kind: 'accept',
      id: 'TRF-0186',
      quantity: 248,
      note: 'Two damaged units',
    });
    expect(balances(next).loaf).toBe(328);
    expect(next.events[0].quantity).toBe(248);
    expect(() =>
      applyAction(next, { kind: 'accept', id: 'TRF-0186', quantity: 250, note: '' })
    ).toThrow();
    expect(() =>
      applyAction(initialState, { kind: 'accept', id: 'TRF-0186', quantity: 248, note: '' })
    ).toThrow();
  });
  it('fulfills pushed orders once and rejects unavailable quantities', () => {
    const next = applyAction(initialState, { kind: 'fulfill', id: 'ORD-0241' });
    expect(balances(next).loaf).toBe(30);
    expect(() => applyAction(next, { kind: 'fulfill', id: 'ORD-0241' })).toThrow();
    expect(() => applyAction(initialState, { kind: 'fulfill', id: 'ORD-0242' })).toThrow(/stock/i);
    expect(() => applyAction(initialState, { kind: 'fulfill', id: 'un-pushed' })).toThrow();
  });
  it('rejects invalid counts and retains immutable closing evidence', () => {
    for (const quantity of [-1, 1.2, NaN, Infinity]) {
      expect(() =>
        applyAction(initialState, { kind: 'accept', id: 'TRF-0186', quantity, note: '' })
      ).toThrow();
    }
    expect(() =>
      applyAction(initialState, { kind: 'count', id: 'loaf', quantity: 79, note: '' })
    ).toThrow();
    const next = applyAction(initialState, {
      kind: 'count',
      id: 'loaf',
      quantity: 79,
      note: 'Recount requested',
    });
    expect(balances(next).loaf).toBe(80);
    expect(next.events[0].expected).toBe(80);
    expect(initialState.events).toHaveLength(0);
  });
  it('validates saved state by replay and rejects corrupt or duplicate events', () => {
    const next = applyAction(initialState, { kind: 'fulfill', id: 'ORD-0241' });
    expect(parseState(JSON.stringify(next))).toEqual(next);
    expect(parseState('{')).toBeNull();
    expect(parseState(JSON.stringify({ events: [...next.events, ...next.events] }))).toBeNull();
    expect(
      parseState(JSON.stringify({ events: [{ ...next.events[0], quantity: 900 }] }))
    ).toBeNull();
  });
});

function balances(state: State) {
  return balance(state, source.opening);
}
