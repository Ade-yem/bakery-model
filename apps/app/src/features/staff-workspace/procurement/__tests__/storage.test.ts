/** @file Unit tests for procurement localStorage persistence, corruption safety, and reset. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialProcurementSnapshot } from './fixtures/data';
import {
  loadProcurementPreview,
  resetProcurementPreview,
  saveProcurementPreview,
  storageKey,
} from './fixtures/storage';

afterEach(() => vi.unstubAllGlobals());

describe('Procurement preview storage', () => {
  it('TEST-PROC-008: seeds initial fixtures when localStorage is empty', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => null });

    expect(loadProcurementPreview()).toEqual({
      snapshot: initialProcurementSnapshot,
      error: '',
    });
  });

  it('TEST-PROC-009: preserves corrupt or inconsistent storage without overwriting it', () => {
    const setItem = vi.fn();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: () => '{invalid-json', setItem });

    const broken = loadProcurementPreview();
    expect(broken.error).toContain('not been overwritten');
    expect(setItem).not.toHaveBeenCalled();

    const badSnapshot = {
      ...initialProcurementSnapshot,
      materials: [{ ...initialProcurementSnapshot.materials[0], currentStock: -3 }],
    };
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify(badSnapshot),
      setItem,
    });
    const invalidState = loadProcurementPreview();
    expect(invalidState.error).toContain('not been overwritten');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('TEST-PROC-010: saves valid snapshots and resets demo data cleanly', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });

    const modified = {
      ...initialProcurementSnapshot,
      suppliers: [
        ...initialProcurementSnapshot.suppliers,
        {
          id: 'SUP-099',
          name: 'Demo Vendor',
          category: 'Dairy',
          contactName: 'Ayo',
          phone: '0801',
          email: 'ayo@demo.ng',
          leadTimeDays: 1,
        },
      ],
    };

    expect(saveProcurementPreview(modified)).toBeNull();
    expect(loadProcurementPreview().snapshot.suppliers.length).toBe(4);

    const resetResult = resetProcurementPreview();
    expect(resetResult.error).toBe('');
    expect(resetResult.snapshot).toEqual(initialProcurementSnapshot);
    expect(JSON.parse(store.get(storageKey) ?? '{}').suppliers.length).toBe(3);
  });
});
