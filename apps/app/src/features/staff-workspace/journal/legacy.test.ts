import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJournal, journalKey } from './legacy';
afterEach(() => vi.unstubAllGlobals());
describe('legacy device evidence recovery', () => {
  it('returns an empty archive without creating records when no evidence exists', () => {
    vi.stubGlobal('window', {});
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem: () => null, setItem });
    expect(readJournal().events).toEqual([]);
    expect(setItem).not.toHaveBeenCalled();
  });
  it('preserves corrupt evidence rather than replacing it', () => {
    vi.stubGlobal('window', {});
    const setItem = vi.fn();
    const data = new Map([[journalKey, '{broken']]);
    vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key), setItem });
    expect(() => readJournal()).toThrow();
    expect(data.get(journalKey)).toBe('{broken');
    expect(setItem).not.toHaveBeenCalled();
  });
  it('recovers pending and conflict evidence without changing stable IDs or attribution', () => {
    const event = {
      id: 'saved-event',
      department: 'production',
      actor: 'saved-actor',
      recordKey: 'saved-record',
      sequence: 1,
      at: '2026-11-21T00:00:00Z',
      payload: '[]',
      state: 'CONFLICT',
      message: 'Retained conflict',
    };
    const raw = JSON.stringify({ version: 1, records: { 'saved-record': '[]' }, events: [event] });
    vi.stubGlobal('window', {});
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem: () => raw, setItem });
    expect(readJournal().events).toEqual([event]);
    expect(setItem).not.toHaveBeenCalled();
  });
  it('rejects projections that do not match event evidence', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({ version: 1, records: { missing: '[]' }, events: [] }),
    });
    expect(() => readJournal()).toThrow(/evidence/);
  });
  it('surfaces storage denial without assuming the archive is empty', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage denied');
      },
    });
    expect(() => readJournal()).toThrow('Storage denied');
  });
});
