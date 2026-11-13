/** @file Local preview recovery never silently overwrites invalid records. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadReceptionPreview } from '../storage';
import { receptionOrders } from '../data';
afterEach(() => vi.unstubAllGlobals());
describe('Reception preview recovery', () => {
  it('uses synthetic fixtures when no browser value exists', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => null });
    expect(loadReceptionPreview()).toEqual({ orders: receptionOrders, error: '' });
  });
  it('recovers valid saved orders and an intentionally empty record set', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(receptionOrders) });
    expect(loadReceptionPreview().orders).toEqual(receptionOrders);
    vi.stubGlobal('localStorage', { getItem: () => '[]' });
    expect(loadReceptionPreview()).toEqual({ orders: [], error: '' });
  });
  it('retains corrupt data for recovery instead of writing replacement fixtures', () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => '{broken', setItem });
    expect(loadReceptionPreview().error).toContain('not been overwritten');
    expect(setItem).not.toHaveBeenCalled();
  });
  it('shows unavailable storage explicitly without reporting a successful load', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage blocked');
      },
    });
    expect(loadReceptionPreview().error).toContain('unavailable');
  });
});
