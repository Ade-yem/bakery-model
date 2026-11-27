/** @file Validated browser localStorage persistence for the E-Procurement preview. */
import { initialProcurementSnapshot } from './data';
import type { ProcurementSnapshot } from './types';

export const storageKey = 'cadence:procurement-preview:v2';

export interface ProcurementLoadResult {
  snapshot: ProcurementSnapshot;
  error: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidSnapshot(value: unknown): value is ProcurementSnapshot {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  if (
    !Array.isArray(data.suppliers) ||
    !Array.isArray(data.materials) ||
    !Array.isArray(data.purchaseOrders) ||
    !Array.isArray(data.receipts) ||
    !Array.isArray(data.movements)
  ) {
    return false;
  }

  for (const s of data.suppliers) {
    if (!s || typeof s !== 'object' || !isNonEmptyString((s as Record<string, unknown>).id)) {
      return false;
    }
  }

  for (const m of data.materials) {
    if (!m || typeof m !== 'object') return false;
    const mat = m as Record<string, unknown>;
    if (
      !isNonEmptyString(mat.id) ||
      typeof mat.currentStock !== 'number' ||
      !Number.isSafeInteger(mat.currentStock) ||
      mat.currentStock < 0 ||
      typeof mat.minThreshold !== 'number' ||
      mat.minThreshold < 0
    ) {
      return false;
    }
  }

  return true;
}

/**
 * @description Loads and validates the procurement preview snapshot from localStorage without overwriting corrupt data.
 * @returns Initial fixtures on cold start, validated stored snapshot, or a recoverable error message.
 */
export function loadProcurementPreview(): ProcurementLoadResult {
  if (typeof window === 'undefined') {
    return { snapshot: initialProcurementSnapshot, error: '' };
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) {
      return { snapshot: initialProcurementSnapshot, error: '' };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSnapshot(parsed)) {
      return {
        snapshot: initialProcurementSnapshot,
        error:
          'Saved procurement preview data could not be validated. It has not been overwritten.',
      };
    }
    return { snapshot: parsed, error: '' };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        snapshot: initialProcurementSnapshot,
        error:
          'Saved procurement preview data is corrupted and has not been overwritten.',
      };
    }
    return {
      snapshot: initialProcurementSnapshot,
      error:
        'Browser storage is unavailable. Allow local storage and retry.',
    };
  }
}

/**
 * @description Persists a validated procurement snapshot to localStorage.
 * @param snapshot Validated procurement snapshot to store.
 * @returns Null on success, or a user-safe error message if browser storage fails.
 */
export function saveProcurementPreview(snapshot: ProcurementSnapshot): string | null {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
    return null;
  } catch {
    return 'Could not save preview changes to browser storage. Free space or enable local storage.';
  }
}

/**
 * @description Restores the initial seeded procurement fixtures in localStorage.
 * @returns Fresh load result containing initial fixtures and any storage error if saving failed.
 */
export function resetProcurementPreview(): ProcurementLoadResult {
  const error = saveProcurementPreview(initialProcurementSnapshot);
  return {
    snapshot: initialProcurementSnapshot,
    error: error ?? '',
  };
}

