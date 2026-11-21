import { describe, expect, it } from 'vitest';
import { parseOrders } from '../orders';
import { receptionOrders } from '../../__tests__/fixtures/reception';
describe('Reception order snapshot validation', () => {
  it('accepts valid supplied orders and explicitly empty snapshots without seed fallback', () => {
    expect(parseOrders(JSON.stringify(receptionOrders))).toEqual(receptionOrders);
    expect(parseOrders('[]')).toEqual([]);
  });
  it('rejects corrupt snapshots rather than silently replacing them', () => {
    expect(parseOrders('{broken')).toBeNull();
    expect(parseOrders(JSON.stringify([{ ...receptionOrders[0], lines: null }]))).toBeNull();
  });
});
