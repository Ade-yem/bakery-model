/** @file Local workspace recovery never silently overwrites invalid records. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadReceptionRecords, storageKey } from '../storage';
import { receptionOrders } from '../data';
afterEach(() => vi.unstubAllGlobals());
describe('Reception workspace recovery', () => {
  it('uses synthetic fixtures when no browser value exists', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => null });
    expect(loadReceptionRecords()).toEqual({ orders: receptionOrders, error: '' });
  });
  it('recovers valid saved orders and an intentionally empty record set', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: (key: string) => key === storageKey ? JSON.stringify(receptionOrders) : null });
    expect(loadReceptionRecords().orders).toEqual(receptionOrders);
    vi.stubGlobal('localStorage', { getItem: (key: string) => key === storageKey ? '[]' : null });
    expect(loadReceptionRecords()).toEqual({ orders: [], error: '' });
  });
  it('retains corrupt data for recovery instead of writing replacement fixtures', () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => '{broken', setItem });
    expect(loadReceptionRecords().error).toContain('not been overwritten');
    expect(setItem).not.toHaveBeenCalled();
  });
  it('shows unavailable storage explicitly without reporting a successful load', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage blocked');
      },
    });
    expect(loadReceptionRecords().error).toContain('unavailable');
  });
});
